# Companion Platform AI (Project 3)

Human-like companion platform focused on genuine, non-sexual connection.

## Status

- ✅ Project initialized and polished UI shell added
- ✅ Home, roadmap, and companion directory pages
- ✅ Prototype API routes for companion creation/listing and chat responses
- 🚧 Next: auth, persistent DB schema, real model integration, safety layer

## Core product direction

1. Companion creation (tone, personality, boundaries)
2. Natural conversation (text first, voice-ready)
3. Long-term memory with user controls
4. Social layer (public companion pages + controlled companion interactions)

## Current routes

- `/` — project overview
- `/companions` — sample companion profiles
- `/roadmap` — staged implementation plan
- `GET /api/companions` — list prototype companions
- `POST /api/companions` — create prototype companion payload
- `POST /api/chat` — response scaffold for companion messaging

## Tech stack (initial)

- Next.js 14 + TypeScript + Tailwind

## Run locally

```bash
npm install
npm run dev
```

## Environment

Copy `.env.example` to `.env.local` and adjust values as needed.

## Upcoming implementation plan

- Add auth + account management
- Add DB schema for users, companions, conversations, memories
- Replace stub chat with Gemini integration + memory retrieval
- Add voice interaction pipeline and safety/moderation workflow
