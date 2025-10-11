"use client"

import type { Document } from "@/lib/actions"
import { CheckCircle, Download, Calendar, User, Clock, Share2 } from "lucide-react"
import { SimplePdfViewer } from "./simple-pdf-viewer"
import { OwnerSigner } from "./owner-signer"
import { getCurrentUser } from "@/lib/actions"
import { useState, useEffect } from "react"

export function DocumentViewer({ document: doc }: { document: Document }) {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [documentState, setDocumentState] = useState(doc)

  useEffect(() => {
    getCurrentUser().then(setCurrentUser)
  }, [])

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = documentState.file_url
    link.download = documentState.recipient_signed_at ? `signed_${documentState.file_name}` : documentState.file_name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopySigningLink = () => {
    const url = `${window.location.origin}/sign/${documentState.id}`
    navigator.clipboard.writeText(url)
    alert("Signing link copied to clipboard!")
  }

  const handleOwnerSigned = () => {
    // En lugar de window.location.reload()
    // Actualizar solo el estado del documento
    setDocumentState((prev) => ({
      ...prev,
      owner_signed_at: new Date().toISOString(),
      owner_signature_data_url: "updated", // Este valor vendrá del servidor
    }))

    // Opcionalmente, hacer una llamada para obtener el documento actualizado
    refreshDocument()
  }

  const refreshDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${documentState.id}`)
      const updatedDoc = await response.json()
      setDocumentState(updatedDoc)
    } catch (error) {
      console.error("Error refreshing document:", error)
    }
  }

  const isOwner = currentUser && currentUser.id === documentState.user_id
  const ownerHasSigned = documentState.owner_signed_at
  const recipientHasSigned = documentState.recipient_signed_at

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Document Info Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Document Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">File Name</label>
              <p className="text-sm text-gray-900 break-all">{documentState.file_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Owner</label>
              <p className="text-sm text-gray-900">{documentState.user_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <div className="flex items-center text-sm text-gray-900">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(documentState.created_at).toLocaleDateString()}
              </div>
            </div>

            {/* Owner Signature Status */}
            <div>
              <label className="text-sm font-medium text-gray-500">Owner Status</label>
              <div className={`flex items-center text-sm ${ownerHasSigned ? "text-green-700" : "text-yellow-700"}`}>
                {ownerHasSigned ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Signed by {documentState.user_name}
                  </>
                ) : (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Pending owner signature
                  </>
                )}
              </div>
            </div>

            {/* Recipient Signature Status */}
            <div>
              <label className="text-sm font-medium text-gray-500">Recipient Status</label>
              {recipientHasSigned ? (
                <>
                  <div className="flex items-center text-sm text-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Signed
                  </div>
                  <div className="flex items-center text-sm text-gray-900 mt-1">
                    <User className="h-4 w-4 mr-2" />
                    {documentState.recipient_signed_by}
                  </div>
                  <div className="flex items-center text-sm text-gray-900 mt-1">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(documentState.recipient_signed_at).toLocaleString()}
                  </div>
                </>
              ) : (
                <div className="flex items-center text-sm text-yellow-700">
                  <Clock className="h-4 w-4 mr-2" />
                  Pending recipient signature
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Actions</h3>
          <div className="space-y-3">
            <button
              onClick={handleDownload}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Document
            </button>
            {isOwner && !recipientHasSigned && (
              <button
                onClick={handleCopySigningLink}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Copy Signing Link
              </button>
            )}
          </div>
        </div>

        {/* Owner Signing Section */}
        {isOwner && !ownerHasSigned && <OwnerSigner document={documentState} onSigned={handleOwnerSigned} />}

        {/* Show Owner Signature */}
        {ownerHasSigned && documentState.owner_signature_data_url && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Owner Signature</h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              <img
                src={documentState.owner_signature_data_url || "/placeholder.svg"}
                alt={`Signature by ${documentState.user_name}`}
                className="max-w-full h-auto border bg-white p-2 rounded"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Signed by {documentState.user_name} on {new Date(documentState.owner_signed_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Show Recipient Signature */}
        {recipientHasSigned && documentState.recipient_signature_data_url && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Recipient Signature</h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              <img
                src={documentState.recipient_signature_data_url || "/placeholder.svg"}
                alt={`Signature by ${documentState.recipient_signed_by}`}
                className="max-w-full h-auto border bg-white p-2 rounded"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Signed by {documentState.recipient_signed_by} on{" "}
                {new Date(documentState.recipient_signed_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* PDF Viewer */}
      <div className="lg:col-span-3">
        <SimplePdfViewer fileUrl={documentState.file_url} fileName={documentState.file_name} height={700} />
      </div>
    </div>
  )
}
