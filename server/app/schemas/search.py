from pydantic import BaseModel, Field
from typing import List
from uuid import UUID

from datetime import datetime


class SearchRequest(BaseModel):
    """Request schema for semantic search"""
    query: str = Field(..., min_length=1, description="Search query text")
    top_k: int = Field(5, ge=1, le=20, description="Number of results")
    min_similarity: float = Field(0.3, ge=0.0, le=1.0, description="Minimum similarity score")


class SearchResultItem(BaseModel):
    """Individual search result item"""
    id: UUID
    title: str
    content: str
    tags: List[str]
    similarity_score: float
    created_at: datetime


class SearchResponse(BaseModel):
    """Response schema for search results"""
    query: str
    results: List[SearchResultItem]
    total_results: int