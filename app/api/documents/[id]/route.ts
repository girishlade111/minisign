import { NextResponse } from "next/server"
import { getDocumentById } from "@/lib/actions"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const document = await getDocumentById(params.id)
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }
    return NextResponse.json(document)
  } catch (error) {
    console.error("Error fetching document:", error)
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 })
  }
}
