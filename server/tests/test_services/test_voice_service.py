"""Audio upload handling: format validation, size limits, and temp files."""
import glob
import os
import tempfile

import pytest


@pytest.fixture
def voice_service(monkeypatch):
    from app.services.voice_service import VoiceService

    service = VoiceService.__new__(VoiceService)
    service.model = "whisper-large-v3"
    service.max_audio_bytes = 1024
    from app.services.voice_service import EXTENSION_BY_CONTENT_TYPE

    service.supported_formats = set(EXTENSION_BY_CONTENT_TYPE)

    class FakeTranscriptions:
        def __init__(self):
            self.calls = []

        def create(self, file, model, language, response_format):
            self.calls.append({"filename": file[0], "size": len(file[1])})
            return "  transcribed text  "

    class FakeAudio:
        def __init__(self):
            self.transcriptions = FakeTranscriptions()

    class FakeClient:
        def __init__(self):
            self.audio = FakeAudio()

    service.client = FakeClient()
    return service


def temp_files():
    return set(glob.glob(os.path.join(tempfile.gettempdir(), "tmp*")))


class TestContentTypeValidation:
    @pytest.mark.parametrize(
        "content_type",
        ["audio/wav", "audio/mpeg", "audio/ogg", "audio/webm", "audio/flac", "audio/m4a"],
    )
    def test_supported_formats_are_accepted(self, voice_service, upload_file, content_type):
        audio = upload_file(b"audio-bytes", "recording", content_type)

        assert voice_service.transcribe_audio(audio) == "transcribed text"

    def test_media_type_parameters_are_tolerated(self, voice_service, upload_file):
        """Browser MediaRecorder sends 'audio/webm;codecs=opus'."""
        audio = upload_file(b"audio-bytes", "recording.webm", "audio/webm;codecs=opus")

        assert voice_service.transcribe_audio(audio) == "transcribed text"

    @pytest.mark.parametrize(
        "content_type", ["application/pdf", "text/plain", "", None]
    )
    def test_unsupported_formats_are_rejected(self, voice_service, upload_file, content_type):
        audio = upload_file(b"data", "file.pdf", content_type)

        with pytest.raises(ValueError, match="Unsupported audio format"):
            voice_service.transcribe_audio(audio)


class TestFilenameHandling:
    """
    The uploaded filename must never reach the filesystem. It used to be split
    on '.' and passed to NamedTemporaryFile(suffix=...), so a name containing
    a path separator pushed the temp file out of its intended location.
    """

    @pytest.mark.parametrize(
        "filename",
        [
            "rec.wav/../../../../tmp/pwned",
            "a.b/../../etc/passwd",
            "../../evil.wav",
            "rec.wav\x00.png",
            "",
        ],
    )
    def test_hostile_filenames_do_not_escape_the_temp_directory(
        self, voice_service, upload_file, filename
    ):
        before = temp_files()

        result = voice_service.transcribe_audio(
            upload_file(b"audio-bytes", filename, "audio/wav")
        )

        assert result == "transcribed text"
        # Nothing left behind, anywhere.
        assert temp_files() == before

    def test_extension_comes_from_the_content_type_not_the_filename(
        self, voice_service, upload_file
    ):
        voice_service.transcribe_audio(
            upload_file(b"audio-bytes", "anything.exe", "audio/ogg")
        )

        sent = voice_service.client.audio.transcriptions.calls[0]
        assert sent["filename"] == "audio.ogg"


class TestSizeLimit:
    def test_oversized_upload_is_rejected(self, voice_service, upload_file):
        audio = upload_file(b"x" * 2048, "big.wav", "audio/wav")

        with pytest.raises(ValueError, match="too large"):
            voice_service.transcribe_audio(audio)

    def test_oversized_upload_leaves_no_temp_file(self, voice_service, upload_file):
        """The size check used to run after the temp file was created."""
        before = temp_files()

        with pytest.raises(ValueError):
            voice_service.transcribe_audio(
                upload_file(b"x" * 2048, "big.wav", "audio/wav")
            )

        assert temp_files() == before

    def test_upload_at_the_limit_is_accepted(self, voice_service, upload_file):
        audio = upload_file(b"x" * 1024, "exact.wav", "audio/wav")

        assert voice_service.transcribe_audio(audio) == "transcribed text"

    def test_empty_upload_is_rejected(self, voice_service, upload_file):
        with pytest.raises(ValueError, match="empty"):
            voice_service.transcribe_audio(upload_file(b"", "empty.wav", "audio/wav"))


class TestCleanup:
    def test_temp_file_is_removed_after_success(self, voice_service, upload_file):
        before = temp_files()

        voice_service.transcribe_audio(upload_file(b"bytes", "ok.wav", "audio/wav"))

        assert temp_files() == before

    def test_temp_file_is_removed_when_transcription_fails(
        self, voice_service, upload_file
    ):
        def explode(**kwargs):
            raise RuntimeError("provider is down")

        voice_service.client.audio.transcriptions.create = explode
        before = temp_files()

        with pytest.raises(RuntimeError):
            voice_service.transcribe_audio(upload_file(b"bytes", "ok.wav", "audio/wav"))

        assert temp_files() == before
