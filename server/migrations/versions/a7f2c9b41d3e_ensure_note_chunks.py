"""Ensure note_chunks exists on databases that predate Alembic

Revision ID: a7f2c9b41d3e
Revises: 263d0217e2fa
Create Date: 2026-09-12 00:00:00.000000

Databases created before Alembic was used for real are stamped at
263d0217e2fa (which was an empty revision) and got their schema from
create_all(), so some of them have notes but no note_chunks -- and that
revision will never be replayed for them. Now that the app no longer calls
create_all(), those databases need the table created here. The IF NOT EXISTS
guards make this a no-op where the initial revision already built it.

Deliberately no HNSW index on the embedding columns: VectorService filters by
notes.user_id, and the planner satisfies that through ix_notes_user_id and
ix_note_chunks_note_id, narrowing to one user's chunks before ordering by
distance. An ANN index is never chosen for that plan, and measured ~34x
slower chunk inserts as dead weight. Revisit only if a single user's corpus
grows large enough that exact scoring hurts, which needs user_id denormalised
onto note_chunks so a filtered ANN scan is possible.
"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'a7f2c9b41d3e'
down_revision: Union[str, Sequence[str], None] = '263d0217e2fa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
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
    # note_chunks itself is owned by the initial revision, so it is not dropped
    # here; this revision only backfills it where it was missing.
    pass
