import { createHash } from "crypto"
import { NextResponse } from "next/server"

// Constants for cookie and UI configuration
export const COOKIE_CONFIG = {
  AUTH_TOKEN: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
    sameSite: "lax" as const,
  },
  OAUTH_STATE: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
    sameSite: "lax" as const,
  },
}

export const UI_CONFIG = {
  POPUP: {
    width: 600,
    height: 700,
  },
  DEFAULT_PROFILE_IMAGE: "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png",
}

// Function to create code_challenge using SHA-256 for PKCE
export function createCodeChallenge(verifier: string): string {
  const hash = createHash("sha256").update(verifier).digest("base64")
  return hash.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

// Function to create HTML responses for the authentication window
export function createAuthResponse(title: string, message: string, status = 200) {
  return new NextResponse(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
      </head>
      <body>
        <script>
          window.opener.postMessage('${message}', window.location.origin);
          window.close();
        </script>
      </body>
    </html>
  `,
    {
      headers: {
        "Content-Type": "text/html",
      },
      status,
    },
  )
}
