from fastapi import APIRouter
from app.api.v1 import notes, search, voice, health, query

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(notes.router)
api_router.include_router(voice.router)
api_router.include_router(search.router)
api_router.include_router(query.router)
