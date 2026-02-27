import { createFileRoute, Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import "@/styles/index.css"
import {
  Database,
  Globe,
  Layers,
  type LucideIcon,
  Package,
  Shield,
  Zap,
} from "lucide-react"

export const Route = createFileRoute("/")({
  component: Index,
})

const TECHNOLOGIES = [
  {
    name: "React",
    description: "UI library for building interactive interfaces",
    icon: Layers,
  },
  {
    name: "TanStack Router",
    description: "Type-safe routing with file-based routes",
    icon: Globe,
  },
  {
    name: "tRPC",
    description: "End-to-end typesafe APIs",
    icon: Zap,
  },
  {
    name: "Drizzle ORM",
    description: "TypeScript ORM for SQL databases",
    icon: Database,
  },
  {
    name: "Cloudflare Workers",
    description: "Edge compute platform",
    icon: Shield,
  },
  {
    name: "shadcn/ui",
    description: "Beautiful component library",
    icon: Package,
  },
] satisfies Array<{
  name: string
  description: string
  icon: LucideIcon
}>

function Index() {

  return (
    <div className="min-h-[calc(100vh-80px)]">
      <div className="mx-auto max-w-4xl space-y-12 px-4 py-12">
        <header className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Expense App
          </h1>
          <p className="text-lg text-muted-foreground">
            A modern full-stack application built with cutting-edge technologies
          </p>
        </header>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Tech Stack</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TECHNOLOGIES.map((tech) => {
              const Icon = tech.icon
              return (
                <Card
                  key={tech.name}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <div className="space-y-1.5">
                      <CardTitle className="text-base">{tech.name}</CardTitle>
                      <CardDescription>{tech.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </section>

        <section>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="size-5" />
                Database Connection
              </CardTitle>
              <CardDescription>
                Verify that the database is connected and working by viewing the
                products stored in the database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/products">View Products</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
