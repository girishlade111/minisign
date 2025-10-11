import { NextResponse } from "next/server"
import { getMyDocuments } from "@/lib/actions"

export async function GET() {
  try {
    const documents = await getMyDocuments()
    return NextResponse.json(documents)
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}
