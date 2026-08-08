from dataclasses import dataclass
from typing import List


CHUNK_SIZE = 1_800
CHUNK_OVERLAP = 250
MIN_BREAK_SEARCH = 500


@dataclass(frozen=True)
class TextChunk:
    content: str
    start_offset: int
    end_offset: int


def split_note_content(content: str) -> List[TextChunk]:
    """Split a note into overlapping, readable passages without losing text."""
    chunks: List[TextChunk] = []
    start = 0
    content_length = len(content)

    while start < content_length:
        proposed_end = min(start + CHUNK_SIZE, content_length)
        end = proposed_end
        if proposed_end < content_length:
            break_at = max(
                content.rfind("\n", start + MIN_BREAK_SEARCH, proposed_end),
                content.rfind(" ", start + MIN_BREAK_SEARCH, proposed_end),
            )
            if break_at > start:
                end = break_at + 1

        raw_chunk = content[start:end]
        leading_whitespace = len(raw_chunk) - len(raw_chunk.lstrip())
        chunk_content = raw_chunk.strip()
        if chunk_content:
            chunk_start = start + leading_whitespace
            chunks.append(
                TextChunk(
                    content=chunk_content,
                    start_offset=chunk_start,
                    end_offset=chunk_start + len(chunk_content),
                )
            )

        if end >= content_length:
            break
        start = max(end - CHUNK_OVERLAP, start + 1)

    return chunks
