from fastapi import APIRouter
from app.api.v1 import notes, search, health

api_router = APIRouter()

api_router.include_router(notes.router)
api_router.include_router(search.router)
api_router.include_router(health.router)
