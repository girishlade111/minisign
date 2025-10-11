"use client"

import { MiniSignDashboard } from "@/components/mini-sign-dashboard"
import { LoginButton } from "@/components/login-button"
import { getCurrentUser, getMyDocuments } from "@/lib/actions"
import { PenTool } from "lucide-react"
import { Footer } from "@/components/footer"
import { useEffect, useState } from "react"
import { AppHeader } from "@/components/app-header"

export default function Home() {
  const [user, setUser] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        if (currentUser) {
          const userDocuments = await getMyDocuments()
          setDocuments(userDocuments)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const refreshDocuments = async () => {
    if (user) {
      try {
        const userDocuments = await getMyDocuments()
        setDocuments(userDocuments)
      } catch (error) {
        console.error("Error refreshing documents:", error)
      }
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      {user ? (
        <div className="w-full flex-grow flex flex-col">
          <AppHeader user={user} />
          <div className="flex-grow">
            <MiniSignDashboard user={user} documents={documents} onDocumentsChange={refreshDocuments} />
          </div>
          <Footer />
        </div>
      ) : (
        <div className="w-full max-w-xs space-y-10 flex flex-col items-center animate-[fade-in_0.5s_ease-out] p-6 flex-grow justify-center">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center">
            <PenTool className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>

          <div className="text-center space-y-3">
            <h1 className="text-4xl font-light text-gray-900 tracking-tight">v0 minisign</h1>
            <p className="text-gray-500 text-sm font-light">Upload PDF → Share link → Get signature</p>
          </div>

          <div className="w-full">
            <LoginButton />
          </div>
        </div>
      )}
      {!user && <Footer />}
    </main>
  )
}
