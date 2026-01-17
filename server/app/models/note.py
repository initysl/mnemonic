from sqlalchemy import Column, String, Text, DateTime, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
import uuid
from app.core.database import Base


class Note(Base):
    __tablename__ = "notes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=False)
    tags = Column(ARRAY(String), nullable=False, server_default='{}')
    embedding = Column(Vector(384), nullable=True)
    created_at = Column(
        DateTime(timezone=True), 
        nullable=False, 
        server_default=func.now(),
        index=True
    )
    updated_at = Column(
        DateTime(timezone=True), 
        onupdate=func.now(),
        server_default=func.now()
    )
    
    def __repr__(self):
        return f"<Note {self.id}: {self.title[:30]}>"