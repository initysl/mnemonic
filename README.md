# Mnemonic

Your personal memory notes system.Mnemonic turns your notes into a living knowledge base. Write naturally, then ask questions, by text or voice and get precise answers from your own thoughts.

## Structure

- `client/`: Next.js web app
- `server/`: FastAPI API + database access

## Tech Stack

- Frontend: Next.js (React), Tailwind CSS
- Backend: FastAPI, SQLAlchemy, Uvicorn
- Database: PostgreSQL (with `pgvector`)
- Auth: Auth0 (JWT)
- AI/ML:
  - API `Grok`
  - OpenAI Whisper `whisper-large-v3` for transcription
  - Meta Llama `llama-3.1-8b-instant` for note reasoning
  - Hugging Face Inference API `sentence-transformers/all-MiniLM-L6-v2` for embeddings

## Quickstart

### Backend (FastAPI)

```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql+psycopg2://user:pass@localhost:5432/mnemonic"
export AUTH0_DOMAIN="your-tenant.auth0.com"
export AUTH0_API_AUDIENCE="your-api-audience"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: `http://localhost:8000/docs`

### Frontend (Next.js)

```bash
cd client
npm install
export NEXT_PUBLIC_API_BASE_URL="http://localhost:8000/api/v1"
export AUTH0_BASE_URL="http://localhost:3000"
export AUTH0_ISSUER_BASE_URL="https://your-tenant.auth0.com"
export AUTH0_CLIENT_ID="..."
export AUTH0_CLIENT_SECRET="..."
export AUTH0_SECRET="..."
npm run dev
```

App: `http://localhost:3000`

## Docker

Set the required env vars (Auth0 + AI keys) in your shell or a `.env` file, then run:

```bash
docker compose up --build
```

Services:

- API: `http://localhost:8000`
- Web: `http://localhost:3000`

## Notes

- The backend requires `DATABASE_URL` at startup.
- Auth0 is required for authenticated endpoints. See `client/README.md` for client-side details.
