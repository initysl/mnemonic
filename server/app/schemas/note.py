from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import List, Optional, Dict
from datetime import datetime
from uuid import UUID


class NoteCreate(BaseModel):
    """Create new note"""
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1, max_length=50000)
    tags: List[str] = Field(default_factory=list, max_length=20)

    @field_validator("content")
    @classmethod
    def content_must_have_text(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Content cannot be blank")
        return value


class NoteUpdate(BaseModel):
    """Update existing note (all fields optional)"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1, max_length=50000)
    tags: Optional[List[str]] = Field(None, max_length=20)

    @field_validator("content")
    @classmethod
    def content_must_have_text(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and not value.strip():
            raise ValueError("Content cannot be blank")
        return value


class NoteResponse(BaseModel):
    """Note response"""
    id: UUID
    title: str
    content: str
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class NoteListResponse(BaseModel):
    """Paginated note list"""
    notes: List[NoteResponse]
    total: int
    page: int
    page_size: int


class NoteDeleteResponse(BaseModel):
    """Delete confirmation"""
    message: str
    deleted_id: UUID

class NoteDeleteAllResponse(BaseModel):
    """Bulk delete confirmation"""
    message: str
    deleted_count: int

class NoteStatsResponse(BaseModel):
    """Note statistics response"""
    total_notes: int
    tags_count: Dict[str, int]
