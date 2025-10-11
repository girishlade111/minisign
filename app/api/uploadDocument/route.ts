import { type NextRequest, NextResponse } from "next/server"
import { uploadDocument } from "@/lib/actions"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const result = await uploadDocument(null, formData)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ success: false, message: "Upload failed. Please try again." }, { status: 500 })
  }
}
