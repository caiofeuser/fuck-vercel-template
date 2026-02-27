import {
	SignedIn,
	SignedOut,
	SignInButton,
	SignUpButton,
	UserButton,
} from "@clerk/clerk-react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { KeyRound, LogIn, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const Route = createFileRoute("/signin/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <SignedOut>
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
                <KeyRound className="size-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">Welcome</CardTitle>
              <CardDescription>
                Sign in to your account or create a new one to get started with
                Expense App.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <SignInButton mode="modal">
                <Button className="w-full" size="lg">
                  <LogIn className="size-4" />
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="outline" className="w-full" size="lg">
                  <UserPlus className="size-4" />
                  Create account
                </Button>
              </SignUpButton>
            </CardContent>
          </Card>
          <p className="text-center text-sm text-muted-foreground">
            <Link
              to="/"
              className="underline underline-offset-4 hover:text-foreground"
            >
              ← Back to home
            </Link>
          </p>
        </SignedOut>

        <SignedIn>
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="space-y-2 text-center">
              <div className="mx-auto">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "size-16",
                    },
                  }}
                />
              </div>
              <CardTitle className="text-2xl">You're signed in</CardTitle>
              <CardDescription>
                You're all set. Head back to the app to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild>
                <Link to="/">Go to home</Link>
              </Button>
            </CardContent>
          </Card>
        </SignedIn>
      </div>
    </div>
  )
}
