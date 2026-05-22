import logging
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import numpy as np

from app.models.document import DocumentChunk

logger = logging.getLogger(__name__)


class VectorStore:
    """Service for storing and searching vector embeddings"""

    @staticmethod
    async def store_chunk(
        db: AsyncSession,
        document_id: int,
        chunk_index: int,
        text: str,
        embedding: List[float],
        agent_type: str = "external",
        metadata: dict | None = None
    ) -> DocumentChunk:
        """Store a document chunk with its embedding"""
        import json

        chunk = DocumentChunk(
            document_id=document_id,
            chunk_index=chunk_index,
            text=text,
            embedding=embedding,
            agent_type=agent_type,
            chunk_metadata=json.dumps(metadata) if metadata else None
        )

        db.add(chunk)
        await db.flush()
        return chunk

    @staticmethod
    async def search_similar(
        db: AsyncSession,
        query_embedding: List[float],
        limit: int = 5,
        threshold: float = 0.7,
        agent_type: str = "external"
    ) -> List[tuple[DocumentChunk, float]]:
        """
        Search for similar chunks using cosine similarity.
        Returns list of (chunk, similarity_score) tuples.
        """
        # Get all chunks with embeddings for the specific agent type
        # Internal agent can see both internal and external data
        query = select(DocumentChunk).where(DocumentChunk.embedding.isnot(None))
        
        if agent_type in ["internal", "all"]:
            query = query.where(DocumentChunk.agent_type.in_(["internal", "external"]))
        else:
            query = query.where(DocumentChunk.agent_type == agent_type)
            
        result = await db.execute(query)
        all_chunks = result.scalars().all()

        if not all_chunks:
            return []

        query_vec = np.array(query_embedding)
        similarities = []

        for chunk in all_chunks:
            if chunk.embedding:
                chunk_vec = np.array(chunk.embedding)
                # Cosine similarity
                similarity = float(
                    np.dot(query_vec, chunk_vec) /
                    (np.linalg.norm(query_vec) * np.linalg.norm(chunk_vec))
                )

                # Always add to similarities, we'll filter by threshold later if needed
                similarities.append((chunk, similarity))

        # Sort by similarity (descending)
        similarities.sort(key=lambda x: x[1], reverse=True)

        if not similarities:
            return []

        # Log top similarity scores for debugging
        if len(similarities) > 0:
            top_scores = [f"{score:.3f}" for _, score in similarities[:5]]
            logger.debug(f"Top 5 similarity scores: {', '.join(top_scores)}")

        # If threshold is very low (<= 0.1), return top N regardless of score
        # For very low thresholds (<= 0.05), always return top results
        if threshold <= 0.05:
            return similarities[:limit]
        elif threshold <= 0.1:
            # For low thresholds, return top N but log scores
            return similarities[:limit]
        else:
            # Filter by threshold, but ensure we get at least some results
            filtered = [(chunk, score) for chunk, score in similarities if score >= threshold]
            if filtered:
                return filtered[:limit]
            else:
                # If no results meet threshold, return top results anyway (for thresholds <= 0.3)
                # This ensures we always return something if chunks exist
                if threshold <= 0.3:
                    logger.info(f"No results above threshold {threshold}, returning top {limit} results anyway (scores: {[f'{s:.3f}' for _, s in similarities[:limit]]})")
                    return similarities[:limit]
                # For higher thresholds, still return top 3 if available
                if len(similarities) >= 3:
                    logger.info(f"Threshold {threshold} too high, returning top 3 results (scores: {[f'{s:.3f}' for _, s in similarities[:3]]})")
                    return similarities[:3]
                return []

