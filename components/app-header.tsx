"use client"

import Link from "next/link"
import { PenTool } from "lucide-react"
import { LogoutButton } from "./logout-button"
import type { User } from "@/lib/actions"
import { useState, useRef, useEffect } from "react"

interface AppHeaderProps {
  user?: User | null
  title?: string
  subtitle?: string
  showUserInfo?: boolean
}

function UserDropdown({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-200 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
      >
        <img
          src={user.profile_image_url || "/placeholder.svg"}
          alt={`${user.name} profile`}
          className="w-8 h-8 rounded-full object-cover"
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User info section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <img
                src={user.profile_image_url || "/placeholder.svg"}
                alt={`${user.name} profile`}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  {user.verified && (
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.27 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                {process.env.NODE_ENV === "development" && (
                  <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                    DEV
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions section */}
          <div className="px-2 py-1">
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  )
}

export function AppHeader({ user, title, subtitle, showUserInfo = true }: AppHeaderProps) {
  return (
    <header className="bg-white border-b p-4 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo and brand */}
        <Link href="/" className="flex items-center space-x-2 text-gray-700 hover:text-black transition-colors">
          <PenTool className="w-6 h-6 text-black" />
          <span className="font-semibold text-lg">v0 minisign</span>
        </Link>

        {/* Center content - title/subtitle */}
        {(title || subtitle) && (
          <div className="flex-1 flex justify-center mx-4">
            <div className="text-center max-w-2xl">
              {title && <h1 className="font-semibold text-gray-800 truncate">{title}</h1>}
              {subtitle && <p className="text-sm text-gray-600 truncate">{subtitle}</p>}
            </div>
          </div>
        )}

        {/* Right side - user dropdown */}
        <div className="flex items-center">{user && showUserInfo && <UserDropdown user={user} />}</div>
      </div>
    </header>
  )
}
