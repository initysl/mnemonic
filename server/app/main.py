from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from contextlib import asynccontextmanager
from app.core.database import engine, Base
from app.api.v1 import notes_router
from app.api.v1.search import router as search_router
from app.api.v1.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up Mnemonic API...")
    # Create tables (use Alembic in production)
    Base.metadata.create_all(bind=engine)
    yield
    print("Shutting down Mnemonic API...")


app = FastAPI(
    title="Mnemonic API",
    description="A voice-primary personal memory system",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(notes_router)
app.include_router(search_router)

@app.get("/")
def root():
    return {
        "message": "Mnemonic API",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)