from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from uuid import UUID
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate
from app.services.embedding_service import embedding_service


class NoteService:
    """Logic for note operations"""
    
    @staticmethod
    def create_note(db: Session, note_data: NoteCreate) -> Note:
        """Create new note with embedding"""
        # Combine title and content for embedding
        text_to_embed = f"{note_data.title}\n{note_data.content}"
        
        # Generate embedding
        embedding = embedding_service.generate_embedding(text_to_embed)
        
        note = Note(
            title=note_data.title,
            content=note_data.content,
            tags=note_data.tags,
            embedding=embedding  # Add embedding
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
        
        if tag:
            query = query.filter(Note.tags.contains([tag]))
        
        total = query.count()
        notes = query.order_by(desc(Note.created_at)).offset(skip).limit(limit).all()
        
        return notes, total
    
    @staticmethod
    def update_note(db: Session, note_id: UUID, note_data: NoteUpdate) -> Optional[Note]:
        """Update existing note and regenerate embedding if content changed"""
        note = db.query(Note).filter(Note.id == note_id).first()
        
        if not note:
            return None
        
        update_data = note_data.model_dump(exclude_unset=True)
        
        # Check if title or content changed (need to regenerate embedding)
        content_changed = 'title' in update_data or 'content' in update_data
        
        for field, value in update_data.items():
            setattr(note, field, value)
        
        # Regenerate embedding if content changed
        if content_changed:
            text_to_embed = f"{note.title}\n{note.content}"
            note.embedding = embedding_service.generate_embedding(text_to_embed) # type: ignore
        
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
    
    @staticmethod
    def get_note_statistics(db: Session) -> dict:
        """Get statistics about notes"""
        total_notes = db.query(func.count(Note.id)).scalar()
        tags = NoteService.get_all_tags(db)
        return {
            "total_notes": total_notes,
            "unique_tags": len(tags),
            "tags": tags
        }