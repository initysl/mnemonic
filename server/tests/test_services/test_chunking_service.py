"""Passage splitting: no text may be lost, and offsets must point at it."""
import pytest

from app.services.chunking_service import CHUNK_SIZE, split_note_content


class TestSplitNoteContent:
    def test_short_content_is_a_single_chunk(self):
        chunks = split_note_content("A short note.")

        assert len(chunks) == 1
        assert chunks[0].content == "A short note."
        assert chunks[0].start_offset == 0

    def test_long_content_is_split(self):
        chunks = split_note_content("word " * 2000)

        assert len(chunks) > 1

    def test_every_chunk_fits_the_window(self):
        chunks = split_note_content("word " * 5000)

        assert all(len(chunk.content) <= CHUNK_SIZE for chunk in chunks)

    def test_offsets_locate_the_chunk_in_the_source(self):
        content = "word " * 3000
        for chunk in split_note_content(content):
            assert content[chunk.start_offset : chunk.end_offset] == chunk.content

    def test_no_content_is_lost(self):
        """Concatenating the chunks must cover every non-space character."""
        content = " ".join(f"token{i}" for i in range(2000))

        chunks = split_note_content(content)
        covered = "".join(chunk.content for chunk in chunks)

        for token in ("token0", "token999", "token1999"):
            assert token in covered

    def test_chunks_overlap(self):
        chunks = split_note_content("word " * 2000)

        # Each chunk starts before the previous one ended.
        for previous, current in zip(chunks, chunks[1:]):
            assert current.start_offset < previous.end_offset

    def test_chunks_advance(self):
        """Offsets must strictly increase, or the loop would never terminate."""
        chunks = split_note_content("word " * 5000)

        starts = [chunk.start_offset for chunk in chunks]
        assert starts == sorted(starts)
        assert len(set(starts)) == len(starts)

    @pytest.mark.parametrize("content", ["", "   ", "\n\n\t "])
    def test_blank_content_yields_no_chunks(self, content):
        assert split_note_content(content) == []

    def test_content_without_separators_is_still_split(self):
        """A single unbroken token must not defeat the windowing."""
        chunks = split_note_content("x" * (CHUNK_SIZE * 3))

        assert len(chunks) > 1
        assert all(chunk.content for chunk in chunks)

    def test_chunks_are_stripped(self):
        for chunk in split_note_content("word " * 2000):
            assert chunk.content == chunk.content.strip()
