import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { trpc } from "@/router"
import "@/styles/index.css"
import { useUser } from "@clerk/clerk-react"
import { ArrowLeft, Database, Loader2 } from "lucide-react"

export const Route = createFileRoute("/products/")({
  component: ProductsPage,
})

function ProductsPage() {
  const { user } = useUser()
  console.log('useUser() in the frontend:', user)

  const { data, isLoading, isError, error } = useQuery({
    ...trpc.products.list.queryOptions(),
  })

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <header className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Database Connection
            </h1>
            <p className="text-muted-foreground">
              Products loaded directly from the database
            </p>
          </header>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-5" />
              Products
            </CardTitle>
            <CardDescription>
              {isLoading
                ? "Fetching products from the database..."
                : isError
                  ? "Failed to load products"
                  : `Found ${data?.length ?? 0} product(s) in the database`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                <p className="font-medium">Error loading products</p>
                <p className="mt-1 text-sm">{error?.message}</p>
              </div>
            ) : !data?.length ? (
              <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
                <p>No products in the database yet.</p>
                <p className="mt-1 text-sm">
                  Add some products via migrations or seed scripts.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.map((product) => (
                  <Card
                    key={product.id}
                    className="border-l-4 border-l-primary"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      {product.description && (
                        <CardDescription>{product.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      {product.price != null && (
                        <p className="text-sm font-medium text-primary">
                          ${Number(product.price).toFixed(2)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
