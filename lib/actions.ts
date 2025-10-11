"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import * as jose from "jose"
import { JWT_SECRET, isPreviewMode } from "./constants"
import { revalidatePath } from "next/cache"
import { put, del } from "@vercel/blob"
import { supabase } from "./supabase"

export type User = {
  id: string
  name: string
  username: string
  profile_image_url: string
  verified: boolean
  verified_type?: string
}

export type Document = {
  id: string
  user_id: string
  user_name: string
  file_url: string
  file_name: string
  created_at: string
  // Legacy fields (for backward compatibility)
  signed_at: string | null
  signed_by: string | null
  signature_data_url: string | null
  // New fields for multiple signatures
  owner_signed_at: string | null
  owner_signature_data_url: string | null
  recipient_signed_at: string | null
  recipient_signature_data_url: string | null
  recipient_signed_by: string | null
}

export async function getCurrentUser(): Promise<User | null> {
  // Always return mock data in preview mode or development
  if (process.env.NODE_ENV === "development" || isPreviewMode) {
    return {
      id: "dev_user_123",
      name: "John Doe",
      username: "johndoe_dev",
      profile_image_url: "/placeholder.svg?height=48&width=48",
      verified: true,
      verified_type: "blue",
    }
  }

  try {
    const token = cookies().get("auth-token")?.value
    if (!token) return null

    const secret = new TextEncoder().encode(JWT_SECRET)

    try {
      const { payload } = await jose.jwtVerify(token, secret)
      return payload.user as User
    } catch (jwtError) {
      cookies().delete("auth-token")
      return null
    }
  } catch (error) {
    cookies().delete("auth-token")
    return null
  }
}

export async function logoutAction() {
  cookies().delete("auth-token")
  revalidatePath("/")
  redirect("/")
}

export async function getMyDocuments(): Promise<Document[]> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("You must be logged in to view your documents.")
  }

  // Always return mock data in preview mode or development
  if (process.env.NODE_ENV === "development" || isPreviewMode) {
    return [
      {
        id: "dev-doc-1",
        user_id: "dev_user_123",
        user_name: "John Doe",
        file_name: "Sample_Contract.pdf",
        file_url: "/placeholder.pdf", // Changed to local placeholder
        created_at: new Date().toISOString(),
        signed_at: null,
        signed_by: null,
        signature_data_url: null,
        owner_signed_at: new Date().toISOString(),
        owner_signature_data_url: "data:image/png;base64,sample",
        recipient_signed_at: null,
        recipient_signature_data_url: null,
        recipient_signed_by: null,
      },
      {
        id: "dev-doc-2",
        user_id: "dev_user_123",
        user_name: "John Doe",
        file_name: "Sample_NDA.pdf",
        file_url: "/placeholder.pdf", // Changed to local placeholder
        created_at: new Date().toISOString(),
        signed_at: new Date().toISOString(),
        signed_by: "Jane Smith",
        signature_data_url: "data:image/png;base64,sample2",
        owner_signed_at: new Date().toISOString(),
        owner_signature_data_url: "data:image/png;base64,sample",
        recipient_signed_at: new Date().toISOString(),
        recipient_signature_data_url: "data:image/png;base64,sample2",
        recipient_signed_by: "Jane Smith",
      },
    ]
  }

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching documents:", error)
    throw new Error("Could not fetch documents.")
  }
  return data as Document[]
}

function generateUniqueFileName(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const fileExtension = originalName.split(".").pop()
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, "")

  return `${userId}/${nameWithoutExtension}_${timestamp}_${randomSuffix}.${fileExtension}`
}

export async function uploadDocument(prevState: any, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, message: "Authentication required." }
  }

  const file = formData.get("file") as File
  if (!file || file.size === 0) {
    return { success: false, message: "No file provided." }
  }
  if (file.type !== "application/pdf") {
    return { success: false, message: "Only PDF files are allowed." }
  }

  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return { success: false, message: "File size must be less than 10MB." }
  }

  try {
    const uniqueFileName = generateUniqueFileName(file.name, user.id)

    const blob = await put(uniqueFileName, file, {
      access: "public",
    })

    const { error: insertError } = await supabase.from("documents").insert({
      user_id: user.id,
      user_name: user.name,
      file_url: blob.url,
      file_name: file.name,
    })

    if (insertError) {
      console.error("Error inserting document:", insertError)
      return { success: false, message: "Database error: Could not save document." }
    }

    revalidatePath("/")
    return { success: true, message: "Document uploaded successfully!" }
  } catch (uploadError) {
    console.error("Error uploading file to Vercel Blob:", uploadError)
    return { success: false, message: "File upload failed. Please try again." }
  }
}

export async function deleteDocument(documentId: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, message: "Authentication required." }
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`DEV MODE: Document ${documentId} would be deleted`)
    revalidatePath("/")
    return { success: true, message: "Document deleted successfully!" }
  }

  try {
    // First, get the document to check ownership and get the file URL
    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", user.id) // Ensure user owns the document
      .single()

    if (fetchError || !document) {
      return { success: false, message: "Document not found or you don't have permission to delete it." }
    }

    // Delete from Vercel Blob storage
    try {
      await del(document.file_url)
    } catch (blobError) {
      console.warn("Could not delete file from blob storage:", blobError)
      // Continue with database deletion even if blob deletion fails
    }

    // Delete from database
    const { error: deleteError } = await supabase.from("documents").delete().eq("id", documentId).eq("user_id", user.id)

    if (deleteError) {
      console.error("Error deleting document from database:", deleteError)
      return { success: false, message: "Could not delete document from database." }
    }

    revalidatePath("/")
    return { success: true, message: "Document deleted successfully!" }
  } catch (error) {
    console.error("Error deleting document:", error)
    return { success: false, message: "An error occurred while deleting the document." }
  }
}

export async function getDocumentById(id: string): Promise<Document | null> {
  if (process.env.NODE_ENV === "development" && id.startsWith("dev-doc")) {
    const mockDocs = [
      {
        id: "dev-doc-1",
        user_id: "dev_user_123",
        user_name: "John Doe",
        file_name: "Sample_Contract.pdf",
        file_url: "/placeholder.pdf",
        created_at: new Date().toISOString(),
        signed_at: null,
        signed_by: null,
        signature_data_url: null,
        owner_signed_at: new Date().toISOString(),
        owner_signature_data_url: "data:image/png;base64,sample",
        recipient_signed_at: null,
        recipient_signature_data_url: null,
        recipient_signed_by: null,
      },
      {
        id: "dev-doc-2",
        user_id: "dev_user_123",
        user_name: "John Doe",
        file_name: "Sample_NDA.pdf",
        file_url: "/placeholder.pdf",
        created_at: new Date().toISOString(),
        signed_at: new Date().toISOString(),
        signed_by: "Jane Smith",
        signature_data_url: "...",
        owner_signed_at: new Date().toISOString(),
        owner_signature_data_url: "data:image/png;base64,sample",
        recipient_signed_at: new Date().toISOString(),
        recipient_signature_data_url: "data:image/png;base64,sample2",
        recipient_signed_by: "Jane Smith",
      },
    ]
    const doc = mockDocs.find((d) => d.id === id)
    return doc || null
  }

  const { data, error } = await supabase.from("documents").select("*").eq("id", id).single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching document by ID:", error)
    return null
  }
  return (data as Document) || null
}

// New function for owner to sign their own document
export async function signAsOwner(documentId: string, signatureDataUrl: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, message: "Authentication required." }
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`DEV MODE: Document ${documentId} signed by owner ${user.name}`)
    revalidatePath(`/view/${documentId}`)
    revalidatePath("/")
    return { success: true }
  }

  const { error } = await supabase
    .from("documents")
    .update({
      owner_signed_at: new Date().toISOString(),
      owner_signature_data_url: signatureDataUrl,
    })
    .eq("id", documentId)
    .eq("user_id", user.id) // Ensure user owns the document

  if (error) {
    console.error("Error signing document as owner:", error)
    return { success: false, message: "Could not sign document." }
  }

  revalidatePath(`/view/${documentId}`)
  revalidatePath("/")
  return { success: true }
}

// Updated function for recipient signature
export async function markAsSigned(documentId: string, signatureDataUrl: string, signerName: string) {
  if (process.env.NODE_ENV === "development") {
    console.log(`DEV MODE: Document ${documentId} marked as signed by ${signerName}`)
    revalidatePath(`/sign/${documentId}`)
    return { success: true }
  }

  const { error } = await supabase
    .from("documents")
    .update({
      recipient_signed_at: new Date().toISOString(),
      recipient_signature_data_url: signatureDataUrl,
      recipient_signed_by: signerName,
      // Also update legacy fields for backward compatibility
      signed_at: new Date().toISOString(),
      signature_data_url: signatureDataUrl,
      signed_by: signerName,
    })
    .eq("id", documentId)

  if (error) {
    console.error("Error marking document as signed:", error)
    return { success: false, message: "Could not update document signature status." }
  }

  revalidatePath(`/sign/${documentId}`)
  revalidatePath("/")
  return { success: true }
}
