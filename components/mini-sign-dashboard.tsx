"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { User, Document } from "@/lib/actions"
import { deleteDocument } from "@/lib/actions"
import {
  UploadCloud,
  FileText,
  CheckCircle,
  Clock,
  Share2,
  AlertTriangle,
  Trash2,
  MoreVertical,
  Eye,
} from "lucide-react" // Added UploadCloud
import Link from "next/link"

function DocumentActions({ document, refreshDocuments }: { document: Document; refreshDocuments: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const handleCopyLink = () => {
    const url = `${window.location.origin}/sign/${document.id}`
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${document.file_name}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteDocument(document.id)
      if (result.success) {
        refreshDocuments() // Usar la función prop en lugar de reload
      } else {
        alert(result.message || "Failed to delete document")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("An error occurred while deleting the document")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        title="More actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border z-20">
            <div className="py-1">
              <Link
                href={`/view/${document.id}`}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Eye className="h-4 w-4 mr-3" />
                View document
              </Link>
              <button
                onClick={handleCopyLink}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {copiedLink ? (
                  <CheckCircle className="h-4 w-4 mr-3 text-green-500" />
                ) : (
                  <Share2 className="h-4 w-4 mr-3" />
                )}
                {copiedLink ? "Link copied!" : "Copy signing link"}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4 mr-3" />
                {isDeleting ? "Deleting..." : "Delete document"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function MiniSignDashboard({
  user,
  documents,
  onDocumentsChange,
}: {
  user: User
  documents: Document[]
  onDocumentsChange: () => void
}) {
  const [formState, setFormState] = useState<{ success: boolean; message: string; isLoading: boolean }>({
    success: false,
    message: "",
    isLoading: false,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  // Agregar función para refrescar documentos
  const refreshDocuments = async () => {
    try {
      const response = await fetch("/api/documents")
      const newDocuments = await response.json()
      // Actualizar el estado de documentos si tienes uno local
      // setDocuments(newDocuments)
      window.location.href = window.location.href // Fallback temporal
    } catch (error) {
      console.error("Error refreshing documents:", error)
    }
  }

  useEffect(() => {
    if (formState.success && !formState.isLoading) {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      setSelectedFileName(null)
      // Actualizar documentos sin recargar
      const timer = setTimeout(() => {
        setFormState({ success: false, message: "", isLoading: false })
        onDocumentsChange() // Usar la función prop
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [formState.success, formState.isLoading, onDocumentsChange])

  const handleFormAction = async (formData: FormData) => {
    try {
      const response = await fetch("/api/uploadDocument", {
        method: "POST",
        body: formData,
      })
      const result = await response.json()
      setFormState({ ...result, isLoading: false })
    } catch (error) {
      console.error("Upload error:", error)
      setFormState({ success: false, message: "Upload failed. Please try again.", isLoading: false })
    }
  }

  const processFile = async (file: File | null) => {
    if (!file) {
      if (fileInputRef.current) fileInputRef.current.value = ""
      setFormState({ success: false, message: "", isLoading: false })
      setSelectedFileName(null)
      return
    }

    // Basic validation (can be expanded)
    if (file.type !== "application/pdf") {
      setFormState({ success: false, message: "Only PDF files are allowed.", isLoading: false })
      setSelectedFileName(`Invalid file: ${file.name}`)
      if (fileInputRef.current) fileInputRef.current.value = "" // Clear input
      return
    }
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setFormState({ success: false, message: "File size must be less than 10MB.", isLoading: false })
      setSelectedFileName(`File too large: ${file.name}`)
      if (fileInputRef.current) fileInputRef.current.value = "" // Clear input
      return
    }

    setSelectedFileName(file.name)
    setFormState({ success: false, message: "Uploading...", isLoading: true })
    const formData = new FormData()
    formData.append("file", file)
    await handleFormAction(formData)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0] || null)
  }

  const handleSamplePDF = async (e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      setFormState({ success: false, message: "Creating sample PDF...", isLoading: true })

      // Create a simple PDF blob instead of fetching external URL
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Sample Document for Signing) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000369 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
466
%%EOF`

      const blob = new Blob([pdfContent], { type: "application/pdf" })
      const file = new File([blob], "sample-document.pdf", {
        type: "application/pdf",
        lastModified: Date.now(),
      })

      // Process the file as if it was uploaded
      await processFile(file)
    } catch (error) {
      console.error("Error creating sample PDF:", error)
      setFormState({
        success: false,
        message: "Failed to create sample PDF. Please try again.",
        isLoading: false,
      })
    }
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // You can add more visual feedback here if needed
  }
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
      e.dataTransfer.clearData()
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold mb-4">Upload new document (PDF)</h2>
        </div>
        <div>
          <div
            className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out
              ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"}
              ${formState.isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
            onClick={() => !formState.isLoading && fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              name="file"
              ref={fileInputRef}
              required
              className="hidden" // Hide the actual input
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={formState.isLoading}
            />
            {formState.isLoading ? (
              <div className="flex flex-col items-center text-center">
                <span className="h-10 w-10 animate-spin rounded-full border-4 border-gray-400 border-t-transparent mb-3" />
                <p className="text-sm text-gray-500">{formState.message || "Uploading..."}</p>
                {selectedFileName && <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">{selectedFileName}</p>}
              </div>
            ) : selectedFileName ? (
              <div className="text-center">
                <FileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <p className="text-sm text-gray-700 font-medium truncate max-w-xs">{selectedFileName}</p>
                <p className="text-xs text-gray-400 mt-1">Click or drag another file to replace</p>
              </div>
            ) : (
              <div className="text-center">
                <UploadCloud className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PDF only, max 10MB • or{" "}
                  <button
                    onClick={handleSamplePDF}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                  >
                    create a sample PDF
                  </button>
                </p>
              </div>
            )}
          </div>

          {formState.message &&
            !formState.isLoading && ( // Only show if not loading
              <div
                className={`mt-3 flex items-center text-sm p-3 rounded-md ${
                  formState.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}
              >
                {formState.success ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <AlertTriangle className="h-5 w-5 mr-2" />
                )}
                <span>{formState.message}</span>
              </div>
            )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Document History</h2>
        <div className="space-y-4">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row items-start sm:items-center justify-between"
              >
                <div className="flex items-center mb-3 sm:mb-0">
                  <FileText className="h-8 w-8 text-gray-400 mr-4 flex-shrink-0" />
                  <div>
                    <Link
                      href={`/view/${doc.id}`}
                      className="font-medium break-all hover:text-blue-600 transition-colors"
                    >
                      {doc.file_name}
                    </Link>
                    <p className="text-xs text-gray-500">Uploaded on {new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-end">
                  {doc.signed_at ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                      <CheckCircle className="mr-1.5 h-4 w-4" />
                      Signed by {doc.signed_by}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 whitespace-nowrap">
                      <Clock className="mr-1.5 h-4 w-4" />
                      Pending
                    </span>
                  )}
                  <DocumentActions document={doc} refreshDocuments={onDocumentsChange} />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">You haven't uploaded any documents yet.</p>
              <p className="text-xs text-gray-400 mt-1">Use the form above to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
