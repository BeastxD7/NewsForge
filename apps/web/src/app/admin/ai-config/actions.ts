"use server"

import { revalidatePath } from "next/cache"
import { serverApi } from "@/lib/api-server"
import type { AIConfig, UpdateAIConfigDto } from "@news-app/types"

export async function updateAiConfig(
  dto: UpdateAIConfigDto
): Promise<{ success: boolean; error?: string }> {
  try {
    await serverApi.patch<AIConfig>("/admin/ai-config", dto)
    revalidatePath("/admin/ai-config")
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update" }
  }
}
