from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.auth import get_user_id  
from app.services.embedding_service import embedding_service
from app.services.vector_service import vector_service
from app.schemas.search import SearchRequest, SearchResultItem, SearchResponse

router = APIRouter(
    prefix="/search",
    tags=["search"],
)

@router.post("/", response_model=SearchResponse)
def search_notes(
    search_req: SearchRequest,
    user_id: str = Depends(get_user_id),  # Get user_id from Auth0 token
    db: Session = Depends(get_db)
):
    """
    Semantic search over user's notes using text query
    
    Returns notes ranked by similarity to the query
    """
    # Generate embedding for query
    query_embedding = embedding_service.generate_embedding(search_req.query)
    
    # Search for similar notes (only user's notes)
    results = vector_service.search_similar_notes(
        db=db,
        user_id=user_id,  # Pass user_id to filter results
        query_embedding=query_embedding,
        top_k=search_req.top_k,
        similarity_threshold=search_req.min_similarity
    )
    
    # Format results
    search_results = [
        SearchResultItem(
            id=note.id,            # type: ignore
            title=note.title,      # type: ignore
            content=note.content,  # type: ignore
            tags=note.tags,        # type: ignore
            similarity_score=round(similarity, 3),
            created_at=note.created_at  # type: ignore
        )
        for note, similarity in results
    ]
    
    return SearchResponse(
        query=search_req.query,
        results=search_results,
        total_results=len(search_results)
    )