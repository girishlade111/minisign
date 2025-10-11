"use client"

import { useState, useEffect } from "react"
import { FileText, ExternalLink } from "lucide-react"

interface SimplePdfViewerProps {
  fileUrl: string
  fileName: string
  width?: number
  height?: number
}

export function SimplePdfViewer({ fileUrl, fileName, width = 800, height = 600 }: SimplePdfViewerProps) {
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleError = () => {
    setError("Could not load PDF preview")
  }

  const openInNewTab = () => {
    window.open(fileUrl, "_blank")
  }

  if (!isClient) {
    return (
      <div className="flex justify-center items-center bg-gray-100 rounded-lg" style={{ height: `${height}px` }}>
        <div className="text-gray-500">Loading PDF...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-8"
        style={{ height: `${height}px` }}
      >
        <FileText className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-gray-600 mb-4">PDF preview not available</p>
        <button
          onClick={openInNewTab}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open PDF in new tab
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 truncate">{fileName}</span>
        <button
          onClick={openInNewTab}
          className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0 ml-2"
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Open in new tab
        </button>
      </div>
      <div className="bg-gray-100">
        <iframe
          src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          width="100%"
          height={height}
          style={{ border: "none" }}
          title={`PDF: ${fileName}`}
          onError={handleError}
          className="w-full"
        />
      </div>
    </div>
  )
}
