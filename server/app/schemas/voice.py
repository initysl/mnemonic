from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class TranscriptionResponse(BaseModel):
    """Response after transcribing audio"""
    transcribed_text: str
    language: Optional[str] = None
    duration_ms: Optional[float] = None


class VoiceQueryResponse(BaseModel):
    """Response for voice search query"""
    transcribed_text: str
    query: str
    results: List["VoiceSearchResult"]
    total_results: int


class VoiceSearchResult(BaseModel):
    """Individual search result from voice query"""
    id: UUID
    title: str
    content: str
    tags: List[str]
    similarity_score: float
    created_at: datetime