"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import * as jose from "jose"
import { JWT_SECRET, isPreviewMode } from "./constants"
import { revalidatePath } from "next/cache"

export type User = {
  id: string
  name: string
  username: string
  profile_image_url: string
  verified: boolean
  verified_type?: string
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
