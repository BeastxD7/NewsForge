import { serverApi } from "@/lib/api-server"
import { ArticleQueue } from "@/components/admin/ArticleQueue"
import type { ArticleListItem } from "@news-app/types"

interface SearchParams {
  status?: string
  page?: string
}

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { status = "DRAFT", page = "1" } = await searchParams

  const articles = await serverApi.get<ArticleListItem[]>(
    `/admin/articles?status=${status}&page=${page}&pageSize=50`
  )

  return <ArticleQueue articles={articles} currentStatus={status} />
}
