from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from uuid import UUID
from app.models.note import Note
from app.models.note_chunk import NoteChunk
from app.schemas.note import NoteCreate, NoteUpdate
from app.services.chunking_service import split_note_content
from app.services.embedding_service import embedding_service


class NoteService:
    """Logic for note operations"""
    
    @staticmethod
    def create_note(db: Session, note_data: NoteCreate, user_id: str) -> Note:
        """Create new note with embedding for specific user"""
        chunks = split_note_content(note_data.content)
        embeddings = embedding_service.generate_batch_embeddings(
            [f"{note_data.title}\n{chunk.content}" for chunk in chunks]
        )
        
        note = Note(
            user_id=user_id,  # Add user_id
            title=note_data.title,
            content=note_data.content,
            tags=note_data.tags,
            embedding=embeddings[0],
            chunks=[
                NoteChunk(
                    content=chunk.content,
                    start_offset=chunk.start_offset,
                    end_offset=chunk.end_offset,
                    embedding=embedding,
                )
                for chunk, embedding in zip(chunks, embeddings)
            ],
        )
        db.add(note)
        db.commit()
        db.refresh(note)
        return note
    
    @staticmethod
    def get_note(db: Session, note_id: UUID, user_id: str) -> Optional[Note]:
        """Get single note by ID (must belong to user)"""
        return db.query(Note).filter(
            Note.id == note_id,
            Note.user_id == user_id
        ).first()
    
    @staticmethod
    def get_notes(
        db: Session,
        user_id: str,  # Add user_id parameter
        skip: int = 0, 
        limit: int = 20,
        tag: Optional[str] = None
    ) -> tuple[List[Note], int]:
        """Get paginated notes for specific user with optional tag filter"""
        query = db.query(Note).filter(Note.user_id == user_id)
        
        if tag:
            query = query.filter(Note.tags.contains([tag]))
        
        total = query.count()
        notes = query.order_by(desc(Note.created_at)).offset(skip).limit(limit).all()
        
        return notes, total
    
    @staticmethod
    def update_note(db: Session, note_id: UUID, note_data: NoteUpdate, user_id: str) -> Optional[Note]:
        """Update existing note (must belong to user) and regenerate embedding if content changed"""
        note = db.query(Note).filter(
            Note.id == note_id,
            Note.user_id == user_id
        ).first()
        
        if not note:
            return None
        
        update_data = note_data.model_dump(exclude_unset=True)
        
        # Check if title or content changed (need to regenerate embedding)
        content_changed = 'title' in update_data or 'content' in update_data
        
        for field, value in update_data.items():
            setattr(note, field, value)
        
        # Regenerate passage embeddings if title or content changed.
        if content_changed:
            chunks = split_note_content(note.content)
            embeddings = embedding_service.generate_batch_embeddings(
                [f"{note.title}\n{chunk.content}" for chunk in chunks]
            )
            note.embedding = embeddings[0]  # type: ignore
            note.chunks = [
                NoteChunk(
                    content=chunk.content,
                    start_offset=chunk.start_offset,
                    end_offset=chunk.end_offset,
                    embedding=embedding,
                )
                for chunk, embedding in zip(chunks, embeddings)
            ]
        
        db.commit()
        db.refresh(note)
        return note
    
    @staticmethod
    def delete_note(db: Session, note_id: UUID, user_id: str) -> bool:
        """Delete note by ID (must belong to user)"""
        note = db.query(Note).filter(
            Note.id == note_id,
            Note.user_id == user_id
        ).first()
        
        if not note:
            return False
        
        db.delete(note)
        db.commit()
        return True

    @staticmethod
    def delete_all_notes(db: Session, user_id: str) -> int:
        """Delete all notes for user and return count"""
        deleted_count = (
            db.query(Note)
            .filter(Note.user_id == user_id)
            .delete(synchronize_session=False)
        )
        db.commit()
        return deleted_count
    
    @staticmethod
    def get_all_tags(db: Session, user_id: str) -> List[str]:
        """Get all unique tags across user's notes"""
        result = db.query(func.unnest(Note.tags)).filter(
            Note.user_id == user_id
        ).distinct().all()
        return [tag[0] for tag in result if tag[0]]
    
    @staticmethod
    def get_note_statistics(db: Session, user_id: str) -> dict:
        """Get statistics about user's notes"""
        total_notes = db.query(func.count(Note.id)).filter(
            Note.user_id == user_id
        ).scalar()
        tags = NoteService.get_all_tags(db, user_id)
        return {
            "total_notes": total_notes,
            "unique_tags": len(tags),
            "tags": tags
        }
