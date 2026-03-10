# CLAUDE.md — NewsForge Coding Conventions

## Package Manager — ALWAYS use Bun

```bash
# CORRECT
bun install
bun add <package>
bun add -d <package>
bun remove <package>
bunx <cli-tool>
bun run <script>

# NEVER use these
npm install    ✗
yarn add       ✗
pnpm install   ✗
npx <tool>     ✗
```

Never create `package-lock.json` or `yarn.lock`. Only `bun.lockb` is valid.

## Monorepo Commands

```bash
# Run all apps in dev mode
bun run dev

# Run specific app
bun run dev:web
bun run dev:server

# Install dep in a specific workspace
bun add <pkg> --filter ./apps/web
bun add <pkg> --filter ./apps/server
bun add <pkg> --filter ./packages/db

# Database
bun run db:generate     # prisma generate
bun run db:migrate      # prisma migrate dev
bun run db:push         # prisma db push (prototype only)
bun run db:studio       # prisma studio
bun run db:seed         # seed the database
```

## TypeScript

- **Strict mode is required** — `"strict": true` in all tsconfig.json files
- No `any` types — use `unknown` and narrow properly
- No `!` non-null assertions — use proper null checks
- All functions must have explicit return types (except trivial one-liners)
- Use `type` for unions/intersections, `interface` for object shapes

## Project Structure

```
apps/web/src/
├── app/                  Next.js App Router pages
├── components/
│   ├── ui/               Shadcn primitives (DO NOT edit manually)
│   ├── layout/           Header, footer, sidebars
│   └── <feature>/        Feature-specific components
├── lib/                  Utilities, auth config, API client
├── hooks/                Custom React hooks
└── types/                Type augmentations (e.g. next-auth.d.ts)

apps/server/src/
├── api/v1/               Route handlers (router → controller → service)
├── workers/              BullMQ workers + queue registry
├── services/             External API wrappers (Claude, YouTube, etc.)
├── middleware/           Express middleware
├── config/               Env validation, Redis, etc.
└── lib/                  Shared utilities (prisma singleton)
```

## File Naming

- Components: `PascalCase.tsx` (e.g. `ArticleCard.tsx`)
- Hooks: `camelCase.ts` prefixed with `use` (e.g. `useArticles.ts`)
- Server files: `kebab-case.ts` (e.g. `articles.router.ts`)
- No `index.ts` barrel files unless re-exporting a package

## Shadcn UI

```bash
# Add Shadcn components
bunx shadcn@latest add button
bunx shadcn@latest add card
bunx shadcn@latest add <component>

# NEVER manually edit files inside components/ui/
# ALWAYS add new components via CLI
```

## Tailwind v4

- **No `tailwind.config.ts`** — Tailwind v4 is configured via CSS only
- Customization goes in `src/app/globals.css` under `@theme`
- Import: `@import "tailwindcss"` at top of globals.css
- Use `cn()` from `@/lib/utils` for conditional classes

## Environment Variables

- **All env vars must be validated with Zod at startup**
- Server env: `apps/server/src/config/env.ts`
- Web env: `apps/web/src/lib/env.ts`
- Public vars (Next.js): prefix with `NEXT_PUBLIC_`
- Never access `process.env` directly outside of env config files
- Never commit `.env` — only `.env.example`

```typescript
// CORRECT — always import from env config
import { env } from "@/config/env"
const apiKey = env.ANTHROPIC_API_KEY

// NEVER — direct process.env access
const apiKey = process.env.ANTHROPIC_API_KEY
```

## API Patterns (Express)

- All routes under `/api/v1/`
- Router → Controller → Service pattern (never skip layers)
- Controllers only handle HTTP (req/res), delegate logic to services
- Services contain all business logic, no req/res objects
- Use Zod schemas for all request validation via `validate` middleware

```typescript
// Route definition
router.post("/articles", requireAdmin, validate(CreateArticleSchema), controller.create)

// Controller
async create(req: Request, res: Response) {
  const article = await articlesService.create(req.body)
  res.status(201).json(article)
}

// Service
async create(data: CreateArticleDto): Promise<Article> {
  return prisma.article.create({ data })
}
```

## Error Handling (Express)

- Express 5 handles async errors natively — no try/catch needed in route handlers
- Throw errors from services; let the global error handler catch them
- Use typed error classes from `src/lib/errors.ts`

```typescript
// CORRECT — throw from service, Express 5 catches it
async findBySlug(slug: string) {
  const article = await prisma.article.findUnique({ where: { slug } })
  if (!article) throw new NotFoundError("Article not found")
  return article
}

// NEVER — don't catch and re-throw in controllers
```

## Database (Prisma)

- All schema changes go in `packages/db/prisma/schema.prisma`
- Run `bun run db:migrate` after every schema change
- Never use `prisma db push` in production — always use migrations
- Use `prisma.$transaction` for multi-step writes
- Always select only needed fields — avoid `findMany()` without `select`

## Background Jobs (BullMQ)

- All queue definitions in `apps/server/src/workers/queues.ts` — single registry
- Workers import queues from the registry — never create new Queue instances in workers
- All jobs must have: `attempts: 3`, `backoff: { type: "exponential", delay: 5000 }`
- Log job start/complete/fail in every worker

## Claude AI Service

- All Anthropic SDK calls go through `apps/server/src/services/claude.service.ts`
- Every prompt template has a version constant (e.g. `ARTICLE_PROMPT_V1`)
- Store `aiModel` and `aiPromptVersion` on every generated Article
- Never call the Anthropic SDK directly from workers — always use the service

## Git Conventions

```
feat:     new feature
fix:      bug fix
chore:    tooling, deps, config (no production code change)
docs:     documentation only
refactor: code change without feature/fix
style:    formatting only
test:     tests only
```

Commit message format: `type(scope): short description`
Examples:
- `feat(pipeline): add YouTube channel monitor worker`
- `fix(api): correct article slug deduplication`
- `chore(deps): add bullmq and ioredis`

## What NOT to do

- Never skip Zod validation on request bodies
- Never expose raw Prisma errors to the client
- Never store secrets in code — always use env vars
- Never use `console.log` in production code — use a logger
- Never create new files in `components/ui/` manually
- Never use `npm`, `yarn`, or `pnpm`
- Never use `require()` — ESM only (`import/export`)
- Never use `var` — only `const` and `let`
