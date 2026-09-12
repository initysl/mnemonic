from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query as QueryParam
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


def _confidence_for(similarity: Optional[float]) -> str:
    if similarity is None:
        return "low"
    if similarity > 0.7:
        return "high"
    if similarity > 0.5:
        return "medium"
    return "low"


def _answer_query(
    db: Session,
    user_id: str,
    query_text: str,
    top_k: int,
    min_similarity: float,
    started_at: float,
) -> QueryResponse:
    """
    Shared retrieval-and-reasoning pipeline for text and voice queries.

    1. Generate embedding for the query
    2. Search similar notes (user's notes only)
    3. LLM synthesizes an answer from those notes

    The database session is released before the LLM call: that call takes
    seconds, and holding a pooled connection across it exhausts the pool well
    below the threadpool's concurrency.
    """
    query_embedding = embedding_service.generate_embedding(query_text)

    results = vector_service.search_similar_notes(
        db=db,
        user_id=user_id,  # Only search user's notes
        query_embedding=query_embedding,
        top_k=top_k,
        similarity_threshold=min_similarity,
    )

    # Materialise everything needed from the ORM objects while the session is
    # still open, so nothing lazy-loads after it is released.
    retrieved_notes = [
        RetrievedNote(
            id=match.note.id,
            title=match.note.title,
            content=match.note.content,
            tags=list(match.note.tags),
            similarity_score=round(match.similarity, 3),
            created_at=match.note.created_at,
            source_excerpt=match.excerpt,
        )
        for match in results
    ]
    confidence = _confidence_for(results[0].similarity if results else None)

    retrieved_notes_data = [
        {
            "id": str(note.id),
            "title": note.title,
            "content": note.source_excerpt,
            "tags": note.tags,
            "similarity_score": note.similarity_score,
        }
        for note in retrieved_notes
    ]

    db.close()

    llm_response = llm_service.reason_over_notes(
        query=query_text,
        retrieved_notes=retrieved_notes_data,
    )

    cited = set(llm_response["cited_notes"])
    execution_time = (time.time() - started_at) * 1000

    return QueryResponse(
        query=query_text,
        answer=llm_response["answer"],
        confidence=confidence,
        retrieved_notes=retrieved_notes,
        cited_notes=[note.id for note in retrieved_notes if str(note.id) in cited],
        execution_time_ms=round(execution_time, 2),
    )


@router.post("/text", response_model=QueryResponse)
def text_query(
    request: QueryRequest,
    user_id: str = Depends(get_user_id),  # Get user_id from Auth0 token
    db: Session = Depends(get_db)
):
    """Enhanced text query with LLM reasoning (user's notes only)"""
    return _answer_query(
        db=db,
        user_id=user_id,
        query_text=request.query,
        top_k=request.top_k,
        min_similarity=request.min_similarity,
        started_at=time.time(),
    )


@router.post("/voice", response_model=QueryResponse)
def voice_query(
    audio: UploadFile = File(..., description="Audio query file"),
    top_k: int = QueryParam(5, ge=1, le=10),
    min_similarity: float = QueryParam(0.3, ge=0.0, le=1.0),
    language: Optional[str] = QueryParam(None),
    user_id: str = Depends(get_user_id),  # Get user_id from Auth0 token
    db: Session = Depends(get_db)
):
    """
    Enhanced voice query with LLM reasoning (user's notes only)

    Transcribes the audio, then runs the same pipeline as the text query.

    Defined with `def`, not `async def`: every step below is blocking
    (transcription, embedding, database, LLM), so running it on the event loop
    would stall every other request for the duration. FastAPI runs sync
    handlers in a threadpool instead.
    """
    started_at = time.time()

    try:
        transcribed_text = voice_service.transcribe_audio(audio, language=language)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not transcribed_text:
        raise HTTPException(
            status_code=400,
            detail="Could not transcribe audio. Please ensure the file contains speech.",
        )

    return _answer_query(
        db=db,
        user_id=user_id,
        query_text=transcribed_text,
        top_k=top_k,
        min_similarity=min_similarity,
        started_at=started_at,
    )
