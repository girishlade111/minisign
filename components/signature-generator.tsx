"use client"

import { useRef, useEffect } from "react"

interface SignatureGeneratorProps {
  name: string
  onSignatureGenerated: (dataUrl: string) => void
}

export function SignatureGenerator({ name, onSignatureGenerated }: SignatureGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!name.trim() || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 400
    canvas.height = 120

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set font and style for handwritten look using system fonts
    ctx.font = "italic 32px 'Brush Script MT', 'Lucida Handwriting', 'Apple Chancery', cursive"
    ctx.fillStyle = "#1a1a1a"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Add slight rotation for natural look
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(-0.02) // Slight tilt

    // Draw the name with shadow for depth
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
    ctx.shadowBlur = 2
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1
    ctx.fillText(name, 0, 0)

    // Reset shadow
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0

    // Add underline for signature effect
    ctx.beginPath()
    ctx.moveTo(-ctx.measureText(name).width / 2 - 10, 25)
    ctx.lineTo(ctx.measureText(name).width / 2 + 10, 25)
    ctx.strokeStyle = "#1a1a1a"
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.restore()

    // Generate data URL
    const dataUrl = canvas.toDataURL("image/png")
    onSignatureGenerated(dataUrl)
  }, [name, onSignatureGenerated])

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        className="border rounded-lg bg-white shadow-sm"
        style={{ maxWidth: "100%", height: "auto" }}
      />
      {name && <p className="text-xs text-gray-500 mt-2 text-center">Preview of signature for: {name}</p>}
    </div>
  )
}
