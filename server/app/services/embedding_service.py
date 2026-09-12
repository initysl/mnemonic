import os
from huggingface_hub import InferenceClient
from typing import List
from app.utils.logger import logger
from app.utils.exceptions import EmbeddingGenerationError

EMBEDDING_DIMENSIONS = 384


class EmbeddingService:
    """Generate embeddings using HuggingFace Inference API"""

    def __init__(self):
        api_key = os.getenv("HF_TOKEN")
        if not api_key:
            raise ValueError("HF_TOKEN not set")
         # Store client as instance variable
        self.client = InferenceClient(
            provider="hf-inference",
            api_key=os.getenv("HF_TOKEN")
        )
        
        self.model = "sentence-transformers/all-MiniLM-L6-v2"
        logger.info(f"Initialized EmbeddingService with model: {self.model}")
    
    def generate_embedding(self, text: str) -> List[float]:

        """Generate embedding for text"""
        
        if not text or not text.strip():
            logger.error("Empty text provided for embedding")
            raise ValueError("Text cannot be empty")
        
        try:
            logger.debug(f"Generating embedding for text (length: {len(text)})")
            embedding = self.client.feature_extraction(
                text=text,
                model=self.model
            )

            vector = self._as_vector(embedding)
            logger.debug(f"Successfully generated embedding")
            return vector

        except EmbeddingGenerationError:
            raise
        except Exception as e:
            logger.error(f"Embedding generation failed: {str(e)}", exc_info=True)
            raise EmbeddingGenerationError(
                f"Failed to generate embedding: {str(e)}"
            )
    
    def generate_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts in a single API call.
        A 50,000 character note chunks into ~32 passages; embedding those one
        request at a time took ~32 sequential round-trips and reliably blew
        past the client's request timeout.
        Args:
            texts: List of texts to embed
        Returns:
            List of embeddings, in the same order as texts
        """
        if not texts:
            return []

        for text in texts:
            if not text or not text.strip():
                logger.error("Empty text provided for embedding")
                raise ValueError("Text cannot be empty")

        logger.info(f"Generating embeddings for {len(texts)} texts")

        try:
            result = self.client.feature_extraction(
                text=texts,  # type: ignore[arg-type]
                model=self.model,
            )
            embeddings = [self._as_vector(item) for item in self._as_rows(result)]
        except EmbeddingGenerationError:
            raise
        except Exception as e:
            logger.error(f"Batch embedding generation failed: {str(e)}", exc_info=True)
            raise EmbeddingGenerationError(
                f"Failed to generate embeddings: {str(e)}"
            )

        if len(embeddings) != len(texts):
            raise EmbeddingGenerationError(
                f"Expected {len(texts)} embeddings, got {len(embeddings)}"
            )

        return embeddings

    @staticmethod
    def _as_rows(result) -> List:
        """
        Normalise a batch response into one row per input text.
        A single-text batch can come back as a flat 384-float vector rather
        than a list containing one vector, which would otherwise be read as
        384 separate results.
        """
        rows = list(result)

        if rows and not hasattr(rows[0], "__len__"):
            # Flat vector of scalars: this is one embedding, not many.
            return [rows]

        return rows

    @staticmethod
    def _as_vector(value) -> List[float]:
        """Normalise one API result entry into a flat 384-float vector."""
        vector = list(value)

        # The API sometimes nests a single vector one level deeper. Test for a
        # sequence rather than a numeric type: entries come back as numpy
        # scalars, which are not Python int/float instances.
        if vector and hasattr(vector[0], "__len__"):
            vector = list(vector[0])

        if len(vector) != EMBEDDING_DIMENSIONS:
            logger.error(f"Unexpected embedding dimensions: {len(vector)}")
            raise EmbeddingGenerationError(
                f"Expected {EMBEDDING_DIMENSIONS} dimensions, got {len(vector)}"
            )

        return [float(component) for component in vector]


# Singleton instance
embedding_service = EmbeddingService()