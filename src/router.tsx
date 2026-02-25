import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createRouter as createTansStackRouter } from "@tanstack/react-router"
import { createTRPCClient, httpBatchLink } from "@trpc/client"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"
import type { AppRouter } from "@worker/trpc/router"
import { routeTree } from "./routeTree.gen"

export const queryClient = new QueryClient()

export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient({
    links: [
      httpBatchLink({
        url: "/trpc",
      })
    ]
  }),
  queryClient
})

export function createRouter() {
  const router = createTansStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    context: {
      trpc,
      queryClient,
    },

    Wrap: function WrapComponent({ children }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    }
  })

  return router
}

// register the router instance, now TSQ can infer the routes, since we augment the types  
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
} 