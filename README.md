# UpRev Travel Platform & AI Agent

A modern travel agency website featuring an intelligent AI sales assistant. This project combines a beautiful, responsive travel catalog with a powerful AI agent capable of searching packages, answering questions, and facilitating bookings via WhatsApp.

## 🚀 Features

-   **Travel Website**: Stunning landing page with featured tours, testimonials, and seasonal highlights.
-   **AI Sales Agent**: Context-aware chatbot that understands travel preferences and guides users.
-   **Hybrid Search**: Semantic search (vector embeddings) mixed with keyword matching for accurate package discovery.
-   **Automated Booking**: Collects customer details and generates official WhatsApp booking links.
-   **Modern UI**: Responsive, beautiful chat interface built with Next.js and Tailwind CSS.
-   **Containerized**: Fully Dockerized setup for easy deployment (Frontend + Backend + Database).

## 🛠️ Tech Stack

-   **Frontend**: Next.js 14, Tailwind CSS, Framer Motion, Lucide React.
-   **Backend**: Python 3.12, FastAPI, LangGraph, LangChain, SQLAlchemy.
-   **Database**: PostgreSQL with `pgvector` extension.
-   **AI/LLM**: OpenRouter (supporting Gemini, OpenAI, etc.).

## 📂 Project Structure

```
Travel-Tours-AI-Chatbot-Sample/
├── server/                 # Python Backend
│   ├── api/                # API Endpoints (Chat, Bookings)
│   ├── db/                 # Database constraints & Seeding
│   ├── services/           # Business Logic (Agent, Search, Booking)
│   ├── main.py             # App Entrypoint
│   └── Dockerfile          # Backend Docker config
├── src/                    # Next.js Frontend
│   ├── app/                # Pages & API Routes
│   ├── components/         # React Components
│   └── lib/                # Utilities
├── Dockerfile              # Frontend Docker config
├── docker-compose.yml      # Orchestration for all services
└── README.md               # You are here
```

## 🏎️ Quick Start

### 1. Prerequisites

-   Docker & Docker Compose installed.
-   An [OpenRouter API Key](https://openrouter.ai/).

### 2. Configuration

Create a `.env` file in the root directory:

```bash
# .env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
COMPANY_WHATSAPP=6281234567890
LOG_LEVEL=INFO

# Optional: LangSmith Tracing
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=your-langsmith-key
LANGSMITH_PROJECT=uprev-agent
```

### 3. Run with Docker 🐳

The entire application can be started with a single command:

```bash
docker-compose up --build
```

This will start:
-   **Main App (Nginx)**: http://localhost:3001 (or https://uprev.id in production)
-   **Frontend (Direct)**: http://localhost:3000
-   **Frontend**: Internal (proxied via Nginx)
-   **Backend API**: Internal (proxied via Nginx at `/api`)
-   **PostgreSQL**: Port 5433 (mapped to 5432 internal)

### Port Isolation
The app uses a dedicated Nginx container (`uprev_nginx`) to handle traffic.
-   Host Port `3001` -> Nginx -> Frontend/Backend
-   This avoids conflict with other apps running on ports 80/81.

### 4. Seed Data 🌱

The system automatically seeds the database with sample tour packages (Japan, Bali, Swiss, etc.) on startup. Check the backend logs to confirm:
`🌱 Seeding database...`

## 🧪 API Documentation

Once the backend is running, visit the auto-generated docs:
-   **Swagger UI**: http://localhost:8000/docs
-   **ReDoc**: http://localhost:8000/redoc

## 🔧 Development Notes

-   **Database**: The Postgres volume is persisted in `postgres_data`. To reset the DB, run `docker-compose down -v`.
-   **API Key Issues**: If you see "Failed to authenticate request with Clerk", ensure your OpenRouter key is valid and has credits.
-   **Frontend-Backend Connection**: The frontend server-side API routes communicate with the backend via `http://backend:8000` (internal Docker network).

## 📝 License
Proprietary / Internal Use Only.
