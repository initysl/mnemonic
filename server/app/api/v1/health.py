from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.utils.logger import logger

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "service": "mnemonic-api"
    }


@router.get("/db")
def database_health(response: Response, db: Session = Depends(get_db)):
    """
    Check database connectivity.
    The failure detail is logged rather than returned: this endpoint is
    unauthenticated, and SQLAlchemy connection errors carry the database host,
    port, name and user.
    """
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception:
        logger.exception("Database health check failed")
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "unhealthy",
            "database": "disconnected"
        }