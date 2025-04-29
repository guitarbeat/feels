"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "unknown"

  const errorMessages: Record<string, string> = {
    invalid_state: "Invalid state parameter. This could be a security issue.",
    no_code: "No authorization code received from Google.",
    token_exchange: "Failed to exchange authorization code for tokens.",
    user_info: "Failed to retrieve user information.",
    unknown: "An unknown error occurred during authentication.",
  }

  const message = errorMessages[error] || errorMessages.unknown

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>There was a problem authenticating with Google</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{message}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => (window.location.href = "/")} className="mr-2">
            Go Home
          </Button>
          <Button onClick={() => (window.location.href = "/api/auth/google")} variant="outline">
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
