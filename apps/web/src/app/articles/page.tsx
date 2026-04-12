import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Newspaper } from "lucide-react"
import { serverApi } from "@/lib/api-server"
import { PublicHeader } from "@/components/PublicHeader"
import { SiteFooter } from "@/components/SiteFooter"
import type { ArticleListItem } from "@news-app/types"

const SITE_URL = "https://www.factverseinsight.com"
const PAGE_SIZE = 12

interface PageProps {
  searchParams: Promise<{ page?: string; category?: string }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { page, category } = await searchParams
  const pageNum = Math.max(1, Number(page ?? 1))
  const qs = new URLSearchParams()
  if (category) qs.set("category", category)
  if (pageNum > 1) qs.set("page", String(pageNum))
  const canonical = `${SITE_URL}/articles${qs.toString() ? `?${qs}` : ""}`

  return {
    title: "All Articles",
    description:
      "Browse all AI-powered news articles and insights from Factverse Insights — technology, science, business, world affairs and more.",
    alternates: { canonical },
  }
}

function readTime(contentLength: number): string {
  const mins = Math.max(1, Math.ceil(Math.round(contentLength / 5) / 200))
  return `${mins} min read`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function articleImage(id: string, ogImage: string | null): string {
  return ogImage ?? `https://picsum.photos/seed/${id}/600/375`
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { page, category } = await searchParams
  const pageNum = Math.max(1, Number(page ?? 1))

  let articles: ArticleListItem[] = []
  let totalPages = 1
  let total = 0

  try {
    const qs = new URLSearchParams({ page: String(pageNum), pageSize: String(PAGE_SIZE) })
    if (category) qs.set("category", category)
    const raw = await serverApi.getRaw(`/articles?${qs}`)
    articles = (raw.data as ArticleListItem[]) ?? []
    totalPages = (raw.totalPages as number) ?? 1
    total = (raw.total as number) ?? 0
  } catch {
    // server unavailable
  }

  function pageUrl(p: number): string {
    const qs = new URLSearchParams()
    if (category) qs.set("category", category)
    if (p > 1) qs.set("page", String(p))
    return `/articles${qs.toString() ? `?${qs}` : ""}`
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader activeCategory={category} />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">All Articles</h1>
            {total > 0 && (
              <p className="text-sm text-neutral-500 mt-1">{total.toLocaleString()} articles</p>
            )}
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="size-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-5">
              <Newspaper className="size-8 text-neutral-300 dark:text-neutral-600" />
            </div>
            <h2 className="text-lg font-bold mb-1.5">No articles yet</h2>
            <p className="text-neutral-500 max-w-xs text-sm leading-relaxed">
              Stories will appear here once articles are published.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {articles.map((article) => {
                const parts: string[] = []
                if (article.category) parts.push(article.category.name)
                if (article.contentLength > 0) parts.push(readTime(article.contentLength))
                parts.push(formatDate(article.publishedAt ?? article.createdAt))

                return (
                  <Link key={article.id} href={`/articles/${article.slug}`} className="group block">
                    <div className="rounded-xl overflow-hidden aspect-[16/10] bg-neutral-100 dark:bg-neutral-800 mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={articleImage(article.id, article.ogImage)}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                    <p className="text-sm text-neutral-400 dark:text-neutral-500">
                      {parts.join("  |  ")}
                    </p>
                    <h2 className="font-semibold text-neutral-900 dark:text-neutral-50 text-sm leading-snug mt-2 mb-2 line-clamp-2 group-hover:opacity-60 transition-opacity">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-16">
                {pageNum > 1 ? (
                  <Link
                    href={pageUrl(pageNum - 1)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Link>
                ) : (
                  <span className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/40 text-sm font-medium text-neutral-400 cursor-not-allowed select-none">
                    <ChevronLeft className="size-4" />
                    Previous
                  </span>
                )}

                <span className="text-sm text-neutral-500">
                  Page {pageNum} of {totalPages}
                </span>

                {pageNum < totalPages ? (
                  <Link
                    href={pageUrl(pageNum + 1)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/40 text-sm font-medium text-neutral-400 cursor-not-allowed select-none">
                    Next
                    <ChevronRight className="size-4" />
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
