# Golden Rama Tours & Travel - Landing Page & Chatbot

A modern, high-performance landing page for Golden Rama Tours & Travel, featuring an AI-powered travel assistant chatbot.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + Shadcn UI
- **Choice of AI:** Vercel AI SDK + OpenRouter (Gemini 2.0 Flash)
- **Database:** PostgreSQL (via Docker)
- **ORM:** Drizzle ORM

## Prerequisites
- Node.js 18+
- Docker Desktop (must be running)
- OpenRouter API Key

## Setup Instructions

1.  **Environment Setup**
    - Rename `.env.example` to `.env` (or create it) with the following:
      ```env
      DATABASE_URL=postgresql://postgres:postgres@localhost:5433/goldenrama_db
      OPENROUTER_API_KEY=your_api_key_here
      ```
    - Also ensure `.env.local` exists for Next.js with the same values.

2.  **Start Database**
    ```bash
    docker compose up -d
    ```

3.  **Install Dependencies**
    ```bash
    npm install
    ```

4.  **Database Setup (Schema & Seed)**
    Run the following commands to generate schema and seed the database with tour packages:
    ```bash
    npm run db:generate
    npm run db:migrate
    npm run db:seed
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## Features
- **Modern UI:** Responsive design with "wow" factor aesthetics.
- **AI Chatbot:** Floating action button opens a chat assistant that can:
  - Search for tours (Winter, Beach, Popular, etc.)
  - Recommend packages with real-time DB data.
  - Capture leads (Name + WhatsApp) and generating WhatsApp deep links.
- **Dynamic Content:** Partner logos, tour cards, and testimonials.

## Project Structure
- `/src/components/landing`: Landing page sections (Hero, Spotlight, Footer...).
- `/src/components/chat`: Chat window and AI interaction logic.
- `/src/app/api/chat`: AI backend route (Edge Runtime).
- `/src/db`: Drizzle ORM schema, config, and seed script.

## Troubleshooting
- **Database Connection Error:** Ensure Docker is running and port 5433 is available.
- **AI Not Responding:** Check your `OPENROUTER_API_KEY` and internet connection.
