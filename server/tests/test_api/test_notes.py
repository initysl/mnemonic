"""Notes API: CRUD, pagination, and per-user isolation."""
import pytest

from tests.conftest import OTHER_USER_ID, TEST_USER_ID, requires_db

pytestmark = requires_db


def create_note(client, title="Python Tips", content="List comprehensions are fast", tags=None):
    response = client.post(
        "/api/v1/notes",
        json={"title": title, "content": content, "tags": tags or ["python"]},
    )
    assert response.status_code == 201, response.text
    return response.json()


class TestNoteCrud:
    def test_create_returns_the_stored_note(self, client):
        note = create_note(client)

        assert note["title"] == "Python Tips"
        assert note["content"] == "List comprehensions are fast"
        assert note["tags"] == ["python"]
        assert note["id"]

    def test_get_returns_the_note(self, client):
        created = create_note(client)

        response = client.get(f"/api/v1/notes/{created['id']}")

        assert response.status_code == 200
        assert response.json()["id"] == created["id"]

    def test_update_changes_fields(self, client):
        created = create_note(client)

        response = client.put(
            f"/api/v1/notes/{created['id']}",
            json={"title": "Updated title"},
        )

        assert response.status_code == 200
        assert response.json()["title"] == "Updated title"
        # Untouched fields survive a partial update.
        assert response.json()["content"] == created["content"]

    def test_delete_removes_the_note(self, client):
        created = create_note(client)

        assert client.delete(f"/api/v1/notes/{created['id']}").status_code == 200
        assert client.get(f"/api/v1/notes/{created['id']}").status_code == 404

    def test_missing_note_is_404(self, client):
        response = client.get("/api/v1/notes/00000000-0000-0000-0000-000000000000")
        assert response.status_code == 404

    def test_malformed_id_is_422(self, client):
        assert client.get("/api/v1/notes/not-a-uuid").status_code == 422

    @pytest.mark.parametrize(
        "payload",
        [
            {"title": "", "content": "body", "tags": []},
            {"title": "ok", "content": "", "tags": []},
            {"title": "ok", "content": "   ", "tags": []},
            {"title": "ok", "content": "body", "tags": ["x"] * 21},
        ],
        ids=["blank-title", "blank-content", "whitespace-content", "too-many-tags"],
    )
    def test_invalid_payloads_are_rejected(self, client, payload):
        assert client.post("/api/v1/notes", json=payload).status_code == 422


class TestNoteIsolation:
    """
    The security property the whole app rests on: notes are scoped to the
    authenticated user, and another user's note must be indistinguishable
    from one that does not exist.
    """

    def test_other_user_cannot_read(self, client, as_other_user):
        created = create_note(client)

        as_other_user()

        assert client.get(f"/api/v1/notes/{created['id']}").status_code == 404

    def test_other_user_cannot_update(self, client, as_other_user):
        created = create_note(client)

        as_other_user()
        response = client.put(
            f"/api/v1/notes/{created['id']}", json={"title": "hijacked"}
        )

        assert response.status_code == 404

    def test_other_user_cannot_delete(self, client, as_other_user):
        created = create_note(client)

        as_other_user()

        assert client.delete(f"/api/v1/notes/{created['id']}").status_code == 404

    def test_update_by_other_user_does_not_modify_the_note(self, client, as_other_user):
        created = create_note(client)

        as_other_user()
        client.put(f"/api/v1/notes/{created['id']}", json={"title": "hijacked"})

        as_other_user(TEST_USER_ID)
        assert client.get(f"/api/v1/notes/{created['id']}").json()["title"] == "Python Tips"

    def test_list_only_returns_own_notes(self, client, as_other_user):
        create_note(client, title="Mine")

        as_other_user()
        create_note(client, title="Theirs")

        listing = client.get("/api/v1/notes").json()
        assert [note["title"] for note in listing["notes"]] == ["Theirs"]
        assert listing["total"] == 1

        as_other_user(TEST_USER_ID)
        listing = client.get("/api/v1/notes").json()
        assert [note["title"] for note in listing["notes"]] == ["Mine"]
        assert listing["total"] == 1

    def test_delete_all_only_deletes_own_notes(self, client, as_other_user):
        create_note(client, title="Mine")

        as_other_user()
        create_note(client, title="Theirs")
        response = client.delete("/api/v1/notes")

        assert response.status_code == 200
        assert response.json()["deleted_count"] == 1

        as_other_user(TEST_USER_ID)
        assert client.get("/api/v1/notes").json()["total"] == 1

    def test_stats_are_per_user(self, client, as_other_user):
        create_note(client, title="Mine", tags=["a", "b"])

        as_other_user()
        assert client.get("/api/v1/notes/stats").json()["total_notes"] == 0

        as_other_user(TEST_USER_ID)
        stats = client.get("/api/v1/notes/stats").json()
        assert stats["total_notes"] == 1
        assert sorted(stats["tags"]) == ["a", "b"]


class TestNoteListing:
    def test_pagination_splits_results(self, client):
        for index in range(5):
            create_note(client, title=f"Note {index}")

        first = client.get("/api/v1/notes", params={"page": 1, "page_size": 2}).json()
        second = client.get("/api/v1/notes", params={"page": 2, "page_size": 2}).json()

        assert first["total"] == 5
        assert len(first["notes"]) == 2
        assert len(second["notes"]) == 2
        first_ids = {note["id"] for note in first["notes"]}
        assert first_ids.isdisjoint({note["id"] for note in second["notes"]})

    def test_page_beyond_the_end_is_empty(self, client):
        create_note(client)

        result = client.get("/api/v1/notes", params={"page": 50, "page_size": 20}).json()

        assert result["notes"] == []
        assert result["total"] == 1

    def test_tag_filter(self, client):
        create_note(client, title="Tagged", tags=["work"])
        create_note(client, title="Untagged", tags=["home"])

        result = client.get("/api/v1/notes", params={"tag": "work"}).json()

        assert [note["title"] for note in result["notes"]] == ["Tagged"]

    @pytest.mark.parametrize("page,page_size", [(0, 20), (1, 0), (1, 101)])
    def test_out_of_range_pagination_is_rejected(self, client, page, page_size):
        response = client.get(
            "/api/v1/notes", params={"page": page, "page_size": page_size}
        )
        assert response.status_code == 422


class TestNoteChunking:
    def test_creating_a_note_embeds_its_chunks_in_one_batch(self, client, fake_embeddings):
        create_note(client, content="word " * 2000)

        # One batched call, not one call per chunk.
        assert fake_embeddings["batch"] == 1
        assert fake_embeddings["batch_sizes"][0] > 1

    def test_updating_content_reembeds(self, client, fake_embeddings):
        created = create_note(client)
        before = fake_embeddings["batch"]

        client.put(f"/api/v1/notes/{created['id']}", json={"content": "new body"})

        assert fake_embeddings["batch"] == before + 1

    def test_updating_only_tags_does_not_reembed(self, client, fake_embeddings):
        created = create_note(client)
        before = fake_embeddings["batch"]

        client.put(f"/api/v1/notes/{created['id']}", json={"tags": ["new"]})

        assert fake_embeddings["batch"] == before

    def test_deleting_a_note_removes_its_chunks(self, client, db_session):
        from app.models.note_chunk import NoteChunk

        created = create_note(client, content="word " * 2000)
        assert db_session.query(NoteChunk).count() > 0

        client.delete(f"/api/v1/notes/{created['id']}")

        assert db_session.query(NoteChunk).count() == 0
