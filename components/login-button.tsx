"use client"

import { useState, useEffect } from "react"
import { UI_CONFIG } from "@/lib/auth-utils"

export function LoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Listen for messages from the popup when authentication succeeds or fails
    const handleMessage = (event: MessageEvent) => {
      // Strict origin checking for security
      if (event.origin !== window.location.origin) return
      if (typeof event.data !== "string") return

      if (event.data === "AUTH_SUCCESS") {
        setError(null)
        // Use location.replace instead of reload for better security
        window.location.replace(window.location.href)
      }

      if (event.data.startsWith("AUTH_ERROR")) {
        setIsLoading(false)
        const errorCode = event.data.split(":")[1]
        let errorMessage = "Authentication error. Please try again."
        if (errorCode === "invalid_state") errorMessage = "Security verification failed. Please try again."
        else if (errorCode === "token_exchange_failed")
          errorMessage = "Could not complete authentication with X. Please try again."
        else if (errorCode === "user_data_failed")
          errorMessage = "Could not retrieve your profile information. Please try again."
        else if (errorCode === "missing_code") errorMessage = "Authentication code missing. Please try again."
        setError(errorMessage)
      }

      if (event.data === "AUTH_CANCELLED") {
        setIsLoading(false)
        setError(null)
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const handleLogin = () => {
    if (process.env.NODE_ENV === "development") {
      setIsLoading(true)
      setError(null)
      setTimeout(() => window.location.replace(window.location.href), 1500)
      return
    }

    setIsLoading(true)
    setError(null)
    const authUrl = "/api/auth/login"
    const { width, height } = UI_CONFIG.POPUP
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    // Enhanced popup security
    const popup = window.open(
      authUrl,
      "Sign in with X",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes,toolbar=no,menubar=no,location=no`,
    )

    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      setIsLoading(false)
      setError("Popup blocked. Please allow popups for this site and try again.")
      return
    }

    // Enhanced popup monitoring
    const checkPopup = setInterval(() => {
      try {
        if (popup?.closed) {
          clearInterval(checkPopup)
          setIsLoading(false)
        }
      } catch (e) {
        // Popup might be cross-origin, ignore errors
        clearInterval(checkPopup)
        setIsLoading(false)
      }
    }, 500)

    // Timeout after 5 minutes
    setTimeout(() => {
      if (popup && !popup.closed) {
        popup.close()
        clearInterval(checkPopup)
        setIsLoading(false)
        setError("Authentication timed out. Please try again.")
      }
    }, 300000)
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className="group relative w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-5 rounded-lg transition-all duration-200 ease-out active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="text-sm">Connecting...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2.5">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="w-4 h-4 group-hover:scale-105 transition-transform duration-200"
            >
              <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                fill="currentColor"
              />
            </svg>
            <span className="text-sm tracking-normal">Continue with X</span>
          </span>
        )}
      </button>

      {error && (
        <div className="text-center">
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200">{error}</p>
        </div>
      )}
    </div>
  )
}
