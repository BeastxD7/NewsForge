import { cache } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Clock, ExternalLink, Calendar, ArrowLeft, Youtube } from "lucide-react"
import { renderMarkdown } from "@/lib/markdown"
import { serverApi } from "@/lib/api-server"
import { PublicHeader } from "@/components/PublicHeader"
import { SiteFooter } from "@/components/SiteFooter"
import { ShareButton } from "@/components/ShareButton"
import type { ArticleDetail } from "@news-app/types"

const SITE_URL = "https://www.factverseinsight.com"

const getArticle = cache(async (slug: string): Promise<ArticleDetail | null> => {
  try {
    return await serverApi.get<ArticleDetail>(`/articles/${slug}`)
  } catch {
    return null
  }
})

function readTime(content: string): string {
  const words = content.trim().split(/\s+/).length
  const mins = Math.max(1, Math.ceil(words / 200))
  return `${mins} min read`
}

function articleHeroImage(id: string, ogImage: string | null): string {
  return ogImage ?? `https://picsum.photos/seed/${id}/1400/700`
}

function parseFaq(markdown: string): Array<{ question: string; answer: string }> | null {
  const sectionMatch = markdown.match(
    /^##\s+(?:FAQ|Frequently Asked Questions)[^\n]*\n([\s\S]+?)(?=\n^##|\s*$)/im
  )
  if (!sectionMatch?.[1]) return null
  const pairs: Array<{ question: string; answer: string }> = []
  const qaRegex = /\*\*([^*]+?\??)\*\*\s*\n+([\s\S]+?)(?=\n\*\*[^*]+?\*\*|\s*$)/g
  let match: RegExpExecArray | null
  while ((match = qaRegex.exec(sectionMatch[1])) !== null) {
    const question = match[1].trim()
    const answer = match[2].trim().replace(/\n+/g, " ").replace(/\*\*/g, "")
    if (question && answer) pairs.push({ question, answer })
  }
  return pairs.length > 0 ? pairs : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: "Article Not Found" }

  const title = article.metaTitle ?? article.title
  const description = article.metaDescription ?? article.excerpt ?? undefined
  const url = `${SITE_URL}/articles/${article.slug}`
  const image = article.ogImage ?? `${SITE_URL}/logo.png`

  return {
    title,
    description,
    keywords: article.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      publishedTime: article.publishedAt ?? article.createdAt,
      modifiedTime: article.updatedAt,
      authors: ["Factverse Insights"],
      ...(article.category && { section: article.category.name }),
      tags: article.tags.map((t) => t.name),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const dateStr = article.publishedAt ?? article.createdAt
  const displayDate = new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const isYouTube = article.sourceType === "YOUTUBE_VIDEO" || article.sourceType === "YOUTUBE_CHANNEL"
  const articleUrl = `${SITE_URL}/articles/${article.slug}`
  const heroImage = articleHeroImage(article.id, article.ogImage)
  const wordCount = article.content.trim().split(/\s+/).length
  const faqItems = parseFaq(article.content)

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt ?? undefined,
    abstract: article.excerpt ?? undefined,
    image: [{ "@type": "ImageObject", url: heroImage, width: 1400, height: 700 }],
    thumbnailUrl: heroImage,
    datePublished: article.publishedAt ?? article.createdAt,
    dateModified: article.updatedAt,
    wordCount,
    articleBody: article.content.replace(/#{1,6}\s|[*_`>\-]/g, "").slice(0, 5000),
    author: {
      "@type": "Organization",
      name: "Factverse Insights",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png`, width: 500, height: 500 },
    },
    publisher: {
      "@type": "Organization",
      name: "Factverse Insights",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png`, width: 500, height: 500 },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    ...(article.keywords.length > 0 && { keywords: article.keywords.join(", ") }),
    ...(article.category && { articleSection: article.category.name }),
    ...(article.tags.length > 0 && { about: article.tags.map((t) => ({ "@type": "Thing", name: t.name })) }),
    ...(article.sourceUrl && { isBasedOn: { "@type": "WebPage", url: article.sourceUrl } }),
  }

  const faqJsonLd = faqItems
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      }
    : null

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ...(article.category
        ? [{ "@type": "ListItem", position: 2, name: article.category.name, item: SITE_URL }]
        : []),
      { "@type": "ListItem", position: article.category ? 3 : 2, name: article.title, item: articleUrl },
    ],
  }

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      <PublicHeader />

      <main>
        {/* ── Hero image — full bleed ── */}
        <div className="w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden" style={{ maxHeight: "520px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={article.title}
            className="w-full object-cover"
            style={{ height: "520px", objectPosition: "center" }}
          />
        </div>

        {/* ── Article content — narrow reading column ── */}
        <div className="max-w-[720px] mx-auto px-6 py-10 lg:py-14">

          {/* Back nav */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-foreground transition-colors mb-10 group"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            Back to stories
          </Link>

          {/* Category pill */}
          {article.category && (
            <div className="mb-4">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                {article.category.name}
              </span>
            </div>
          )}

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black leading-[1.1] tracking-tight text-foreground mb-6">
            {article.title}
          </h1>

          {/* Excerpt / lead */}
          {article.excerpt && (
            <p className="text-lg sm:text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8 border-l-4 border-primary/30 pl-5 italic"
               style={{ fontFamily: "var(--font-serif)" }}>
              {article.excerpt}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between flex-wrap gap-4 pb-8 mb-10 border-b border-border/60">
            <div className="flex items-center gap-5 flex-wrap text-sm text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Factverse Insights" className="size-6 rounded-md" />
                <span className="font-semibold text-foreground text-[13px]">Factverse Insights</span>
              </span>
              <span className="flex items-center gap-1.5 text-[13px]">
                <Calendar className="size-3.5" />
                {displayDate}
              </span>
              <span className="flex items-center gap-1.5 text-[13px]">
                <Clock className="size-3.5" />
                {readTime(article.content)}
              </span>
            </div>
            <ShareButton title={article.title} url={articleUrl} excerpt={article.excerpt} />
          </div>

          {/* Article body */}
          <div
            className="
              prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border/50 prose-h2:pb-3
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-h4:text-base prose-h4:mt-6 prose-h4:mb-2
              prose-p:leading-[1.85] prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-p:text-[17px]
              prose-a:text-primary prose-a:no-underline prose-a:font-semibold hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-bold
              prose-blockquote:border-l-4 prose-blockquote:border-primary/50
              prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-xl
              prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-8
              prose-blockquote:not-italic prose-blockquote:text-neutral-700 dark:prose-blockquote:text-neutral-300
              prose-code:bg-neutral-100 dark:prose-code:bg-neutral-800 prose-code:rounded-md
              prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm
              prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-neutral-950 dark:prose-pre:bg-neutral-900
              prose-pre:border prose-pre:border-neutral-800 prose-pre:rounded-2xl prose-pre:my-8
              prose-img:rounded-2xl prose-img:shadow-lg
              prose-li:text-[17px] prose-li:leading-[1.75]
              prose-ul:my-6 prose-ol:my-6
            "
            style={{ fontFamily: "var(--font-serif)" }}
            dangerouslySetInnerHTML={{ __html: await renderMarkdown(article.content) }}
          />

          {/* ── Bottom matter ── */}
          <div className="mt-14 space-y-6">

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-8 border-t border-border/60">
                {article.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-3 py-1.5 rounded-full"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Source link */}
            {article.sourceUrl && (
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/60 bg-neutral-50 dark:bg-neutral-900/60">
                {isYouTube ? (
                  <div className="size-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                    <Youtube className="size-5 text-red-500" />
                  </div>
                ) : (
                  <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <ExternalLink className="size-5 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-0.5">
                    {isYouTube ? "Original Video" : "Original Source"}
                  </p>
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-primary hover:underline truncate block"
                  >
                    {isYouTube ? "Watch on YouTube" : article.sourceUrl}
                  </a>
                </div>
              </div>
            )}

            {/* Footer actions */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-border/60">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-foreground transition-colors font-medium group"
              >
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                All stories
              </Link>
              <ShareButton title={article.title} url={articleUrl} excerpt={article.excerpt} />
            </div>
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
