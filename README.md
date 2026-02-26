# Fuck Vercel

A full-stack expense tracking app built with **Vite + React** — no Next.js. Fast builds, type-safe APIs, and deploys to the edge.

## Tech Stack

- **Frontend:** React 19, TanStack Router, TanStack Query, Tailwind CSS v4, shadcn/ui
- **Backend:** Cloudflare Workers, Hono, tRPC
- **Database:** PostgreSQL (Neon) + Drizzle ORM
- **Build:** Vite 7, TypeScript

## Project Structure

```
├── src/                 # React app (Vite)
│   ├── routes/          # TanStack Router file-based routes
│   ├── components/      # UI components
│   └── lib/             # Client utilities
├── worker/              # Cloudflare Worker
│   ├── hono/            # Hono API routes
│   ├── trpc/            # tRPC router & procedures
│   └── queues/          # Queue consumers (e.g. AI extraction)
├── db/                  # Drizzle schema & migrations
└── drizzle/             # Generated migrations
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Install

```bash
pnpm install
```

### Database Setup

1. **Create a PostgreSQL database** on [Neon](https://neon.tech) — sign up, create a project, and copy the connection string.

2. **Set `DATABASE_URL`** — create a `.dev.vars` file for local development (Wrangler loads it automatically):

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

For production, use Cloudflare secrets: `wrangler secret put DATABASE_URL`

3. **Run migrations first** — the app needs tables to exist before it can run:

```bash
# Generate migrations (when you change db/schema.ts)
pnpm db:generate

# Run migrations — do this before starting the app
pnpm db:migrate
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Deploy (Cloudflare Workers)

```bash
pnpm deploy
```

## Scripts

| Script        | Description                    |
|---------------|--------------------------------|
| `pnpm dev`    | Start Vite dev server          |
| `pnpm build`  | Generate routes, typecheck, build |
| `pnpm preview`| Preview production build       |
| `pnpm deploy` | Build and deploy to Cloudflare |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate`   | Run migrations against DB     |
| `pnpm lint`   | Run ESLint                    |

## License

Private
