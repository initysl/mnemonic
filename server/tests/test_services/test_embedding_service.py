"""Embedding generation: batching, response shapes, and validation."""
from unittest.mock import MagicMock

import numpy as np
import pytest

from app.services.embedding_service import EMBEDDING_DIMENSIONS, EmbeddingService
from app.utils.exceptions import EmbeddingGenerationError


@pytest.fixture
def service():
    instance = EmbeddingService.__new__(EmbeddingService)
    instance.model = "sentence-transformers/all-MiniLM-L6-v2"
    instance.client = MagicMock()
    return instance


class TestBatching:
    def test_a_batch_is_one_request(self, service):
        """
        The whole point of the batch path: embedding a chunked note used to
        issue one HTTP request per chunk, serially.
        """
        service.client.feature_extraction.return_value = np.zeros(
            (12, EMBEDDING_DIMENSIONS), dtype=np.float32
        )

        service.generate_batch_embeddings([f"chunk {i}" for i in range(12)])

        assert service.client.feature_extraction.call_count == 1

    def test_the_whole_list_is_sent(self, service):
        texts = [f"chunk {i}" for i in range(5)]
        service.client.feature_extraction.return_value = np.zeros(
            (5, EMBEDDING_DIMENSIONS), dtype=np.float32
        )

        service.generate_batch_embeddings(texts)

        assert service.client.feature_extraction.call_args.kwargs["text"] == texts

    def test_results_keep_input_order(self, service):
        rows = np.array(
            [[float(i)] * EMBEDDING_DIMENSIONS for i in range(4)], dtype=np.float32
        )
        service.client.feature_extraction.return_value = rows

        result = service.generate_batch_embeddings(["a", "b", "c", "d"])

        assert [row[0] for row in result] == [0.0, 1.0, 2.0, 3.0]

    def test_empty_input_makes_no_request(self, service):
        assert service.generate_batch_embeddings([]) == []
        assert service.client.feature_extraction.call_count == 0


class TestResponseShapes:
    def test_flat_response_for_a_single_text(self, service):
        """
        A one-element batch can come back as a bare 384-float vector. Read
        naively that is 384 separate results, not one embedding -- and a
        single-chunk note is the common case.
        """
        service.client.feature_extraction.return_value = np.zeros(
            EMBEDDING_DIMENSIONS, dtype=np.float32
        )

        result = service.generate_batch_embeddings(["one chunk"])

        assert len(result) == 1
        assert len(result[0]) == EMBEDDING_DIMENSIONS

    def test_nested_response_for_a_single_text(self, service):
        service.client.feature_extraction.return_value = [[0.0] * EMBEDDING_DIMENSIONS]

        result = service.generate_batch_embeddings(["one chunk"])

        assert len(result) == 1

    def test_values_are_plain_floats(self, service):
        """pgvector receives Python floats, not numpy scalars."""
        service.client.feature_extraction.return_value = np.zeros(
            (2, EMBEDDING_DIMENSIONS), dtype=np.float32
        )

        result = service.generate_batch_embeddings(["a", "b"])

        assert all(type(value) is float for value in result[0])

    def test_single_embedding_unwraps_a_nested_response(self, service):
        service.client.feature_extraction.return_value = [[1.0] * EMBEDDING_DIMENSIONS]

        assert len(service.generate_embedding("text")) == EMBEDDING_DIMENSIONS


class TestValidation:
    def test_wrong_dimensions_are_rejected(self, service):
        service.client.feature_extraction.return_value = np.zeros((1, 128), dtype=np.float32)

        with pytest.raises(EmbeddingGenerationError, match="384"):
            service.generate_batch_embeddings(["text"])

    def test_a_short_batch_is_rejected(self, service):
        """Silently dropping a chunk would misalign chunks and embeddings."""
        service.client.feature_extraction.return_value = np.zeros(
            (2, EMBEDDING_DIMENSIONS), dtype=np.float32
        )

        with pytest.raises(EmbeddingGenerationError, match="Expected 3 embeddings"):
            service.generate_batch_embeddings(["a", "b", "c"])

    @pytest.mark.parametrize("texts", [[""], ["  "], ["ok", ""]])
    def test_blank_text_is_rejected(self, service, texts):
        with pytest.raises(ValueError, match="cannot be empty"):
            service.generate_batch_embeddings(texts)

    def test_blank_text_is_rejected_before_any_request(self, service):
        with pytest.raises(ValueError):
            service.generate_batch_embeddings([""])

        assert service.client.feature_extraction.call_count == 0

    def test_provider_errors_become_embedding_errors(self, service):
        service.client.feature_extraction.side_effect = RuntimeError("provider down")

        with pytest.raises(EmbeddingGenerationError):
            service.generate_batch_embeddings(["text"])

    def test_single_embedding_rejects_blank_text(self, service):
        with pytest.raises(ValueError, match="cannot be empty"):
            service.generate_embedding("   ")
