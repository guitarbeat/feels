import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  const accessToken = cookies().get("google_access_token")?.value
  const refreshToken = cookies().get("google_refresh_token")?.value

  // Check if we have tokens
  const authenticated = !!accessToken || !!refreshToken

  return NextResponse.json({ authenticated })
}
