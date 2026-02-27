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

### Auth (Clerk)

1. **Create a Clerk project** at [clerk.com](https://clerk.com) — sign up and create an application.

2. **Get your keys** from the Clerk Dashboard → API Keys:
   - **Publishable Key** (`pk_test_...` or `pk_live_...`) — for the frontend
   - **Secret Key** (`sk_test_...` or `sk_live_...`) — for the worker backend

3. **Add to env files** — the app uses two env sources:
   - **`.env`** (Vite loads this for the frontend):
     ```env
     VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
     ```
   - **`.dev.vars`** (Wrangler loads this for the worker locally):
     ```env
     CLERK_SECRET_KEY=sk_test_xxxxx
     CLERK_WEBHOOK_SIGNING_SECRET=whsec_xxxxx
     ```
     The webhook secret is optional for sign-in only; it’s required if you want user sync to the DB (create/update/delete users in your `users` table).

4. **Configure the webhook** (optional, for user sync):
   - In Clerk Dashboard → Webhooks, add an endpoint: `https://your-api-url/webhooks/clerk`
   - Subscribe to `user.created`, `user.updated`, `user.deleted`
   - Copy the signing secret into `CLERK_WEBHOOK_SIGNING_SECRET` in `.dev.vars`

5. **Run the app** — `pnpm dev`

For production, set secrets via `wrangler secret put CLERK_SECRET_KEY` and `wrangler secret put CLERK_WEBHOOK_SIGNING_SECRET`.


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
