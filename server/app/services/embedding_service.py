import os
from huggingface_hub import InferenceClient
from typing import List
from app.utils.logger import logger
from app.utils.exceptions import EmbeddingGenerationError

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
        """
        Generate 384-dimensional embedding for text
        Args:
            text: Input text to embed
        Returns:
            List of 384 floats representing the embedding
        """
        if not text or not text.strip():
            logger.error("Empty text provided for embedding")
            raise ValueError("Text cannot be empty")
        
        try:
            logger.debug(f"Generating embedding for text (length: {len(text)})")
            embedding = self.client.feature_extraction(
                text=text,
                model=self.model
            )
            
            # Flatten if nested (API sometimes returns [[embedding]])
            if isinstance(embedding[0], list):
                embedding = embedding[0]
            
            # Validate dimensions
            if len(embedding) != 384:
                logger.error(f"Unexpected embedding dimensions: {len(embedding)}")
                raise EmbeddingGenerationError(
                    f"Expected 384 dimensions, got {len(embedding)}"
                )
            logger.debug(f"Successfully generated embedding")
            return embedding # type: ignore
            
        except Exception as e:
            logger.error(f"Embedding generation failed: {str(e)}", exc_info=True)
            raise EmbeddingGenerationError(
                f"Failed to generate embedding: {str(e)}"
            )
    
    def generate_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts
        Args:
            texts: List of texts to embed
        Returns:
            List of embeddings
        """
        logger.info(f"Generating embeddings for {len(texts)} texts")
        return [self.generate_embedding(text) for text in texts]


# Singleton instance
embedding_service = EmbeddingService()