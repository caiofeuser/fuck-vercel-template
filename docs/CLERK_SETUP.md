# Clerk Auth Setup — Step by Step

This guide walks you through integrating Clerk into the expense app (Vite + Cloudflare Workers + tRPC).

---

## Step 1: Create a Clerk Application

1. Go to [clerk.com](https://clerk.com) and sign up or log in.
2. Create a new application (or use an existing one).
3. In the Clerk Dashboard, go to **API Keys**.
4. Copy:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`) — used in the frontend
   - **Secret key** (starts with `sk_test_` or `sk_live_`) — used in the Worker (never expose this)

---

## Step 2: Install Packages

```bash
pnpm add @clerk/clerk-react @clerk/backend
```

- `@clerk/clerk-react` — React components and hooks for the frontend
- `@clerk/backend` — JWT verification in Cloudflare Workers (edge-compatible)

---

## Step 3: Environment Variables

### Frontend (Vite)

Create or update `.env` in the project root:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
```

Vite exposes only variables prefixed with `VITE_` to the client.

### Backend (Cloudflare Worker)

For **local development**, create `.dev.vars` in the project root (Wrangler loads it automatically):

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
CLERK_SECRET_KEY=your_clerk_secret_key
```

For **production**, set the secret via Wrangler:

```bash
wrangler secret put CLERK_SECRET_KEY
```

Run `pnpm run cf-typegen` to regenerate types after adding secrets. No manual env augmentation needed.

---

## Step 4: Wrap the App with ClerkProvider

**File:** `src/main.tsx`

```tsx
import { ClerkProvider } from "@clerk/clerk-react";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter } from "./router";

const router = createRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>,
);
```

---

## Step 5: Add Authorization Header to tRPC

The tRPC client must send the Clerk JWT on **every** request. The `httpBatchLink` `headers` callback runs when a request is made — but it runs outside React, so we can't call `useAuth()` there.

**Solution:** A small **token bridge** — a module-level reference to Clerk's `getToken`. The `Wrap` component (which runs inside `ClerkProvider`) registers it; the tRPC link calls it when making requests.

**Caching:** Clerk's `getToken()` handles caching and refresh internally. We don't cache the token ourselves — we just call `getToken()` each time. Clerk returns the cached JWT or fetches a fresh one if expired.

**Note:** `setClerkGetToken` and `getClerkToken` are **custom** — we create them below. Clerk provides `useAuth().getToken`; we bridge it so the tRPC link can use it.

### 5a. Create the token bridge

**File:** `src/lib/clerk-token.ts`

```ts
let getToken: (() => Promise<string | null>) | null = null;

export function setClerkGetToken(fn: () => Promise<string | null>) {
  getToken = fn;
}

export async function getClerkToken(): Promise<string | null> {
  return getToken ? getToken() : null;
}
```

### 5b. Update router.tsx

**File:** `src/router.tsx`

```ts
import { useAuth } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTansStackRouter } from "@tanstack/react-router";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@worker/trpc/router";
import { routeTree } from "./routeTree.gen";
import { getClerkToken, setClerkGetToken } from "./lib/clerk-token";

export const queryClient = new QueryClient();

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient({
    links: [
      httpBatchLink({
        url: "/trpc",
        headers: async () => {
          const token = await getClerkToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  }),
  queryClient,
});

export function createRouter() {
  const router = createTansStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    context: {
      trpc,
      queryClient,
    },
    Wrap: function WrapComponent({ children }) {
      const { getToken } = useAuth();
      setClerkGetToken(getToken);
      return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
    },
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
```

Flow: `Wrap` runs inside `ClerkProvider` → calls `setClerkGetToken(getToken)` to store Clerk's getter → when tRPC makes a request, `headers()` calls `getClerkToken()` → that invokes Clerk's `getToken()` (which caches internally) → we add `Authorization: Bearer <token>`.

---

## Step 6: Verify JWT in the Worker

**File:** `worker/trpc/context.ts`

```ts
import { verifyToken } from "@clerk/backend";
import { getDb } from "@worker/db";

export async function createContext({
  req,
  env,
  workerCtx,
}: {
  req: Request;
  env: Env;
  workerCtx: ExecutionContext;
}) {
  let user = null;

  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token && env.CLERK_SECRET_KEY) {
    try {
      const { data } = await verifyToken(token, {
        secretKey: env.CLERK_SECRET_KEY,
      });
      user = data;
    } catch {
      // Invalid or expired token — user stays null
    }
  }

  return {
    req,
    env,
    workerCtx,
    db: getDb(env.DATABASE_URL),
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
```

---

## Step 7: Add Protected Procedure (Optional)

**File:** `worker/trpc/trpc.ts`

```ts
import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
```

Use `protectedProcedure` instead of `t.procedure` for routes that require auth.

---

## Step 8: Add Sign-In / Sign-Up Pages

Create routes for authentication:

**File:** `src/routes/sign-in.tsx`

```tsx
import { SignIn } from "@clerk/clerk-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </div>
  );
}
```

**File:** `src/routes/sign-up.tsx`

```tsx
import { SignUp } from "@clerk/clerk-react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </div>
  );
}
```

---

## Step 9: Add User Button to Layout

**File:** `src/routes/__root.tsx`

```tsx
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

const RootLayout = () => (
  <>
    <div className="flex gap-2 p-2">
      <Link to="/" className="[&.active]:font-bold">Home</Link>
      <Link to="/products" className="[&.active]:font-bold">Products</Link>
      <Link to="/about" className="[&.active]:font-bold">About</Link>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
      <SignedOut>
        <Link to="/sign-in" className="[&.active]:font-bold">Sign In</Link>
      </SignedOut>
    </div>
    <hr />
    <Outlet />
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
```

---

## Step 10: Regenerate Routes

After adding new route files, regenerate the route tree:

```bash
pnpm run generate-routes
```

---

## Step 11: Regenerate Types

Run `pnpm run cf-typegen` after adding `CLERK_SECRET_KEY` or `CLERK_WEBHOOK_SIGNING_SECRET` so TypeScript picks them up.

---

## Step 12: Sync Users to Neon (Webhook)

Webhooks run in the **Worker** — Clerk POSTs to your backend, not the frontend.

### 12a. Add `CLERK_WEBHOOK_SIGNING_SECRET`

**Where to find it:** Clerk Dashboard → **Webhooks** (sidebar) → **Add Endpoint**. Enter your URL (e.g. `https://your-app.workers.dev/webhooks/clerk`), subscribe to `user.created`, `user.updated`, `user.deleted`, then create. The **Signing secret** (starts with `whsec_`) is shown on the endpoint’s page — use **Reveal** if it’s hidden.

- **Local:** `.dev.vars` → `CLERK_WEBHOOK_SIGNING_SECRET=whsec_...`
- **Production:** `wrangler secret put CLERK_WEBHOOK_SIGNING_SECRET`

### 12b. Configure the webhook endpoint in Clerk

- **Endpoint URL:** `https://your-worker.workers.dev/webhooks/clerk`

For local dev, use ngrok or Cloudflare Tunnel to expose your dev server.

### 12c. Run migrations

```bash
pnpm db:generate
pnpm db:migrate
```

The webhook handler at `POST /webhooks/clerk` handles `user.created`, `user.updated`, and `user.deleted` and syncs to your `users` table.

---

## Checklist

- [ ] Clerk app created, API keys copied
- [ ] `pnpm add @clerk/clerk-react @clerk/backend`
- [ ] `VITE_CLERK_PUBLISHABLE_KEY` in `.env`
- [ ] `CLERK_SECRET_KEY` in `.dev.vars` (local) and `wrangler secret put` (prod)
- [ ] `ClerkProvider` in `main.tsx`
- [ ] tRPC `httpBatchLink` sends `Authorization: Bearer <token>`
- [ ] `createContext` verifies token and sets `user`
- [ ] Sign-in / Sign-up routes
- [ ] `UserButton` in root layout
- [ ] `pnpm run generate-routes`
- [ ] `pnpm run cf-typegen` after adding secrets

---

## Troubleshooting

**"Missing publishable key"** — Ensure `VITE_CLERK_PUBLISHABLE_KEY` is in `.env` and you've restarted the dev server.

**401 on tRPC** — Check that the frontend sends the token. Inspect the request in DevTools → Network → request headers for `Authorization: Bearer ...`.

**CORS** — If the frontend and API are on different origins, configure CORS in the Worker. Same-origin (Vite proxy or same Worker serving assets) avoids this.
