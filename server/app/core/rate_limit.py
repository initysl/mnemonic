from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict
from app.utils.logger import logger


class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, list] = defaultdict(list)
    
    def check_rate_limit(self, client_id: str) -> bool:
        """
        Check if client has exceeded rate limit
        Args:
            client_id: Client identifier (IP address)
        Returns:
            True if within limit, False if exceeded
        """
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)
        
        # Clean old requests
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id]
            if req_time > minute_ago
        ]
        
        # Check limit
        if len(self.requests[client_id]) >= self.requests_per_minute:
            logger.warning(f"Rate limit exceeded for client: {client_id}")
            return False
        
        # Record request
        self.requests[client_id].append(now)
        return True
    
    def client_id(self, request: Request) -> str:
        client = request.client
        return client.host if client else "unknown"


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
