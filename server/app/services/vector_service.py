from sqlalchemy.orm import Session
from typing import List, Tuple
from app.models.note import Note


class VectorService:
    """Handle vector similarity search operations"""
    
    @staticmethod
    def search_similar_notes(
        db: Session,
        user_id: str,  
        query_embedding: List[float],
        top_k: int = 5,
        similarity_threshold: float = 0.0
    ) -> List[Tuple[Note, float]]:
        """
        Search for notes similar to query embedding using cosine similarity
        (Only searches user's notes)
        Args:
            db: Database session
            user_id: User ID to filter notes
            query_embedding: Query vector (384 dimensions)
            top_k: Number of results to return
            similarity_threshold: Minimum similarity score (0-1)
        Returns:
            List of (Note, similarity_score) tuples, ordered by relevance
        """
        
        # Calculate similarity: 1 - cosine_distance = cosine_similarity
        similarity_expr = 1 - Note.embedding.cosine_distance(query_embedding)
        
        # Query with similarity score (filtered by user_id)
        results = (
            db.query(Note, similarity_expr.label('similarity'))
            .filter(Note.user_id == user_id)  
            .filter(Note.embedding.isnot(None))
            .filter(similarity_expr > similarity_threshold)
            .order_by(Note.embedding.cosine_distance(query_embedding))
            .limit(top_k)
            .all()
        )
        
        # Return as (Note object, similarity) tuples
        return [(note, float(sim)) for note, sim in results]


# Singleton instance
vector_service = VectorService()