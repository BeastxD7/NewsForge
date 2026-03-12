import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { serverApi } from "@/lib/api-server"
import type { ArticleDetail } from "@news-app/types"
import { DraftView } from "./DraftView"

export default async function DraftPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  // Auth guard
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/")

  const { slug } = await params

  let article: ArticleDetail

  try {
    article = await serverApi.get<ArticleDetail>(`/admin/articles/by-slug/${slug}`)
  } catch {
    notFound()
  }

  return <DraftView article={article} />
}
