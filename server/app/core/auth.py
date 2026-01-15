import os
from jose import jwt, JWTError
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import requests
from functools import lru_cache

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_AUDIENCE = os.getenv("AUTH0_API_AUDIENCE")
ALGORITHMS = ["RS256"]

security = HTTPBearer()

@lru_cache()
def get_jwks():
    """Fetch Auth0 public keys"""
    jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    try:
        response = requests.get(jwks_url)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Failed to fetch JWKS: {e}")
        raise

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """Verify Auth0 JWT token"""
    token = credentials.credentials
    
    try:
        unverified_header = jwt.get_unverified_header(token)
        jwks = get_jwks()
        rsa_key = {}
        
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                break
        
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
        
    except JWTError as e:
        print(f"JWT Error: {e}")  # Debug logging
        raise HTTPException(401, f"Invalid token: {str(e)}")
    except Exception as e:
        print(f"Auth Error: {e}")  # Debug logging
        raise HTTPException(401, f"Authentication failed: {str(e)}")

def get_user_id(token_payload: dict = Security(verify_token)) -> str:
    """Extract user ID from verified token"""
    user_id = token_payload.get("sub")
    if not user_id:
        raise HTTPException(401, "User ID not found in token")
    return user_id