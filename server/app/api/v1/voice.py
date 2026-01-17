from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.auth import get_user_id  # Add this import
from app.services.voice_service import voice_service
from app.services.embedding_service import embedding_service
from app.services.vector_service import vector_service
from app.schemas.voice import TranscriptionResponse, VoiceQueryResponse, VoiceSearchResult


router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    audio: UploadFile = File(..., description="Audio file (WAV, MP3, OGG, WEBM, FLAC, M4A)"),
    language: Optional[str] = Query(None, description="Language code (e.g., 'en', 'es')"),
    user_id: str = Depends(get_user_id) 
):
    """
    Transcribe audio file to text using Groq Whisper
    Upload an audio file and get back the transcribed text
    """
    try:
        transcribed_text = voice_service.transcribe_audio(audio, language=language)
        
        if not transcribed_text:
            raise HTTPException(
                status_code=400,
                detail="Could not transcribe audio. Please ensure the file contains speech."
            )
        
        return TranscriptionResponse(
            transcribed_text=transcribed_text,
            language=language
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(e)}"
        )


@router.post("/query", response_model=VoiceQueryResponse)
async def voice_search_query(
    audio: UploadFile = File(..., description="Audio query file"),
    top_k: int = Query(5, ge=1, le=20, description="Number of results"),
    min_similarity: float = Query(0.3, ge=0.0, le=1.0, description="Minimum similarity"),
    language: Optional[str] = Query(None, description="Language code"),
    user_id: str = Depends(get_user_id),  # Add user_id dependency
    db: Session = Depends(get_db)
):
    """
    Voice search: Upload audio → transcribe → search notes
    
    Complete voice query pipeline:
    1. Transcribe audio to text
    2. Generate embedding for transcribed text
    3. Search similar notes (user's notes only)
    4. Return ranked results
    """
    try:
        # 1. Transcribe audio
        transcribed_text = voice_service.transcribe_audio(audio, language=language)
        
        if not transcribed_text:
            raise HTTPException(
                status_code=400,
                detail="Could not transcribe audio"
            )
        
        # 2. Generate embedding for query
        query_embedding = embedding_service.generate_embedding(transcribed_text)
        
        # 3. Search similar notes (filtered by user_id)
        results = vector_service.search_similar_notes(
            db=db,
            user_id=user_id,  # Now defined via dependency
            query_embedding=query_embedding,
            top_k=top_k,
            similarity_threshold=min_similarity
        )
        
        # 4. Format results
        search_results = [
            VoiceSearchResult(
                id=note.id,  # type: ignore
                title=note.title,  # type: ignore
                content=note.content,  # type: ignore
                tags=note.tags,  # type: ignore
                similarity_score=round(similarity, 3),
                created_at=note.created_at  # type: ignore
            )
            for note, similarity in results
        ]
        
        return VoiceQueryResponse(
            transcribed_text=transcribed_text,
            query=transcribed_text,
            results=search_results,
            total_results=len(search_results)
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Voice query failed: {str(e)}"
        )