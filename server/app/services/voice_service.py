import os
from groq import Groq
from fastapi import UploadFile
import tempfile
from typing import Optional
from app.core.settings import get_settings


# The uploaded filename never reaches the filesystem: the extension is chosen
# from this whitelist instead. A client-supplied name like
# "rec.wav/../../tmp/x" would otherwise flow into NamedTemporaryFile(suffix=...)
# and push the temp file outside its intended name, or fail the request
# outright when the directory does not exist.
EXTENSION_BY_CONTENT_TYPE = {
    "audio/wav": ".wav",
    "audio/wave": ".wav",
    "audio/x-wav": ".wav",
    "audio/mpeg": ".mp3",
    "audio/mp3": ".mp3",
    "audio/ogg": ".ogg",
    "audio/webm": ".webm",
    "audio/flac": ".flac",
    "audio/m4a": ".m4a",
}


class VoiceService:
    """Transcribe audio using Groq Whisper API"""

    def __init__(self):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY not set in environment")

        self.client = Groq(api_key=api_key)
        self.model = "whisper-large-v3"
        self.max_audio_bytes = get_settings().max_audio_bytes

        # Supported audio formats
        self.supported_formats = set(EXTENSION_BY_CONTENT_TYPE)

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
        content_type = self._normalize_content_type(audio_file.content_type)
        if content_type not in EXTENSION_BY_CONTENT_TYPE:
            raise ValueError(
                f"Unsupported audio format: {audio_file.content_type}. "
                f"Supported: {', '.join(sorted(self.supported_formats))}"
            )

        # Read and size-check before creating anything on disk. Creating the
        # temp file first left an orphaned file behind on every rejected
        # upload, because the cleanup block had not been entered yet.
        content = audio_file.file.read(self.max_audio_bytes + 1)
        if len(content) > self.max_audio_bytes:
            raise ValueError(
                f"Audio file is too large. Maximum size is {self.max_audio_bytes // (1024 * 1024)} MB."
            )
        if not content:
            raise ValueError("Audio file is empty.")

        extension = EXTENSION_BY_CONTENT_TYPE[content_type]

        # Groq's API requires a file path, not bytes.
        temp_file_path = None
        try:
            with tempfile.NamedTemporaryFile(
                delete=False,
                suffix=extension,
            ) as temp_file:
                temp_file.write(content)
                temp_file_path = temp_file.name

            with open(temp_file_path, "rb") as audio:
                transcription = self.client.audio.transcriptions.create(
                    file=(f"audio{extension}", audio.read()),
                    model=self.model,
                    language=language,  # type: ignore
                    response_format="text"
                )

            return transcription.strip() # type: ignore

        finally:
            # Clean up temporary file
            if temp_file_path:
                try:
                    os.unlink(temp_file_path)
                except OSError:
                    pass  # Ignore cleanup errors

    @staticmethod
    def _normalize_content_type(content_type: Optional[str]) -> str:
        """
        Strip parameters and casing from a media type.
        Browsers commonly send "audio/webm;codecs=opus" from MediaRecorder,
        which would not match a bare "audio/webm" comparison.
        """
        if not content_type:
            return ""
        return content_type.split(";")[0].strip().lower()


# Singleton instance
voice_service = VoiceService()
