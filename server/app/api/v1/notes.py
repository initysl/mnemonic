from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from app.core.database import get_db
from app.schemas.note import (
    NoteCreate, 
    NoteUpdate, 
    NoteResponse, 
    NoteListResponse,
    NoteDeleteResponse
)
from app.services.note_service import NoteService

router = APIRouter(prefix="/notes", tags=["notes"])


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    """Create a new note"""
    created_note = NoteService.create_note(db, note)
    return created_note


@router.get("/", response_model=NoteListResponse)
def list_notes(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    db: Session = Depends(get_db)
):
    """Get paginated list of notes"""
    skip = (page - 1) * page_size
    notes, total = NoteService.get_notes(db, skip=skip, limit=page_size, tag=tag)
    
    return NoteListResponse(
        notes=notes, # type: ignore
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note_id: UUID, db: Session = Depends(get_db)):
    """Get a single note by ID"""
    note = NoteService.get_note(db, note_id)
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with id {note_id} not found"
        )
    
    return note


@router.put("/{note_id}", response_model=NoteResponse)
def update_note(note_id: UUID, note_update: NoteUpdate, db: Session = Depends(get_db)):
    """Update an existing note"""
    updated_note = NoteService.update_note(db, note_id, note_update)
    
    if not updated_note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with id {note_id} not found"
        )
    
    return updated_note


@router.delete("/{note_id}", response_model=NoteDeleteResponse)
def delete_note(note_id: UUID, db: Session = Depends(get_db)):
    """Delete a note"""
    deleted = NoteService.delete_note(db, note_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with id {note_id} not found"
        )
    
    return NoteDeleteResponse(
        message="Note deleted successfully",
        deleted_id=note_id
    )



@router.get("/stats", response_model=dict)
def get_note_stats(db: Session = Depends(get_db)):
    """Get note statistics"""
    stats = NoteService.get_note_statistics(db)
    return stats