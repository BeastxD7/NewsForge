"use server"

import { revalidatePath } from "next/cache"
import { serverApi } from "@/lib/api-server"

export async function saveArticle(
  id: string,
  data: { title?: string; excerpt?: string; content?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    await serverApi.patch(`/articles/${id}`, data)
    revalidatePath(`/draft`)
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to save" }
  }
}

export async function updateArticleStatus(
  id: string,
  status: "APPROVED" | "REJECTED" | "DRAFT"
): Promise<{ success: boolean; error?: string }> {
  try {
    await serverApi.patch(`/articles/${id}`, { status })
    revalidatePath("/draft")
    revalidatePath("/admin/articles")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update" }
  }
}
