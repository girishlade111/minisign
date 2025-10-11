"use client"

import { useState } from "react"
import type { Document } from "@/lib/actions"
import { signAsOwner } from "@/lib/actions"
import { Loader2, PenTool, User } from "lucide-react"
import { SignatureGenerator } from "./signature-generator"

interface OwnerSignerProps {
  document: Document
  onSigned: () => void
}

export function OwnerSigner({ document: doc, onSigned }: OwnerSignerProps) {
  const [signerName, setSignerName] = useState("")
  const [signature, setSignature] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignatureGenerated = (dataUrl: string) => {
    setSignature(dataUrl)
  }

  const handleSign = async () => {
    if (!signature || !signerName.trim()) {
      setError("Please enter your full name to generate signature.")
      return
    }
    setError(null)
    setIsProcessing(true)

    try {
      const result = await signAsOwner(doc.id, signature)
      if (result.success) {
        // En lugar de onSigned() que recarga la página
        // Actualizar el estado local y notificar al padre
        onSigned() // Mantener para compatibilidad, pero mejorar la implementación
      } else {
        setError(result.message || "Failed to sign document")
      }
    } catch (e) {
      console.error("Signing error:", e)
      setError("There was an error signing the document. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center mb-4">
        <PenTool className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold">Sign as Document Owner</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Enter your full name to generate your signature, then sign the document.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-2">
            <User className="h-4 w-4 inline mr-1" />
            Your full name
          </label>
          <input
            type="text"
            id="ownerName"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="e.g. John Doe"
          />
        </div>

        {signerName.trim() && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">Signature Preview:</p>
            <SignatureGenerator name={signerName} onSignatureGenerated={handleSignatureGenerated} />
          </div>
        )}

        <button
          onClick={handleSign}
          disabled={!signature || !signerName.trim() || isProcessing}
          className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Signing...
            </>
          ) : (
            <>
              <PenTool className="h-4 w-4 mr-2" /> Sign Document
            </>
          )}
        </button>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </div>
    </div>
  )
}
