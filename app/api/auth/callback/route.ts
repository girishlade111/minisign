import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { JWT_SECRET, X_CLIENT_ID, X_CLIENT_SECRET, X_CALLBACK_URL } from "@/lib/constants"
import * as jose from "jose"
import { COOKIE_CONFIG, UI_CONFIG } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    // Enhanced security headers
    const headers = {
      "Content-Type": "text/html",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    }

    // Get the authorization code and state from the URL
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const denied = searchParams.get("denied")
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    // Check if the user denied the authorization
    if (denied || error === "access_denied") {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Cancelled</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage('AUTH_CANCELLED', window.location.origin);
                window.close();
              }
            </script>
          </body>
        </html>
      `,
        { headers, status: 200 },
      )
    }

    // Verify the state to prevent CSRF attacks
    const savedState = cookies().get("oauth_state")?.value
    const codeVerifier = cookies().get("code_verifier")?.value

    if (!code) {
      console.error("Missing authorization code")
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Error</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage('AUTH_ERROR:missing_code', window.location.origin);
                window.close();
              }
            </script>
          </body>
        </html>
      `,
        { headers, status: 400 },
      )
    }

    if (!state || !savedState || state !== savedState) {
      console.error("Invalid state parameter")
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Error</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage('AUTH_ERROR:invalid_state', window.location.origin);
                window.close();
              }
            </script>
          </body>
        </html>
      `,
        { headers, status: 400 },
      )
    }

    // Exchange the code for an access token
    const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${X_CLIENT_ID}:${X_CLIENT_SECRET}`).toString("base64")}`,
        "User-Agent": "v0-minisign/1.0",
      },
      body: new URLSearchParams({
        code: code,
        grant_type: "authorization_code",
        redirect_uri: X_CALLBACK_URL,
        code_verifier: codeVerifier || "",
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error("Error obtaining token:", errorData)
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Error</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage('AUTH_ERROR:token_exchange_failed', window.location.origin);
                window.close();
              }
            </script>
          </body>
        </html>
      `,
        { headers, status: 400 },
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Get user information with verification fields
    const userResponse = await fetch(
      "https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username,verified,verified_type",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "v0-minisign/1.0",
        },
      },
    )

    if (!userResponse.ok) {
      const errorData = await userResponse.text()
      console.error("Error obtaining user data:", errorData)
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Error</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage('AUTH_ERROR:user_data_failed', window.location.origin);
                window.close();
              }
            </script>
          </body>
        </html>
      `,
        { headers, status: 400 },
      )
    }

    const userData = await userResponse.json()

    const user = {
      id: userData.data.id,
      name: userData.data.name,
      username: userData.data.username,
      verified: userData.data.verified === true,
      verified_type: userData.data.verified_type,
      profile_image_url: userData.data.profile_image_url || UI_CONFIG.DEFAULT_PROFILE_IMAGE,
    }

    // Create a JWT for the user
    const secret = new TextEncoder().encode(JWT_SECRET)
    const token = await new jose.SignJWT({ user })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret)

    // Save the token in a cookie
    cookies().set("auth-token", token, COOKIE_CONFIG.AUTH_TOKEN)

    // Clear the state and code_verifier cookies
    cookies().delete("oauth_state")
    cookies().delete("code_verifier")

    // Close the popup immediately without showing a message
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage('AUTH_SUCCESS', window.location.origin);
              window.close();
            }
          </script>
        </body>
      </html>
    `,
      { headers, status: 200 },
    )
  } catch (error) {
    console.error("Error in authentication callback:", error)
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage('AUTH_ERROR:server_error', window.location.origin);
              window.close();
            }
          </script>
        </body>
      </html>
    `,
      {
        headers: {
          "Content-Type": "text/html",
          "X-Frame-Options": "DENY",
          "X-Content-Type-Options": "nosniff",
        },
        status: 500,
      },
    )
  }
}
