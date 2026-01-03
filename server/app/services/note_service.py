from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from uuid import UUID
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate


class NoteService:
    """Business logic for note operations"""
    
    @staticmethod
    def create_note(db: Session, note_data: NoteCreate) -> Note:
        """Create new note"""
        note = Note(
            title=note_data.title,
            content=note_data.content,
            tags=note_data.tags
        )
        db.add(note)
        db.commit()
        db.refresh(note)
        return note
    
    @staticmethod
    def get_note(db: Session, note_id: UUID) -> Optional[Note]:
        """Get single note by ID"""
        return db.query(Note).filter(Note.id == note_id).first()
    
    @staticmethod
    def get_notes(
        db: Session, 
        skip: int = 0, 
        limit: int = 20,
        tag: Optional[str] = None
    ) -> tuple[List[Note], int]:
        """Get paginated notes with optional tag filter"""
        query = db.query(Note)
        
        # Filter by tag if provided
        if tag:
            query = query.filter(Note.tags.contains([tag]))
        
        # Get total count
        total = query.count()
        
        # Get paginated results
        notes = query.order_by(desc(Note.created_at)).offset(skip).limit(limit).all()
        
        return notes, total
    
    @staticmethod
    def update_note(db: Session, note_id: UUID, note_data: NoteUpdate) -> Optional[Note]:
        """Update existing note"""
        note = db.query(Note).filter(Note.id == note_id).first()
        
        if not note:
            return None
        
        # Update only provided fields
        update_data = note_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(note, field, value)
        
        db.commit()
        db.refresh(note)
        return note
    
    @staticmethod
    def delete_note(db: Session, note_id: UUID) -> bool:
        """Delete note by ID"""
        note = db.query(Note).filter(Note.id == note_id).first()
        
        if not note:
            return False
        
        db.delete(note)
        db.commit()
        return True
    
    @staticmethod
    def get_all_tags(db: Session) -> List[str]:
        """Get all unique tags across notes"""
        result = db.query(func.unnest(Note.tags)).distinct().all()
        return [tag[0] for tag in result if tag[0]]