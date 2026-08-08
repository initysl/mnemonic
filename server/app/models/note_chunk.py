import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class NoteChunk(Base):
    """A searchable passage from a note, kept small for precise retrieval."""

    __tablename__ = "note_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    note_id = Column(
        UUID(as_uuid=True),
        ForeignKey("notes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content = Column(Text, nullable=False)
    start_offset = Column(Integer, nullable=False)
    end_offset = Column(Integer, nullable=False)
    embedding = Column(Vector(384), nullable=False)

    note = relationship("Note", back_populates="chunks")
