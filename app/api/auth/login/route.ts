import { NextResponse } from "next/server"
import { X_CLIENT_ID, X_CALLBACK_URL } from "@/lib/constants"
import { generateRandomString } from "@/lib/utils"
import { createCodeChallenge, COOKIE_CONFIG } from "@/lib/auth-utils"

export async function GET() {
  // Generate a random state to prevent CSRF attacks
  const state = generateRandomString(32)

  // Generate a code_verifier and code_challenge for PKCE (Proof Key for Code Exchange)
  const codeVerifier = generateRandomString(64)
  const codeChallenge = createCodeChallenge(codeVerifier)

  // Save these values in cookies to verify them in the callback
  const response = NextResponse.redirect(
    `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${X_CLIENT_ID}&redirect_uri=${encodeURIComponent(X_CALLBACK_URL)}&scope=tweet.read%20users.read%20offline.access&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`,
  )

  response.cookies.set("oauth_state", state, COOKIE_CONFIG.OAUTH_STATE)
  response.cookies.set("code_verifier", codeVerifier, COOKIE_CONFIG.OAUTH_STATE)

  return response
}
