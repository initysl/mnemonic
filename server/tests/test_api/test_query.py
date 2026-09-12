"""Search and query endpoints: retrieval scoping and upstream failure handling."""
import io

import pytest

from tests.conftest import TEST_USER_ID, requires_db
from app.utils.exceptions import EmbeddingGenerationError, LLMReasoningError

pytestmark = requires_db


def create_note(client, title, content):
    response = client.post(
        "/api/v1/notes", json={"title": title, "content": content, "tags": []}
    )
    assert response.status_code == 201, response.text
    return response.json()


class TestSearch:
    def test_search_returns_own_notes(self, client):
        create_note(client, "Porsche", "The 911 has a flat-six engine")

        response = client.post(
            "/api/v1/search", json={"query": "porsche", "min_similarity": 0.0}
        )

        assert response.status_code == 200
        assert response.json()["total_results"] >= 1

    def test_search_never_returns_another_users_notes(self, client, as_other_user):
        create_note(client, "Secret", "user A private content")

        as_other_user()
        response = client.post(
            "/api/v1/search", json={"query": "private", "min_similarity": 0.0}
        )

        assert response.status_code == 200
        assert response.json()["results"] == []

    def test_blank_query_is_rejected(self, client):
        assert client.post("/api/v1/search", json={"query": ""}).status_code == 422

    def test_oversized_query_is_rejected(self, client):
        response = client.post("/api/v1/search", json={"query": "x" * 2001})
        assert response.status_code == 422


class TestTextQuery:
    def test_returns_an_answer_and_its_sources(self, client):
        create_note(client, "Groceries", "milk, eggs, bread")

        response = client.post(
            "/api/v1/query/text", json={"query": "what groceries", "min_similarity": 0.0}
        )

        assert response.status_code == 200
        body = response.json()
        assert body["answer"]
        assert body["confidence"] in {"high", "medium", "low"}
        assert body["execution_time_ms"] >= 0
        assert len(body["retrieved_notes"]) >= 1

    def test_cited_notes_are_a_subset_of_retrieved_notes(self, client):
        create_note(client, "Groceries", "milk, eggs, bread")

        body = client.post(
            "/api/v1/query/text", json={"query": "groceries", "min_similarity": 0.0}
        ).json()

        retrieved = {note["id"] for note in body["retrieved_notes"]}
        assert set(body["cited_notes"]).issubset(retrieved)

    def test_no_matching_notes_still_answers(self, client):
        response = client.post(
            "/api/v1/query/text", json={"query": "anything", "min_similarity": 0.99}
        )

        assert response.status_code == 200
        assert response.json()["confidence"] == "low"
        assert response.json()["retrieved_notes"] == []

    def test_query_never_reaches_another_users_notes(self, client, as_other_user):
        create_note(client, "Secret", "user A private content")

        as_other_user()
        body = client.post(
            "/api/v1/query/text", json={"query": "private", "min_similarity": 0.0}
        ).json()

        assert body["retrieved_notes"] == []

    @pytest.mark.parametrize(
        "payload",
        [
            {"query": "ok", "top_k": 0},
            {"query": "ok", "top_k": 99},
            {"query": "ok", "min_similarity": 1.5},
            {"query": "ok", "min_similarity": -1},
        ],
    )
    def test_out_of_range_parameters_are_rejected(self, client, payload):
        assert client.post("/api/v1/query/text", json=payload).status_code == 422


class TestUpstreamFailures:
    """
    An AI provider outage is a 503, not the opaque 500 these used to produce.
    """

    def test_embedding_outage_is_503(self, client, monkeypatch):
        from app.services import embedding_service as module

        def explode(self, text):
            raise EmbeddingGenerationError("provider down")

        monkeypatch.setattr(module.EmbeddingService, "generate_embedding", explode)

        response = client.post("/api/v1/query/text", json={"query": "anything"})

        assert response.status_code == 503
        assert response.headers.get("retry-after") == "10"

    def test_llm_outage_is_503(self, client, monkeypatch):
        from app.services import llm_service as module

        def explode(self, query, retrieved_notes, max_tokens=500):
            raise LLMReasoningError("provider down")

        monkeypatch.setattr(module.LLMService, "reason_over_notes", explode)

        response = client.post("/api/v1/query/text", json={"query": "anything"})

        assert response.status_code == 503

    def test_outage_response_does_not_leak_provider_detail(self, client, monkeypatch):
        from app.services import embedding_service as module

        def explode(self, text):
            raise EmbeddingGenerationError("token sk-secret-123 rejected by host db-1")

        monkeypatch.setattr(module.EmbeddingService, "generate_embedding", explode)

        body = client.post("/api/v1/query/text", json={"query": "anything"}).text

        assert "sk-secret-123" not in body
        assert "db-1" not in body

    def test_search_outage_is_503(self, client, monkeypatch):
        from app.services import embedding_service as module

        def explode(self, text):
            raise EmbeddingGenerationError("provider down")

        monkeypatch.setattr(module.EmbeddingService, "generate_embedding", explode)

        assert client.post("/api/v1/search", json={"query": "x"}).status_code == 503


class TestVoiceQuery:
    def test_unsupported_audio_is_400(self, client):
        response = client.post(
            "/api/v1/query/voice",
            files={"audio": ("note.pdf", io.BytesIO(b"not audio"), "application/pdf")},
        )

        assert response.status_code == 400

    def test_transcribed_audio_drives_the_query(self, client, monkeypatch):
        from app.services import voice_service as module

        monkeypatch.setattr(
            module.VoiceService,
            "transcribe_audio",
            lambda self, audio_file, language=None: "what groceries do I need",
        )
        create_note(client, "Groceries", "milk, eggs, bread")

        response = client.post(
            "/api/v1/query/voice",
            params={"min_similarity": 0.0},
            files={"audio": ("q.webm", io.BytesIO(b"audio"), "audio/webm")},
        )

        assert response.status_code == 200
        assert response.json()["query"] == "what groceries do I need"

    def test_silent_audio_is_400(self, client, monkeypatch):
        from app.services import voice_service as module

        monkeypatch.setattr(
            module.VoiceService,
            "transcribe_audio",
            lambda self, audio_file, language=None: "",
        )

        response = client.post(
            "/api/v1/query/voice",
            files={"audio": ("q.webm", io.BytesIO(b"audio"), "audio/webm")},
        )

        assert response.status_code == 400


class TestHealth:
    def test_health_is_public(self, client):
        assert client.get("/api/v1/health/").status_code == 200

    def test_db_health_reports_connected(self, client):
        body = client.get("/api/v1/health/db").json()

        assert body["database"] == "connected"
        # The unauthenticated endpoint must not describe the database.
        assert "error" not in body
