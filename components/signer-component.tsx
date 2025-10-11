"use client"

import { useState } from "react"
import type { Document } from "@/lib/actions"
import { PDFDocument as PdfLibDocument, rgb, StandardFonts } from "pdf-lib"
import { markAsSigned } from "@/lib/actions"
import { CheckCircle, Download, Loader2, User } from "lucide-react"
import { SimplePdfViewer } from "./simple-pdf-viewer"
import { SignatureGenerator } from "./signature-generator"

export function SignerComponent({ document: doc }: { document: Document }) {
  const [signature, setSignature] = useState<string | null>(null)
  const [signerName, setSignerName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignatureGenerated = (dataUrl: string) => {
    setSignature(dataUrl)
  }

  const handleSignAndDownload = async () => {
    if (!signature || !signerName.trim()) {
      setError("Please enter your full name to generate signature.")
      return
    }
    setError(null)
    setIsProcessing(true)

    try {
      const existingPdfBytes = await fetch(doc.file_url).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.status} ${res.statusText}`)
        return res.arrayBuffer()
      })

      const pdfDoc = await PdfLibDocument.load(existingPdfBytes)
      const signatureImageBytes = await fetch(signature).then((res) => res.arrayBuffer())
      const signatureImage = await pdfDoc.embedPng(signatureImageBytes)

      const page = pdfDoc.getPages()[0]
      const { width, height } = page.getSize()

      // Add owner signature if it exists
      if (doc.owner_signature_data_url) {
        const ownerSignatureBytes = await fetch(doc.owner_signature_data_url).then((res) => res.arrayBuffer())
        const ownerSignatureImage = await pdfDoc.embedPng(ownerSignatureBytes)

        page.drawImage(ownerSignatureImage, {
          x: 50,
          y: 120,
          width: 150,
          height: 60,
        })

        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
        page.drawText(`Owner: ${doc.user_name}\nDate: ${new Date(doc.owner_signed_at).toLocaleDateString()}`, {
          x: 50,
          y: 100,
          size: 8,
          font: helveticaFont,
          color: rgb(0.1, 0.1, 0.1),
        })
      }

      // Add recipient signature
      page.drawImage(signatureImage, {
        x: width - 200,
        y: 120,
        width: 150,
        height: 60,
      })

      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
      page.drawText(`Recipient: ${signerName}\nDate: ${new Date().toLocaleDateString()}`, {
        x: width - 200,
        y: 100,
        size: 8,
        font: helveticaFont,
        color: rgb(0.1, 0.1, 0.1),
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `signed_${doc.file_name}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      await markAsSigned(doc.id, signature, signerName)
    } catch (e) {
      console.error("Signing error:", e)
      setError(e instanceof Error ? e.message : "There was an error processing the document. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (doc.recipient_signed_at) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Document Signed</h2>
          <p className="text-gray-600 mt-2">
            This document was signed by <span className="font-semibold">{doc.recipient_signed_by}</span> on{" "}
            {new Date(doc.recipient_signed_at).toLocaleString()}.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <SimplePdfViewer fileUrl={doc.file_url} fileName={doc.file_name} height={600} />
      </div>

      <div className="lg:col-span-1 space-y-6">
        {/* Show owner signature if exists */}
        {doc.owner_signed_at && doc.owner_signature_data_url && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Document Owner's Signature</h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              <img
                src={doc.owner_signature_data_url || "/placeholder.svg"}
                alt={`Signature by ${doc.user_name}`}
                className="max-w-full h-auto border bg-white p-2 rounded"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Signed by {doc.user_name} on {new Date(doc.owner_signed_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Your Signature</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="signerName" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Your full name
              </label>
              <input
                type="text"
                id="signerName"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black text-sm"
                placeholder="e.g. Jane Smith"
              />
            </div>

            {signerName.trim() && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-3">Your Signature Preview:</p>
                <SignatureGenerator name={signerName} onSignatureGenerated={handleSignatureGenerated} />
              </div>
            )}

            <button
              onClick={handleSignAndDownload}
              disabled={!signature || !signerName.trim() || isProcessing}
              className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" /> Sign and Download
                </>
              )}
            </button>
            {error && <p className="text-sm text-red-500 text-center mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
