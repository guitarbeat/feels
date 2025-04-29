import { cookies } from "next/headers"

export const auth = async () => {
  const accessToken = cookies().get("google_access_token")?.value
  const refreshToken = cookies().get("google_refresh_token")?.value

  if (!accessToken && !refreshToken) {
    return null
  }

  return {
    accessToken,
    refreshToken,
  }
}
