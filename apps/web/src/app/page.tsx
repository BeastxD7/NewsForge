import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Newspaper } from "lucide-react"
import { serverApi } from "@/lib/api-server"
import { PublicHeader } from "@/components/PublicHeader"
import { SiteFooter } from "@/components/SiteFooter"
import type { ArticleListItem } from "@news-app/types"

// Always canonical to root — strips ?category=x from Google's perspective
export const metadata: Metadata = {
  alternates: { canonical: "https://www.factverseinsight.com" },
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

function articleImage(id: string, ogImage: string | null, w = 800, h = 500): string {
  return ogImage ?? `https://picsum.photos/seed/${id}/${w}/${h}`
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams

  let allArticles: ArticleListItem[] = []
  try {
    allArticles = await serverApi.get<ArticleListItem[]>("/articles?pageSize=50")
  } catch {
    // Server may be unavailable during build
  }

  const featured = allArticles.find((a) => a.featured) ?? allArticles[0]

  const categories = Array.from(
    new Map(
      allArticles
        .filter((a) => a.category)
        .map((a) => [a.category!.id, a.category!])
    ).values()
  )

  const gridArticles = allArticles
    .filter((a) => a.id !== featured?.id)
    .filter((a) => !category || a.category?.slug === category)
    .slice(0, 8)

  const sectionLabel = category
    ? (categories.find((c) => c.slug === category)?.name ?? "Articles")
    : "Latest Stories"

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader activeCategory={category} />

      <main className="max-w-6xl mx-auto px-6">

        {allArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="size-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-5">
              <Newspaper className="size-8 text-neutral-300 dark:text-neutral-600" />
            </div>
            <h2 className="text-lg font-bold mb-1.5">No stories yet</h2>
            <p className="text-neutral-500 max-w-xs text-sm leading-relaxed">
              Stories will appear here once articles are published.
            </p>
          </div>
        ) : (
          <>
            {/* ── Featured article ── */}
            {featured && (
              <section className="py-10 lg:py-14 border-b border-border/60">
                <Link href={`/articles/${featured.slug}`} className="group block">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-0 rounded-3xl overflow-hidden border border-border/60 shadow-sm hover:shadow-md transition-shadow">

                    {/* Image */}
                    <div className="relative overflow-hidden bg-neutral-100 dark:bg-neutral-800 aspect-4/3 lg:aspect-auto lg:min-h-95">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={articleImage(featured.id, featured.ogImage, 800, 600)}
                        alt={featured.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                      {/* Category pill on image */}
                      {featured.category && (
                        <span className="absolute top-4 left-4 text-xs font-bold uppercase tracking-widest text-white bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          {featured.category.name}
                        </span>
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex flex-col justify-center p-8 lg:p-10 bg-card">
                      <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 mb-4 flex items-center gap-3">
                        <span>{formatDate(featured.publishedAt ?? featured.createdAt)}</span>
                        {featured.contentLength > 0 && (
                          <>
                            <span className="size-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                            <span>{readTime(featured.contentLength)}</span>
                          </>
                        )}
                      </p>
                      <h2 className="text-2xl lg:text-3xl font-black leading-[1.15] tracking-tight text-foreground mb-4 group-hover:text-primary transition-colors">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-sm mb-6 line-clamp-3">
                          {featured.excerpt}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all">
                        Read story
                        <ArrowRight className="size-4" />
                      </span>
                    </div>

                  </div>
                </Link>
              </section>
            )}

            {/* ── Article grid ── */}
            <section className="py-10 lg:py-14">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-sm font-bold text-foreground tracking-wide">{sectionLabel}</h2>
                <Link
                  href="/articles"
                  className="text-sm text-neutral-500 hover:text-primary transition-colors font-medium flex items-center gap-1"
                >
                  View all <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {gridArticles.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-neutral-400 text-sm">No articles in this category yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {gridArticles.map((article, i) => (
                    <Link
                      key={article.id}
                      href={`/articles/${article.slug}`}
                      className={`group block ${i === 0 || i === 3 ? "sm:col-span-2" : ""}`}
                    >
                      {/* Image */}
                      <div className={`relative rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-3 ${
                        i === 0 || i === 3 ? "aspect-video" : "aspect-4/3"
                      }`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={articleImage(article.id, article.ogImage, 600, 400)}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                        {/* Category pill */}
                        {article.category && (
                          <span className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-widest text-white bg-black/55 backdrop-blur-sm px-2.5 py-1 rounded-full">
                            {article.category.name}
                          </span>
                        )}
                      </div>

                      {/* Meta */}
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium mb-1.5">
                        {formatDate(article.publishedAt ?? article.createdAt)}
                        {article.contentLength > 0 && ` · ${readTime(article.contentLength)}`}
                      </p>

                      {/* Title */}
                      <h3 className={`font-bold text-foreground leading-snug group-hover:text-primary transition-colors ${
                        i === 0 || i === 3 ? "text-base sm:text-lg" : "text-sm"
                      } line-clamp-2`}>
                        {article.title}
                      </h3>

                      {/* Excerpt — only on wide cards */}
                      {(i === 0 || i === 3) && article.excerpt && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mt-1.5">
                          {article.excerpt}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              {/* View all CTA */}
              {gridArticles.length > 0 && (
                <div className="mt-12 flex justify-center">
                  <Link
                    href="/articles"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-muted hover:border-primary/30 transition-all"
                  >
                    View all articles
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
