import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"

// Use a consistent redirect URI that matches what you set in Google Console
const REDIRECT_URI = "http://localhost:3000/api/auth/google/callback"

export async function GET(request: NextRequest) {
  // Create a state parameter to prevent CSRF attacks
  const state = Math.random().toString(36).substring(2, 15)

  // Store state in a cookie for verification later
  cookies().set("google_auth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  })

  // Define the scopes we need
  const scopes = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ]

  // Create the authorization URL
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  authUrl.searchParams.append("client_id", process.env.GOOGLE_CLIENT_ID || "")
  authUrl.searchParams.append("redirect_uri", REDIRECT_URI)
  authUrl.searchParams.append("response_type", "code")
  authUrl.searchParams.append("scope", scopes.join(" "))
  authUrl.searchParams.append("access_type", "offline")
  authUrl.searchParams.append("state", state)
  authUrl.searchParams.append("prompt", "consent")

  // Redirect the user to Google's authorization page
  return NextResponse.redirect(authUrl.toString())
}
