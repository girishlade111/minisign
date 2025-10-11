// This file exports environment variables for X authentication
export const X_CLIENT_ID = process.env.X_CLIENT_ID || "mock_client_id"
export const X_CLIENT_SECRET = process.env.X_CLIENT_SECRET || "mock_client_secret"
export const X_CALLBACK_URL = process.env.X_CALLBACK_URL || "http://localhost:3000/api/auth/callback"
export const JWT_SECRET = process.env.JWT_SECRET || "mock_jwt_secret_for_preview_only"

// Check if we're in preview mode (missing env vars)
export const isPreviewMode = !process.env.X_CLIENT_ID || !process.env.X_CLIENT_SECRET || !process.env.JWT_SECRET

// Validation function to check if all required env vars are present
export function validateEnvironmentVariables() {
  if (isPreviewMode) {
    console.warn("Running in preview mode with mock environment variables")
    return // Don't throw error in preview mode
  }

  const missing = []

  if (!process.env.X_CLIENT_ID) missing.push("X_CLIENT_ID")
  if (!process.env.X_CLIENT_SECRET) missing.push("X_CLIENT_SECRET")
  if (!process.env.X_CALLBACK_URL) missing.push("X_CALLBACK_URL")
  if (!process.env.JWT_SECRET) missing.push("JWT_SECRET")

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }
}
