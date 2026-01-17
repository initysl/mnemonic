from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Dict
from datetime import datetime
from uuid import UUID


class NoteCreate(BaseModel):
    """Create new note"""
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1)
    tags: List[str] = Field(default_factory=list)


class NoteUpdate(BaseModel):
    """Update existing note (all fields optional)"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = Field(None, min_length=1)
    tags: Optional[List[str]] = None


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
