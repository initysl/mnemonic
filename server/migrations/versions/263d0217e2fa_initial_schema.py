"""Initial schema

Revision ID: 263d0217e2fa
Revises:
Create Date: 2026-01-15 01:12:14.068794

The DDL here is written with IF NOT EXISTS guards because earlier deployments
built their schema from Base.metadata.create_all() rather than from Alembic.
That lets an existing database be stamped or upgraded without conflicting with
tables it already has, while a fresh database still gets the full schema.
"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '263d0217e2fa'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS notes (
            id UUID PRIMARY KEY,
            user_id VARCHAR NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            tags VARCHAR[] NOT NULL DEFAULT '{}',
            embedding vector(384),
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        )
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_notes_user_id ON notes (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_notes_title ON notes (title)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_notes_created_at ON notes (created_at)")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS note_chunks (
            id UUID PRIMARY KEY,
            note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            start_offset INTEGER NOT NULL,
            end_offset INTEGER NOT NULL,
            embedding vector(384) NOT NULL
        )
        """
    )
    op.execute(
        "CREATE INDEX IF NOT EXISTS ix_note_chunks_note_id ON note_chunks (note_id)"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP TABLE IF EXISTS note_chunks")
    op.execute("DROP TABLE IF EXISTS notes")
