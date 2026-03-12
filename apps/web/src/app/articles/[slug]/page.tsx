import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, Tag } from "lucide-react"
import { marked } from "marked"
import { serverApi } from "@/lib/api-server"
import { Badge } from "@/components/ui/badge"
import type { ArticleDetail } from "@news-app/types"

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let article: ArticleDetail

  try {
    article = await serverApi.get<ArticleDetail>(`/articles/${slug}`)
  } catch {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to News
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {article.category && (
          <Badge variant="outline" className="mb-4">
            {article.category.name}
          </Badge>
        )}

        <h1 className="text-4xl font-bold leading-tight mb-4">{article.title}</h1>

        {article.excerpt && (
          <p className="text-xl text-muted-foreground mb-6 leading-relaxed">{article.excerpt}</p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b">
          <span className="flex items-center gap-1">
            <Calendar className="size-4" />
            {article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : new Date(article.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
          </span>
          {article.aiGenerated && (
            <Badge variant="secondary" className="text-xs">
              AI Generated
            </Badge>
          )}
        </div>

        {article.ogImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.ogImage}
            alt={article.title}
            className="w-full rounded-lg mb-8 object-cover max-h-96"
          />
        )}

        <div
          className="prose prose-lg prose-neutral dark:prose-invert max-w-none
            prose-headings:tracking-tight prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:leading-relaxed
            prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline
            prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm"
          dangerouslySetInnerHTML={{ __html: await marked.parse(article.content) }}
        />

        {article.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-10 pt-8 border-t flex-wrap">
            <Tag className="size-4 text-muted-foreground" />
            {article.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
