from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime


class EnhancedQueryRequest(BaseModel):
    """Request for LLM-powered query"""
    query: str = Field(..., min_length=1, description="User's question")
    top_k: int = Field(5, ge=1, le=10, description="Number of notes to retrieve")
    min_similarity: float = Field(0.3, ge=0.0, le=1.0, description="Minimum similarity")
    include_follow_ups: bool = Field(True, description="Generate follow-up questions")


class RetrievedNote(BaseModel):
    """Note retrieved from search"""
    id: UUID
    title: str
    content: str
    tags: List[str]
    similarity_score: float
    created_at: datetime


class EnhancedQueryResponse(BaseModel):
    """Response with LLM-generated answer"""
    query: str
    answer: str
    confidence: str  # "high", "medium", "low"
    retrieved_notes: List[RetrievedNote]
    cited_notes: List[UUID]
    follow_up_questions: Optional[List[str]] = None
    execution_time_ms: float