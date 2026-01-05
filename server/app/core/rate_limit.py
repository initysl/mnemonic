from fastapi import Request, HTTPException
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
    
    async def __call__(self, request: Request):
        client = request.client
        client_ip = client.host if client else "unknown"

        if not self.check_rate_limit(client_ip):
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again later."
            )


# Create rate limiter instance (60 requests per minute)
rate_limiter = RateLimiter(requests_per_minute=60)