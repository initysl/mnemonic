from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from app.utils.logger import logger


class RateLimiter:
    """Simple in-memory rate limiter"""

    def __init__(self, requests_per_minute: int = 60, trusted_proxy_hops: int = 1):
        """
        Args:
            requests_per_minute: Allowed requests per client per minute
            trusted_proxy_hops: Number of reverse proxies in front of the app.
                X-Forwarded-For is client-controlled, so only the hops your own
                infrastructure appended can be trusted; everything to the left
                of them may be forged. 1 suits a single platform load balancer
                (Render, Fly, Heroku); use 0 when nothing fronts the app.
        """
        self.requests_per_minute = requests_per_minute
        self.trusted_proxy_hops = trusted_proxy_hops
        self.requests: Dict[str, List[datetime]] = {}

    def check_rate_limit(self, client_id: str) -> bool:
        """
        Check if client has exceeded rate limit
        Args:
            client_id: Client identifier (user ID or IP address)
        Returns:
            True if within limit, False if exceeded
        """
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)

        self._evict_idle_clients(minute_ago)

        # Clean old requests for this client
        recent = [
            req_time for req_time in self.requests.get(client_id, ())
            if req_time > minute_ago
        ]

        # Check limit
        if len(recent) >= self.requests_per_minute:
            self.requests[client_id] = recent
            logger.warning(f"Rate limit exceeded for client: {client_id}")
            return False

        # Record request
        recent.append(now)
        self.requests[client_id] = recent
        return True

    def _evict_idle_clients(self, cutoff: datetime) -> None:
        """
        Drop buckets with no requests inside the window.
        Without this the dict grows without bound, retaining a key for every
        distinct client the process has ever seen.
        """
        idle = [
            client_id
            for client_id, timestamps in self.requests.items()
            if not timestamps or timestamps[-1] <= cutoff
        ]
        for client_id in idle:
            del self.requests[client_id]

    def client_id(self, request: Request) -> str:
        """
        Identify the caller by originating IP.
        Keying on request.client.host alone puts every user behind a reverse
        proxy into a single shared bucket, where one caller locks out all the
        others, so prefer the address our own proxy recorded.

        Per-user keying is deliberately not attempted here: token verification
        is a route dependency and has not run yet when middleware executes, and
        trusting an unverified token from the request would let a caller pick
        their own bucket.
        """
        forwarded_ip = self._forwarded_for(request)
        if forwarded_ip:
            return f"ip:{forwarded_ip}"

        client = request.client
        return f"ip:{client.host}" if client else "unknown"

    def _forwarded_for(self, request: Request) -> Optional[str]:
        """The client IP as recorded by our own trusted proxy hops."""
        if self.trusted_proxy_hops <= 0:
            return None

        forwarded = request.headers.get("x-forwarded-for")
        if not forwarded:
            return None

        hops = [hop.strip() for hop in forwarded.split(",") if hop.strip()]
        if not hops:
            return None

        # Right-most entries are appended by infrastructure closest to us, so
        # they are the only ones a client cannot spoof.
        index = max(0, len(hops) - self.trusted_proxy_hops)
        return hops[index]


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Apply the local development limiter to API traffic.

    Use a shared store such as Redis when running more than one API instance.
    """

    def __init__(self, app, rate_limiter: RateLimiter):
        super().__init__(app)
        self.rate_limiter = rate_limiter

    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/api/"):
            client_id = self.rate_limiter.client_id(request)
            if not self.rate_limiter.check_rate_limit(client_id):
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests. Please try again later."},
                    headers={"Retry-After": "60"},
                )
        return await call_next(request)
