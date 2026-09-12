from dataclasses import dataclass
from sqlalchemy.orm import Session, defer
from typing import List
from app.models.note import Note
from app.models.note_chunk import NoteChunk


@dataclass(frozen=True)
class NoteSearchMatch:
    note: Note
    excerpt: str
    similarity: float


class VectorService:
    """Handle vector similarity search operations"""
    
    @staticmethod
    def search_similar_notes(
        db: Session,
        user_id: str,  
        query_embedding: List[float],
        top_k: int = 5,
        similarity_threshold: float = 0.0
    ) -> List[NoteSearchMatch]:
        """
        Search for notes similar to query embedding using cosine similarity
        (Only searches user's notes)
        Args:
            db: Database session
            user_id: User ID to filter notes
            query_embedding: Query vector (384 dimensions)
            top_k: Number of results to return
            similarity_threshold: Minimum similarity score (0-1)
        Returns one best matching passage per note, ordered by relevance.
        """
        
        similarity_expr = 1 - NoteChunk.embedding.cosine_distance(query_embedding)
        chunk_results = (
            db.query(NoteChunk, Note, similarity_expr.label('similarity'))
            # The embedding columns are only used inside the SQL expressions
            # above; transferring two 384-float vectors per row to Python is
            # pure waste.
            .options(defer(NoteChunk.embedding), defer(Note.embedding))
            .join(Note, NoteChunk.note_id == Note.id)
            .filter(Note.user_id == user_id)
            .filter(similarity_expr > similarity_threshold)
            .order_by(NoteChunk.embedding.cosine_distance(query_embedding))
            .limit(top_k * 4)
            .all()
        )

        matches: List[NoteSearchMatch] = []
        seen_note_ids = set()
        for chunk, note, similarity in chunk_results:
            if note.id in seen_note_ids:
                continue
            matches.append(
                NoteSearchMatch(note=note, excerpt=chunk.content, similarity=float(similarity))
            )
            seen_note_ids.add(note.id)
            if len(matches) == top_k:
                return matches

        # Existing notes created before passage indexing remain searchable until
        # they are edited or re-saved and gain chunks.
        legacy_similarity_expr = 1 - Note.embedding.cosine_distance(query_embedding)
        legacy_results = (
            db.query(Note, legacy_similarity_expr.label('similarity'))
            .options(defer(Note.embedding))
            .outerjoin(NoteChunk, NoteChunk.note_id == Note.id)
            .filter(Note.user_id == user_id)  
            .filter(Note.embedding.isnot(None))
            .filter(NoteChunk.id.is_(None))
            .filter(legacy_similarity_expr > similarity_threshold)
            .order_by(Note.embedding.cosine_distance(query_embedding))
            .limit(top_k - len(matches))
            .all()
        )
        matches.extend(
            NoteSearchMatch(note=note, excerpt=note.content, similarity=float(similarity))
            for note, similarity in legacy_results
        )
        return matches


# Singleton instance
vector_service = VectorService()
