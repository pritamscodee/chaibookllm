# chaibookllm

AI-powered learning workspace: upload sources (PDFs, websites, YouTube),
chat over them with citations, and generate study artifacts (summaries,
flashcards, quizzes, mind maps, reports).

## Stack

- **client/** — Next.js 16 (App Router, Turbopack), Tailwind, shadcn/ui, TanStack Query
- **server/** — Express + TypeScript, Prisma (Postgres/Neon), better-auth
- **Background jobs** — Trigger.dev (source processing, conversation summarization, artifact generation)
- **AI** — OpenAI, Pinecone (vectors), Mem0 (memory), Tavily + Firecrawl (web)

## Getting started

```bash
# server
cd server && npm install && cp .env.example .env   # fill in values
npm run db:migrate && npm run dev

# client
cd client && npm install && cp .env.example .env.local
npm run dev
```

See `server/.env.example` and `client/.env.example` for required environment
variables. `API_URL` must be set for the client production build to succeed.

## Credits

This project started from [Aestheticsuraj234/chaibook-llm-build](https://github.com/Aestheticsuraj234/chaibook-llm-build).
