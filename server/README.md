# Travel AI Sales Agent - Python Backend

AI-powered travel package recommendation and booking assistant using LangGraph and OpenRouter.

## Features

- 🤖 **LangGraph AI Agent**: Stateful conversation flow with tool calling
- 🔍 **Hybrid Search**: Exact keyword matching + semantic vector search
- 📦 **Package Management**: Travel package database with embeddings
- 💬 **WhatsApp Integration**: Generate booking links with pre-filled messages
- 📊 **LangSmith Tracking**: Monitor and debug agent conversations
- 🌐 **OpenRouter Integration**: Use Gemini 2.0 Flash & OpenAI embeddings

## Prerequisites

- Python 3.11+
- UV package manager
- OpenRouter API key
- LangSmith API key (optional, for tracking)

## Setup

### 1. Install Dependencies

```bash
uv sync
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Edit `.env`:
```
OPENROUTER_API_KEY=your_openrouter_key_here
LANGSMITH_API_KEY=your_langsmith_key_here
LANGSMITH_TRACING=true
COMPANY_WHATSAPP=+6281234567890
```

### 3. Seed Database

Run the seed script to populate sample travel packages:

```bash
uv run python seed_data.py
```

This will:
- Create database tables
- Insert 5 sample travel packages
- Generate embeddings for semantic search

### 4. Run the Server

```bash
uv run python main.py
```

Or with uvicorn directly:

```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### POST `/api/chat`

Main chat endpoint for interacting with the AI agent.

**Request:**
```json
{
  "message": "Saya mau liburan ke Jepang musim dingin",
  "thread_id": "user-123"  // optional
}
```

**Response:**
```json
{
  "id": "msg-abc123",
  "role": "assistant",
  "content": "Saya menemukan paket ke Jepang yang sempurna untuk musim dingin! 🎿❄️..."
}
```

### GET `/`

Root endpoint - API information

### GET `/health`

Health check endpoint

## Project Structure

```
python_backend/
├── api/
│   └── chat.py           # Chat endpoint
├── db/
│   └── session.py        # Database session management
├── models/
│   ├── database.py       # SQLAlchemy models
│   └── schemas.py        # Pydantic schemas
├── services/
│   ├── agent_service.py  # LangGraph agent
│   ├── search_service.py # Hybrid search
│   └── booking_service.py# Booking logic
├── config.py             # Settings
├── main.py               # FastAPI app
└── seed_data.py          # Database seeding
```

## How It Works

### 1. Hybrid Search

- **Exact Match**: Fast SQL LIKE queries across title, destination, description
- **Semantic Search**: Vector similarity using OpenAI text-embedding-3-small
- **Re-ranking**: Combines both approaches for best results

### 2. LangGraph Agent

The agent follows this workflow:

```
User Message → Agent Reasoning → Tools (if needed) → Response
                     ↑                                    ↓
                     └────────── Tool Results ───────────┘
```

**Available Tools:**
- `search_packages`: Find travel packages by query
- `create_booking`: Create booking and generate WhatsApp link

### 3. Conversation Flow

1. **Discovery**: Agent asks about travel preferences
2. **Search**: Uses hybrid search to find relevant packages
3. **Recommendation**: Presents top 2-3 packages with highlights
4. **Q&A**: Answers questions about packages
5. **Booking**: Collects customer name & WhatsApp, generates booking

## LangSmith Monitoring

View your agent's conversation traces at: https://smith.langchain.com/

Set `LANGSMITH_TRACING=true` in `.env` to enable tracking.

## Development

### Run in Debug Mode

```bash
LOG_LEVEL=DEBUG uv run python main.py
```

### Test Search

```python
from db.session import get_db
from services.search_service import SearchService

with get_db() as db:
    search = SearchService(db)
    results = search.search_hybrid("Hokkaido")
    print(results)
```

### Test Agent

```bash
uv run python -c "from services.agent_service import chat; from db.session import get_db; \
with get_db() as db: print(chat('Saya mau ke Jepang', 'test-123', db))"
```

## Troubleshooting

**ImportError**: Make sure all dependencies are installed:
```bash
uv sync
```

**Database Error**: Re-initialize database:
```bash
rm travel_agent.db
uv run python seed_data.py
```

**API Key Error**: Check your `.env` file has valid OpenRouter API key

**No search results**: Run `seed_data.py` to populate packages with embeddings

## License

MIT
