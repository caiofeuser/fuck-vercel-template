import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
} from "@clerk/clerk-react"
import { createRootRoute, Link, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

const RootLayout = () => (
  <>
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex items-center gap-6">
        <Link
          to="/"
          activeProps={{ className: "font-semibold text-foreground" }}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Home
        </Link>
        <Link
          to="/products"
          activeProps={{ className: "font-semibold text-foreground" }}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Products
        </Link>
        <Link
          to="/about"
          activeProps={{ className: "font-semibold text-foreground" }}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          About
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">
              <LogIn className="size-4" />
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">
              <UserPlus className="size-4" />
              Sign up
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
        </SignedIn>
      </div>
    </nav>
    <Outlet />
    <TanStackRouterDevtools />
  </>
)

export const Route = createRootRoute({ component: RootLayout })
