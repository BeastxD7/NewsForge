# NewsForge

AI-powered news and content platform. Automatically monitors news feeds, RSS, Google Trends, and YouTube channels — then generates SEO-optimised articles using Claude AI and queues them for admin review before publishing.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, Tailwind v4, Shadcn UI |
| Backend | Express 5, BullMQ workers |
| Database | PostgreSQL 16 + Prisma 6 |
| Cache / Queue | Redis 7 |
| Auth | NextAuth v5 |
| AI | Anthropic Claude API |
| Runtime | Bun |

---

## Prerequisites

Before you start, make sure you have the following installed:

- **[Bun](https://bun.sh)** `>= 1.3` — used for everything (install, run, test)
- **[Docker Desktop](https://www.docker.com/products/docker-desktop)** — runs PostgreSQL and Redis locally
- **[Git](https://git-scm.com)**

> Do not use `npm`, `yarn`, or `pnpm`. This project uses Bun exclusively.

---

## Project Structure

```
news-app/
├── apps/
│   ├── web/          Next.js 16 frontend          → http://localhost:3000
│   └── server/       Express 5 API + workers       → http://localhost:3001
├── packages/
│   ├── db/           Prisma schema, migrations, seed
│   └── types/        Shared TypeScript types (DTOs)
├── tests/
│   ├── unit/         Fast tests, no DB required
│   └── integration/  Full HTTP tests, requires Docker
├── docs/
│   └── concept.md    Full architecture & implementation guide
├── docker-compose.yml
├── .env.example
└── CLAUDE.md         AI coding conventions
```

---

## First-Time Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url> news-app
cd news-app
bun install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the required values:

```bash
# Required for basic functionality
ANTHROPIC_API_KEY=sk-ant-...        # Get from console.anthropic.com
NEXTAUTH_SECRET=<random-32-chars>   # Run: openssl rand -base64 32
API_SECRET=<any-random-string>      # Shared secret between web and server

# Optional — workers will skip these sources if not set
NEWSAPI_KEY=...                     # newsapi.org
GNEWS_API_KEY=...                   # gnews.io
YOUTUBE_API_KEY=...                 # console.cloud.google.com
```

> All other values (`DATABASE_URL`, `REDIS_URL`, `PORT`, etc.) already match the Docker setup and don't need changing for local development.

### 3. Start infrastructure (PostgreSQL + Redis)

```bash
bun run docker:up
```

Verify both containers are healthy:

```bash
docker compose ps
```

You should see both `newsapp_postgres` and `newsapp_redis` with status `healthy`.

### 4. Run database migrations

```bash
bun run db:migrate
```

This creates all tables in PostgreSQL based on the Prisma schema.

### 5. Seed the database

```bash
bun run db:seed
```

This creates:
- An admin user (`admin@newsforge.com` / `admin123`)
- 8 default categories (Technology, Business, Science, etc.)
- A default "General Trending" topic

> **Change the admin password** after your first login.

### 6. Generate Prisma client

```bash
bun run db:generate
```

> This is already done during `db:migrate`, but run it manually if you see Prisma type errors.

---

## Running in Development

### Start both apps together

```bash
# Terminal 1 — API server (port 3001)
bun run dev:server

# Terminal 2 — Next.js frontend (port 3000)
bun run dev:web
```

Or start both with one command (output will be interleaved):

```bash
bun run dev
```

### Verify everything is running

```bash
# Server health check
curl http://localhost:3001/api/v1/health
# → {"status":"ok","timestamp":"..."}

# Frontend
open http://localhost:3000

# Admin dashboard
open http://localhost:3000/admin
# Login: admin@newsforge.com / admin123
```

---

## All Available Commands

### Development

```bash
bun run dev              # Start all apps
bun run dev:web          # Start Next.js only  (port 3000)
bun run dev:server       # Start Express only  (port 3001)
```

### Database

```bash
bun run db:migrate       # Create + apply new migration
bun run db:generate      # Regenerate Prisma client after schema change
bun run db:seed          # Seed admin user + default categories
bun run db:push          # Force-push schema (prototype only, never in prod)
bun run db:studio        # Open Prisma Studio GUI → http://localhost:5555
```

### Docker

```bash
bun run docker:up        # Start PostgreSQL + Redis
bun run docker:down      # Stop containers (data is preserved)
docker compose down -v   # Stop + delete all data (full reset)
```

### Testing

```bash
bun run test             # Run all tests
bun run test:unit        # Unit tests only (no DB or Docker needed)
bun run test:integration # Integration tests (requires docker:up + db:migrate)
bun run test:watch       # Watch mode for unit tests
```

### Build

```bash
bun run build            # Build all apps for production
bun run typecheck        # TypeScript type check across all packages
bun run lint             # ESLint across all packages
```

### Adding Shadcn Components

```bash
cd apps/web
bunx shadcn@latest add button
bunx shadcn@latest add card
bunx shadcn@latest add table
bunx shadcn@latest add dialog
bunx shadcn@latest add badge
bunx shadcn@latest add input
bunx shadcn@latest add select
# etc.
```

---

## Making Schema Changes

1. Edit `packages/db/prisma/schema.prisma`
2. Run `bun run db:migrate` — enter a migration name when prompted
3. Prisma client is regenerated automatically
4. Commit the new migration file in `packages/db/prisma/migrations/`

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `NEXTAUTH_SECRET` | Yes | Random secret for session encryption |
| `NEXTAUTH_URL` | Yes | Public URL of the Next.js app |
| `API_SECRET` | Yes | Shared secret for web → server auth |
| `ANTHROPIC_API_KEY` | Yes | Claude AI API key |
| `PORT` | No | Express server port (default: 3001) |
| `NODE_ENV` | No | `development` / `production` (default: development) |
| `NEXT_PUBLIC_API_URL` | No | Express server URL seen by browser (default: http://localhost:3001) |
| `NEWSAPI_KEY` | No | NewsAPI.org key (news-fetch worker) |
| `GNEWS_API_KEY` | No | GNews.io key (gnews-fetch worker) |
| `YOUTUBE_API_KEY` | No | YouTube Data API v3 key (channel monitor worker) |

---

## Default Ports

| Service | Port |
|---|---|
| Next.js (web) | 3000 |
| Express (server) | 3001 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Prisma Studio | 5555 |

---

## Default Credentials

| Account | Email | Password |
|---|---|---|
| Admin | `admin@newsforge.com` | `admin123` |

> Created by `bun run db:seed`. Change these immediately after setup.

---

## Troubleshooting

**Port already in use**

```bash
# Find what's using port 3001
netstat -ano | grep :3001

# Windows — kill by PID
cmd /c "taskkill /PID <pid> /F"

# Mac/Linux
kill -9 <pid>
```

**Database connection refused**

```bash
# Make sure Docker is running
docker compose ps

# Restart containers
bun run docker:down && bun run docker:up

# Re-run migrations
bun run db:migrate
```

**Prisma type errors after schema change**

```bash
bun run db:generate
```

**`bun install` fails with workspace errors**

```bash
# Run from the repo root, not inside an app folder
cd news-app
bun install
```

**Integration tests failing with connection errors**

Make sure both Docker and the server are running before running integration tests:

```bash
bun run docker:up
bun run dev:server   # in a separate terminal
bun run test:integration
```

---

## Documentation

Full architecture, pipeline diagrams, database schema, and plain-English explanations are in:

```
docs/concept.md
```

Coding conventions, Bun rules, and patterns for this project:

```
CLAUDE.md
```

---

## Git History

```bash
git log --oneline
```
