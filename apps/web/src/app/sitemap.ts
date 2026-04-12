import type { MetadataRoute } from "next"
import { serverApi } from "@/lib/api-server"
import type { ArticleListItem } from "@news-app/types"

const SITE_URL = "https://www.factverseinsight.com"

// Fallback revalidation every 5 min — on-demand revalidation fires immediately on article publish
export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = Date.now()
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL,                  lastModified: new Date(),           changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE_URL}/articles`,    lastModified: new Date(),           changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/about`,       lastModified: new Date("2026-04-01"), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`,     lastModified: new Date("2026-04-01"), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE_URL}/terms`,       lastModified: new Date("2026-04-01"), changeFrequency: "yearly",  priority: 0.3 },
  ]

  try {
    const articles = await serverApi.get<ArticleListItem[]>("/articles?pageSize=1000")
    const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => {
      const publishedMs = new Date(article.publishedAt ?? article.createdAt).getTime()
      const isRecent = now - publishedMs < ONE_WEEK_MS
      return {
        url: `${SITE_URL}/articles/${article.slug}`,
        lastModified: new Date(article.publishedAt ?? article.createdAt),
        changeFrequency: isRecent ? "daily" : "weekly",
        priority: article.featured ? 0.9 : isRecent ? 0.8 : 0.6,
      }
    })
    return [...staticRoutes, ...articleRoutes]
  } catch {
    return staticRoutes
  }
}
