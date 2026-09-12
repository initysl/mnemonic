"""LLM reasoning: citation parsing and retry policy."""
from unittest.mock import MagicMock

import groq
import pytest

from app.services.llm_service import LLMService
from app.utils.exceptions import LLMReasoningError


def completion(text: str):
    message = MagicMock()
    message.content = text
    choice = MagicMock()
    choice.message = message
    response = MagicMock()
    response.choices = [choice]
    return response


def api_error(cls):
    """Build a groq error without going through its HTTP plumbing."""
    return cls.__new__(cls)


@pytest.fixture
def service():
    instance = LLMService.__new__(LLMService)
    instance.model = "openai/gpt-oss-20b"
    instance.client = MagicMock()
    return instance


NOTES = [
    {"id": "11111111-1111-1111-1111-111111111111", "title": "A", "content": "a", "tags": [], "similarity_score": 0.9},
    {"id": "22222222-2222-2222-2222-222222222222", "title": "B", "content": "b", "tags": [], "similarity_score": 0.8},
    {"id": "33333333-3333-3333-3333-333333333333", "title": "C", "content": "c", "tags": [], "similarity_score": 0.7},
]


class TestWithoutNotes:
    def test_no_notes_short_circuits(self, service):
        result = service.reason_over_notes("anything", [])

        assert result["cited_notes"] == []
        assert service.client.chat.completions.create.call_count == 0


class TestCitations:
    def test_citations_map_to_note_ids(self, service):
        service.client.chat.completions.create.return_value = completion(
            "Here is the answer.\nCitations: [1, 3]"
        )

        result = service.reason_over_notes("q", NOTES)

        assert result["cited_notes"] == [NOTES[0]["id"], NOTES[2]["id"]]

    def test_citation_line_is_stripped_from_the_answer(self, service):
        service.client.chat.completions.create.return_value = completion(
            "Here is the answer.\nCitations: [1]"
        )

        assert "Citations:" not in service.reason_over_notes("q", NOTES)["answer"]

    def test_out_of_range_citations_are_dropped(self, service):
        """The model can cite a source index that does not exist."""
        service.client.chat.completions.create.return_value = completion(
            "Answer.\nCitations: [1, 9, 0, 42]"
        )

        assert service.reason_over_notes("q", NOTES)["cited_notes"] == [NOTES[0]["id"]]

    def test_missing_citation_line_is_tolerated(self, service):
        service.client.chat.completions.create.return_value = completion("Just an answer.")

        result = service.reason_over_notes("q", NOTES)

        assert result["answer"] == "Just an answer."
        assert result["cited_notes"] == []

    def test_empty_citation_list_is_tolerated(self, service):
        service.client.chat.completions.create.return_value = completion(
            "Answer.\nCitations: []"
        )

        assert service.reason_over_notes("q", NOTES)["cited_notes"] == []

    def test_empty_model_response_falls_back(self, service):
        service.client.chat.completions.create.return_value = completion(None)

        assert service.reason_over_notes("q", NOTES)["answer"]


class TestRetryPolicy:
    """
    Retrying every failure meant a malformed request or a bad key was sent
    three times with backoff before surfacing the same error.
    """

    def test_transient_errors_are_retried(self, service):
        service.client.chat.completions.create.side_effect = [
            api_error(groq.APIConnectionError),
            api_error(groq.APIConnectionError),
            completion("Recovered.\nCitations: [1]"),
        ]

        result = service.reason_over_notes("q", NOTES)

        assert result["answer"] == "Recovered."
        assert service.client.chat.completions.create.call_count == 3

    @pytest.mark.parametrize(
        "error", [groq.AuthenticationError, groq.BadRequestError, groq.NotFoundError]
    )
    def test_permanent_errors_are_not_retried(self, service, error):
        service.client.chat.completions.create.side_effect = api_error(error)

        with pytest.raises(LLMReasoningError):
            service.reason_over_notes("q", NOTES)

        assert service.client.chat.completions.create.call_count == 1

    def test_exhausted_retries_raise_the_original_error(self, service):
        """Not tenacity's RetryError, which hid the real cause from the logs."""
        service.client.chat.completions.create.side_effect = api_error(
            groq.APIConnectionError
        )

        with pytest.raises(groq.APIConnectionError):
            service.reason_over_notes("q", NOTES)

        assert service.client.chat.completions.create.call_count == 3

    def test_unexpected_errors_become_llm_errors(self, service):
        service.client.chat.completions.create.side_effect = RuntimeError("boom")

        with pytest.raises(LLMReasoningError):
            service.reason_over_notes("q", NOTES)
