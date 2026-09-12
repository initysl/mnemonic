"""
Shared test fixtures.

The tests that touch the database need real PostgreSQL with pgvector, since
the schema uses vector(384) columns. Point TEST_DATABASE_URL at a disposable
database, or let the fixtures derive one named "<your database>_test".

Because creating the pgvector extension requires superuser rights that the
application role usually lacks, the test database is created with
`CREATE DATABASE ... TEMPLATE <main database>`, which copies the already
installed extension. Every table is truncated before each test, so no data
copied from the template survives into a test run.

If no database is reachable, the database-backed tests are skipped and the
pure-logic tests still run.
"""
import os
from typing import Iterator
from unittest.mock import MagicMock

import pytest
from dotenv import load_dotenv

load_dotenv()

TEST_USER_ID = "auth0|test-user-a"
OTHER_USER_ID = "auth0|test-user-b"
EMBEDDING_DIMENSIONS = 384


# Captured before DATABASE_URL is redirected at the test database below.
APP_DATABASE_URL = os.getenv("DATABASE_URL", "")
EXPLICIT_TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "")


def _derive_test_database_url() -> str:
    if EXPLICIT_TEST_DATABASE_URL:
        return EXPLICIT_TEST_DATABASE_URL
    if not APP_DATABASE_URL:
        return ""

    base_url, _, name = APP_DATABASE_URL.rpartition("/")
    # Keep any query string out of the database name before suffixing it.
    name, sep, params = name.partition("?")
    return f"{base_url}/{name}_test{sep}{params}"


TEST_DATABASE_URL = _derive_test_database_url()

# The application reads DATABASE_URL at import time, so it has to point at the
# test database before anything under app.* is imported.
if TEST_DATABASE_URL:
    os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ.setdefault("HF_TOKEN", "test-token")
os.environ.setdefault("GROQ_API_KEY", "test-key")
os.environ.setdefault("AUTH0_DOMAIN", "test.auth0.com")
os.environ.setdefault("AUTH0_AUDIENCE", "test-audience")


def _ensure_test_database() -> bool:
    """Create the test database from the main one if it does not exist."""
    from sqlalchemy import create_engine, text

    if _can_connect(TEST_DATABASE_URL):
        return True

    # An explicitly provided database is the caller's to create.
    if EXPLICIT_TEST_DATABASE_URL or not APP_DATABASE_URL:
        return False

    admin_url = APP_DATABASE_URL.rpartition("/")[0] + "/postgres"
    template_name = APP_DATABASE_URL.rpartition("/")[2].partition("?")[0]
    test_name = TEST_DATABASE_URL.rpartition("/")[2].partition("?")[0]

    try:
        engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")
        with engine.connect() as connection:
            connection.execute(
                text(f'CREATE DATABASE "{test_name}" TEMPLATE "{template_name}"')
            )
        return _can_connect(TEST_DATABASE_URL)
    except Exception:
        return False


def _can_connect(url: str) -> bool:
    if not url:
        return False
    from sqlalchemy import create_engine, text

    try:
        engine = create_engine(url)
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


_DATABASE_AVAILABLE = _ensure_test_database()

requires_db = pytest.mark.skipif(
    not _DATABASE_AVAILABLE,
    reason="No test database reachable; set TEST_DATABASE_URL to run these.",
)


@pytest.fixture(scope="session")
def _migrated_database() -> str:
    """Bring the test database up to the current schema, once per session."""
    if not _DATABASE_AVAILABLE:
        pytest.skip("No test database reachable")

    from alembic import command
    from alembic.config import Config

    config = Config(os.path.join(os.path.dirname(os.path.dirname(__file__)), "alembic.ini"))
    config.set_main_option("sqlalchemy.url", TEST_DATABASE_URL)
    command.upgrade(config, "head")
    return TEST_DATABASE_URL


@pytest.fixture
def db_session(_migrated_database) -> Iterator:
    """A clean database session; every table is emptied first."""
    from sqlalchemy import text
    from app.core.database import SessionLocal, engine

    with engine.begin() as connection:
        connection.execute(text("TRUNCATE note_chunks, notes RESTART IDENTITY CASCADE"))

    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """
    Clear the process-global request counters between tests.
    The limiter lives for the lifetime of the app object, so without this a
    long test session eventually 429s every remaining request.
    """
    if not _DATABASE_AVAILABLE:
        yield
        return

    from app.main import rate_limiter

    rate_limiter.requests.clear()
    yield
    rate_limiter.requests.clear()


@pytest.fixture
def fake_embeddings(monkeypatch):
    """
    Replace the HuggingFace calls with deterministic vectors.
    Tests must never depend on a live inference endpoint.
    """
    from app.services import embedding_service as module

    def _vector_for(text: str) -> list:
        # Deterministic, unit-length-ish, and distinct per input.
        seed = sum(ord(c) for c in text) or 1
        return [((seed * (i + 1)) % 97) / 97.0 for i in range(EMBEDDING_DIMENSIONS)]

    calls = {"single": 0, "batch": 0, "batch_sizes": []}

    def fake_single(self, text: str):
        calls["single"] += 1
        return _vector_for(text)

    def fake_batch(self, texts):
        calls["batch"] += 1
        calls["batch_sizes"].append(len(texts))
        return [_vector_for(t) for t in texts]

    monkeypatch.setattr(module.EmbeddingService, "generate_embedding", fake_single)
    monkeypatch.setattr(module.EmbeddingService, "generate_batch_embeddings", fake_batch)
    return calls


@pytest.fixture
def fake_llm(monkeypatch):
    """Replace Groq reasoning with a canned answer."""
    from app.services import llm_service as module

    def fake_reason(self, query, retrieved_notes, max_tokens=500):
        return {
            "answer": f"Answer about: {query}",
            "cited_notes": [note["id"] for note in retrieved_notes[:1]],
        }

    monkeypatch.setattr(module.LLMService, "reason_over_notes", fake_reason)


@pytest.fixture
def client(db_session, fake_embeddings, fake_llm) -> Iterator:
    """
    A TestClient authenticated as TEST_USER_ID.
    Token verification is replaced by a dependency override so the tests do
    not need a live Auth0 tenant; everything below the auth boundary, including
    the per-user filtering these tests exist to check, runs for real.
    """
    from fastapi.testclient import TestClient
    from app.core.auth import get_user_id
    from app.core.database import get_db
    from app.main import app

    def _override_get_db():
        # Must be a generator function: FastAPI only applies its
        # enter/exit handling to generator dependencies.
        yield db_session

    app.dependency_overrides[get_user_id] = lambda: TEST_USER_ID
    app.dependency_overrides[get_db] = _override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def as_other_user():
    """Switch the authenticated identity for the remainder of a test."""
    from app.core.auth import get_user_id
    from app.main import app

    def _switch(user_id: str = OTHER_USER_ID):
        app.dependency_overrides[get_user_id] = lambda: user_id

    return _switch


@pytest.fixture
def upload_file():
    """Build a minimal UploadFile-like object for voice service tests."""
    import io
    from fastapi import UploadFile

    def _make(content: bytes, filename: str, content_type: str) -> UploadFile:
        file = UploadFile(file=io.BytesIO(content), filename=filename)
        # UploadFile derives content_type from headers; set it directly.
        file.__dict__["headers"] = {"content-type": content_type}
        mock_headers = MagicMock()
        mock_headers.get = lambda key, default=None: (
            content_type if key.lower() == "content-type" else default
        )
        object.__setattr__(file, "headers", mock_headers)
        return file

    return _make
