import os
import os as os_module
from groq import Groq
from fastapi import UploadFile
import tempfile
from typing import Optional


class VoiceService:
    """Transcribe audio using Groq Whisper API"""
    
    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not set in environment")
        
        self.client = Groq(api_key=api_key)
        self.model = "whisper-large-v3"
        
        # Supported audio formats
        self.supported_formats = {
            "audio/wav", "audio/wave", "audio/x-wav",
            "audio/mpeg", "audio/mp3",
            "audio/ogg", "audio/webm",
            "audio/flac", "audio/m4a"
        }
    
    def transcribe_audio(
        self, 
        audio_file: UploadFile,
        language: Optional[str] = None
    ) -> str:
        """
        Transcribe audio file to text using Groq Whisper
        Args:
            audio_file: Uploaded audio file
            language: Optional language code (e.g., 'en', 'es')
        Returns:
            Transcribed text
        """
        # Validate file type
        if audio_file.content_type not in self.supported_formats:
            raise ValueError(
                f"Unsupported audio format: {audio_file.content_type}. "
                f"Supported: {', '.join(self.supported_formats)}"
            )
        
        # Save uploaded file to temporary location
        # Groq API requires a file path, not bytes
        with tempfile.NamedTemporaryFile(
            delete=False, 
            suffix=self._get_file_extension(audio_file.filename)
        ) as temp_file:
            # Write uploaded content to temp file
            content = audio_file.file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Transcribe using Groq Whisper
            with open(temp_file_path, "rb") as audio:
                transcription = self.client.audio.transcriptions.create(
                    file=(audio_file.filename, audio.read()),
                    model=self.model,
                    language=language,  # type: ignore
                    response_format="text"
                )
            
            return transcription.strip() # type: ignore
        
        finally:
            # Clean up temporary file
            try:
                os_module.unlink(temp_file_path)
            except Exception:
                pass  # Ignore cleanup errors
    
    def _get_file_extension(self, filename: Optional[str]) -> str:
        """Extract file extension from filename"""
        if not filename:
            return ".wav"
        
        ext = filename.split(".")[-1] if "." in filename else "wav"
        return f".{ext}"


# Singleton instance
voice_service = VoiceService()