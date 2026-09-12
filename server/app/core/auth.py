import os
import threading
import time
from typing import Any, Dict, Optional

from jose import jwt, JWTError
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import requests
from app.utils.logger import logger

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_AUDIENCE = os.getenv("AUTH0_AUDIENCE")
ALGORITHMS = ["RS256"]

# Auth0 rotates signing keys. Caching the key set forever means every request
# fails with "Unable to find appropriate key" from the moment of a rotation
# until the process is restarted, so the cache expires and a miss on an unknown
# key id forces one refresh before the token is rejected.
JWKS_CACHE_TTL_SECONDS = 600
JWKS_REFRESH_COOLDOWN_SECONDS = 60

security = HTTPBearer()

_jwks_lock = threading.Lock()
_jwks_cache: Optional[Dict[str, Any]] = None
_jwks_fetched_at: float = 0.0


def _fetch_jwks() -> Dict[str, Any]:
    """Fetch Auth0 public keys"""
    jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    try:
        response = requests.get(jwks_url, timeout=5)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error("Failed to fetch Auth0 JWKS: %s", e)
        raise


def get_jwks(force_refresh: bool = False) -> Dict[str, Any]:
    """
    Return the Auth0 key set, refreshing it when stale.
    Args:
        force_refresh: Refetch even if the cached copy is still fresh, subject
            to a cooldown so that a burst of tokens with an unknown key id
            cannot turn into a burst of requests to Auth0.
    """
    global _jwks_cache, _jwks_fetched_at

    with _jwks_lock:
        age = time.monotonic() - _jwks_fetched_at
        is_stale = _jwks_cache is None or age > JWKS_CACHE_TTL_SECONDS
        may_force = force_refresh and age > JWKS_REFRESH_COOLDOWN_SECONDS

        if is_stale or may_force:
            jwks = _fetch_jwks()
            _jwks_cache = jwks
            _jwks_fetched_at = time.monotonic()

        return _jwks_cache  # type: ignore[return-value]


def reset_jwks_cache() -> None:
    """Drop the cached key set (used by tests)."""
    global _jwks_cache, _jwks_fetched_at
    with _jwks_lock:
        _jwks_cache = None
        _jwks_fetched_at = 0.0


def _rsa_key_for(kid: str, jwks: Dict[str, Any]) -> Dict[str, str]:
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"],
            }
    return {}


def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """Verify Auth0 JWT token"""
    token = credentials.credentials

    try:
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        if not kid:
            raise HTTPException(401, "Invalid authentication token")

        rsa_key = _rsa_key_for(kid, get_jwks())

        # An unknown key id usually means the signing keys rotated since the
        # key set was cached, so refresh once before rejecting the token.
        if not rsa_key:
            logger.info("Unknown JWKS key id %s; refreshing key set", kid)
            rsa_key = _rsa_key_for(kid, get_jwks(force_refresh=True))

        if not rsa_key:
            raise HTTPException(401, "Unable to find appropriate key")

        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=ALGORITHMS,
            audience=API_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/"
        )

        return payload

    except HTTPException:
        raise
    except JWTError as e:
        logger.info("Invalid JWT: %s", e)
        raise HTTPException(401, "Invalid authentication token")
    except requests.RequestException:
        # Auth0 unreachable: this is our outage, not a bad credential.
        logger.exception("Could not reach Auth0 to verify token")
        raise HTTPException(503, "Authentication service unavailable")
    except Exception as e:
        logger.exception("Authentication verification failed: %s", e)
        raise HTTPException(401, "Authentication failed")

def get_user_id(token_payload: dict = Security(verify_token)) -> str:
    """Extract user ID from verified token"""
    user_id = token_payload.get("sub")
    if not user_id:
        raise HTTPException(401, "User ID not found in token")
    return user_id
