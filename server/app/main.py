from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.utils.logger import logger
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager
from app.core.database import check_db_health, ensure_pgvector_extension
from app.api.v1 import api_router
from app.core.settings import get_settings
from app.core.middleware import RequestIDMiddleware, TimingMiddleware
from app.core.rate_limit import RateLimiter, RateLimitMiddleware
from app.utils.exceptions import (
    EmbeddingGenerationError,
    LLMReasoningError,
    MnemonicException,
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up Mnemonic API...")
    
    # Check database connection
    if check_db_health():
        logger.info("Database connection healthy")
    else:
        logger.error("Database connection failed")
    
    ensure_pgvector_extension()

    if settings.web_concurrency > 1:
        logger.warning(
            "Running %s workers with the in-memory rate limiter: each worker "
            "keeps its own counters, so the effective limit is %s requests per "
            "minute per client, not %s. Use a shared store such as Redis.",
            settings.web_concurrency,
            settings.rate_limit_per_minute * settings.web_concurrency,
            settings.rate_limit_per_minute,
        )

    # Schema is owned by Alembic ("alembic upgrade head"), not by create_all():
    # create_all never applies column changes to an existing database and never
    # creates the HNSW indexes the similarity search depends on.

    yield
    
    logger.info("Shutting down Mnemonic API...")


docs_enabled = settings.resolved_docs_enabled

app = FastAPI(
    title="Mnemonic API",
    description="A voice-primary personal memory system",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if docs_enabled else None,
    redoc_url="/redoc" if docs_enabled else None,
    openapi_url="/openapi.json" if docs_enabled else None,
)


# Named rather than constructed inline so its state can be inspected and
# reset (the counters are process-global mutable state).
rate_limiter = RateLimiter(
    settings.rate_limit_per_minute,
    trusted_proxy_hops=settings.trusted_proxy_hops,
)

app.add_middleware(RateLimitMiddleware, rate_limiter=rate_limiter)
app.add_middleware(TimingMiddleware)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_methods_list,
    allow_headers=settings.cors_headers_list,
)


@app.exception_handler(EmbeddingGenerationError)
@app.exception_handler(LLMReasoningError)
async def upstream_service_exception_handler(request: Request, exc: MnemonicException):
    """
    An AI provider failed, which is an upstream outage rather than a bug.
    Reported as 503 with a retry hint so the client can say so, instead of the
    opaque 500 these used to produce.
    """
    logger.error("Upstream AI service failed: %s", exc.message, exc_info=True)
    return JSONResponse(
        status_code=503,
        content={
            "detail": "An AI service is temporarily unavailable. Please try again.",
            "request_id": getattr(request.state, "request_id", None),
        },
        headers={"Retry-After": "10"},
    )


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "request_id": getattr(request.state, "request_id", None)
        }
    )


app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "message": "Mnemonic API",
        "version": "1.0.0",
        "docs": "/docs"
    }
# Remeber to remove /docs, /db health for production

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True, log_level="info"
    )
