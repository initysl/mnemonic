import os
# from dotenv import load_dotenv
# load_dotenv()
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.pool import QueuePool
from typing import Generator
from app.utils.logger import logger
from app.core.settings import get_settings

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable is not set")

_settings = get_settings()

# Enhanced connection pooling
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    # Total capacity must cover the threadpool that runs sync handlers,
    # otherwise requests block on checkout. See Settings.db_pool_size.
    pool_size=_settings.db_pool_size,
    max_overflow=_settings.db_max_overflow,
    # Fail fast rather than tying up a worker for the 30s default.
    pool_timeout=_settings.db_pool_timeout,
    pool_pre_ping=True,    # Verify connections before using
    pool_recycle=3600,     # Recycle connections after 1 hour
    echo=False,            # Disable SQL logging (use logger instead)
    connect_args={
        "connect_timeout": 10,
        "options": "-c timezone=utc"
    }
)

# Log connection pool events
@event.listens_for(engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    logger.debug("Database connection established")

@event.listens_for(engine, "close")
def receive_close(dbapi_conn, connection_record):
    logger.debug("Database connection closed")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Database session dependency with logging"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {str(e)}", exc_info=True)
        db.rollback()
        raise
    finally:
        db.close()


def check_db_health() -> bool:
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.exception("Database health check failed")
        return False


def ensure_pgvector_extension() -> None:
    if engine.dialect.name != "postgresql":
        return

    try:
        with engine.begin() as connection:
            connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        logger.info("pgvector extension ensured")
    except Exception:
        logger.exception("Failed to ensure pgvector extension")
