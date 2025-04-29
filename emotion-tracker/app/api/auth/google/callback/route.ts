import { NextResponse, type NextRequest } from "next/server"
import { cookies } from "next/headers"

// Use a consistent redirect URI that matches what you set in Google Console
const REDIRECT_URI = "http://localhost:3000/api/auth/google/callback"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const storedState = cookies().get("google_auth_state")?.value

  // Verify state to prevent CSRF attacks
  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/auth-error?error=invalid_state", request.url))
  }

  // Clear the state cookie
  cookies().delete("google_auth_state")

  if (!code) {
    return NextResponse.redirect(new URL("/auth-error?error=no_code", request.url))
  }

  try {
    // Exchange the authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error("Token exchange error:", error)
      return NextResponse.redirect(new URL("/auth-error?error=token_exchange", request.url))
    }

    const tokenData = await tokenResponse.json()

    // Store tokens securely in cookies
    // In a production app, you might want to use a database or more secure storage
    cookies().set("google_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: tokenData.expires_in,
      path: "/",
    })

    if (tokenData.refresh_token) {
      cookies().set("google_refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      })
    }

    // Get user info to confirm authentication
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(new URL("/auth-error?error=user_info", request.url))
    }

    const userData = await userInfoResponse.json()

    // Store basic user info
    cookies().set("user_email", userData.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    // Redirect back to the app
    return NextResponse.redirect(new URL("/", request.url))
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(new URL("/auth-error?error=unknown", request.url))
  }
}
