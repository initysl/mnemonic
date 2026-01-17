from fastapi import APIRouter, Depends, UploadFile, File, Query as QueryParam
from sqlalchemy.orm import Session
from typing import Optional
import time
from app.core.database import get_db
from app.core.auth import get_user_id  
from app.services.voice_service import voice_service
from app.services.embedding_service import embedding_service
from app.services.vector_service import vector_service
from app.services.llm_service import llm_service
from app.schemas.query import QueryRequest, QueryResponse, RetrievedNote

router = APIRouter(
    prefix="/query",
    tags=["query"],
)

@router.post("/text", response_model=QueryResponse)
def text_query(
    request: QueryRequest,
    user_id: str = Depends(get_user_id),  # Get user_id from Auth0 token
    db: Session = Depends(get_db)
):
    """
    Enhanced text query with LLM reasoning (user's notes only)
    
    Pipeline:
    1. Generate embedding for query
    2. Search similar notes (user's notes only)
    3. LLM synthesizes answer from notes
    """
    start_time = time.time()
    
    # 1. Generate embedding
    query_embedding = embedding_service.generate_embedding(request.query)
    
    # 2. Search similar notes (filtered by user_id)
    results = vector_service.search_similar_notes(
        db=db,
        user_id=user_id,  # Only search user's notes
        query_embedding=query_embedding,
        top_k=request.top_k,
        similarity_threshold=request.min_similarity
    )
    
    # Format notes for LLM
    retrieved_notes_data = [
        {
            "id": str(note.id),
            "title": note.title,
            "content": note.content,
            "tags": note.tags,
            "similarity_score": round(similarity, 3)
        }
        for note, similarity in results
    ]
    
    # 3. LLM reasoning
    llm_response = llm_service.reason_over_notes(
        query=request.query,
        retrieved_notes=retrieved_notes_data
    )
    
    # Determine confidence
    if results and results[0][1] > 0.7:
        confidence = "high"
    elif results and results[0][1] > 0.5:
        confidence = "medium"
    else:
        confidence = "low"
    
    # Format response
    retrieved_notes = [
        RetrievedNote(
            id=note.id,  # type: ignore
            title=note.title,  # type: ignore
            content=note.content,  # type: ignore
            tags=note.tags,  # type: ignore
            similarity_score=round(similarity, 3),
            created_at=note.created_at  # type: ignore
        )
        for note, similarity in results
    ]
    
    execution_time = (time.time() - start_time) * 1000
    
    return QueryResponse(
        query=request.query,
        answer=llm_response["answer"],
        confidence=confidence,
        retrieved_notes=retrieved_notes,
        cited_notes=[note.id for note in retrieved_notes if str(note.id) in llm_response["cited_notes"]],
        execution_time_ms=round(execution_time, 2)
    )

@router.post("/voice", response_model=QueryResponse)
async def voice_query(
    audio: UploadFile = File(..., description="Audio query file"),
    top_k: int = QueryParam(5, ge=1, le=10),
    min_similarity: float = QueryParam(0.3, ge=0.0, le=1.0),
    language: Optional[str] = QueryParam(None),
    user_id: str = Depends(get_user_id),  # Get user_id from Auth0 token
    db: Session = Depends(get_db)
):
    """
    Enhanced voice query with LLM reasoning (user's notes only)
    
    Pipeline:
    1. Transcribe audio
    2. Generate embedding
    3. Search similar notes (user's notes only)
    4. LLM synthesizes answer
    """
    start_time = time.time()
    
    # 1. Transcribe
    transcribed_text = voice_service.transcribe_audio(audio, language=language)
    
    # 2-4. Use same pipeline as text query
    query_embedding = embedding_service.generate_embedding(transcribed_text)
    
    results = vector_service.search_similar_notes(
        db=db,
        user_id=user_id,  # Only search user's notes
        query_embedding=query_embedding,
        top_k=top_k,
        similarity_threshold=min_similarity
    )
    
    retrieved_notes_data = [
        {
            "id": str(note.id),
            "title": note.title,
            "content": note.content,
            "tags": note.tags,
            "similarity_score": round(similarity, 3)
        }
        for note, similarity in results
    ]
    
    llm_response = llm_service.reason_over_notes(
        query=transcribed_text,
        retrieved_notes=retrieved_notes_data
    )
    
    confidence = "high" if results and results[0][1] > 0.7 else "medium" if results and results[0][1] > 0.5 else "low"
    
    retrieved_notes = [
        RetrievedNote(
            id=note.id,  # type: ignore
            title=note.title,  # type: ignore
            content=note.content,  # type: ignore
            tags=note.tags,  # type: ignore
            similarity_score=round(similarity, 3),
            created_at=note.created_at  # type: ignore
        )
        for note, similarity in results
    ]
    
    execution_time = (time.time() - start_time) * 1000
    
    return QueryResponse(
        query=transcribed_text,
        answer=llm_response["answer"],
        confidence=confidence,
        retrieved_notes=retrieved_notes,
        cited_notes=[note.id for note in retrieved_notes if str(note.id) in llm_response["cited_notes"]],
        execution_time_ms=round(execution_time, 2)
    )