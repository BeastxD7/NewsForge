import { serverApi } from "@/lib/api-server"
import { AiConfigForm } from "@/components/admin/AiConfigForm"
import type { AIConfig } from "@news-app/types"

export default async function AiConfigPage() {
  const config = await serverApi.get<AIConfig>("/admin/ai-config")

  return <AiConfigForm config={config} />
}
