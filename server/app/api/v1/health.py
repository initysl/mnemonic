from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/")
def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "service": "mnemonic-api"
    }


@router.get("/db")
def database_health(db: Session = Depends(get_db)):
    """Check database connectivity"""
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }