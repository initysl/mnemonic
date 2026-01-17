from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.utils.logger import logger
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager
from app.core.database import check_db_health, ensure_pgvector_extension, engine, Base
from app.api.v1 import api_router
from app.core.settings import get_settings

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

    # Create tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized")
    
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


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_methods_list,
    allow_headers=settings.cors_headers_list,
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