from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class MnemonicException(Exception):
    """Base exception for Mnemonic API"""
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class EmbeddingGenerationError(MnemonicException):
    """Raised when embedding generation fails"""
    pass


class TranscriptionError(MnemonicException):
    """Raised when audio transcription fails"""
    pass


class LLMReasoningError(MnemonicException):
    """Raised when LLM reasoning fails"""
    pass


class NoteNotFoundError(MnemonicException):
    """Raised when note is not found"""
    pass


# HTTP Exception helpers
def raise_not_found(resource: str, resource_id: str):
    """Raise 404 error"""
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{resource} with id '{resource_id}' not found"
    )


def raise_bad_request(message: str):
    """Raise 400 error"""
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=message
    )


def raise_internal_error(message: str):
    """Raise 500 error"""
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Internal server error: {message}"
    )