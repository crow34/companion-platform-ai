# Companion Platform AI (Project 3)

Human-like companion platform focused on genuine, non-sexual connection.

## Status

- ✅ Project initialized and polished UI shell added
- ✅ Home, roadmap, and companion directory pages
- ✅ Prototype API routes for companion creation/listing and chat
- ✅ PostgreSQL + Prisma schema added
- ✅ Gemini chat reply integration added (with fallback)
- 🚧 Next: auth, moderation workflow, and richer memory retrieval

## Core product direction

1. Companion creation (tone, personality, boundaries)
2. Natural conversation (text first, voice-ready)
3. Long-term memory with user controls
4. Social layer (public companion pages + controlled companion interactions)

## Current routes

- `/` — project overview
- `/companions` — sample companion profiles
- `/roadmap` — staged implementation plan
- `GET /api/companions` — list companion profiles
- `POST /api/companions` — create companion profile
- `POST /api/chat` — companion chat response generation

> When `DATABASE_URL` is set, routes persist to PostgreSQL.
> Without `DATABASE_URL`, routes run in fallback in-memory mode.

## Tech stack

- Next.js 14 + TypeScript + Tailwind
- Prisma + PostgreSQL
- Gemini API (`@google/generative-ai`)

## Run locally

```bash
npm install
npm run db:generate
npm run db:push
npm run dev
```

## Environment

Copy `.env.example` to `.env.local`:

- `DATABASE_URL` (optional for persistence)
- `GEMINI_API_KEY` (optional for model responses)
- `GEMINI_MODEL` (defaults to `gemini-1.5-flash`)

If Gemini key is missing, API falls back to a safe template response.

## Upcoming implementation plan

- Add auth + account management
- Add conversation history UI with pagination
- Add memory extraction/retrieval per companion
- Add safety and moderation policy layer
