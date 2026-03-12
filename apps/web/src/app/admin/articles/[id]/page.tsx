import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, Tag, ExternalLink } from "lucide-react"
import { marked } from "marked"
import { serverApi } from "@/lib/api-server"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ArticleDetail } from "@news-app/types"
import { ArticleActions } from "./ArticleActions"

export default async function AdminArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let article: ArticleDetail

  try {
    article = await serverApi.get<ArticleDetail>(`/admin/articles/${id}`)
  } catch {
    notFound()
  }

  const contentHtml = await marked.parse(article.content)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/admin/articles" />}>
          <ArrowLeft className="size-4" />
          Back to Queue
        </Button>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={
              article.status === "DRAFT"
                ? "bg-muted text-muted-foreground"
                : article.status === "APPROVED"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : article.status === "REJECTED"
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
            }
          >
            {article.status}
          </Badge>
          <ArticleActions id={article.id} status={article.status} />
        </div>
      </div>

      {/* Article */}
      <article>
        {/* Meta pills */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {article.category && (
            <Badge variant="outline">{article.category.name}</Badge>
          )}
          {article.aiGenerated && (
            <Badge variant="secondary" className="text-xs">AI Generated</Badge>
          )}
          {article.aiModel && (
            <span className="text-xs text-muted-foreground rounded-full bg-muted px-2.5 py-0.5">
              {article.aiModel}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight mb-5">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            {article.excerpt}
          </p>
        )}

        {/* Date + source row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-4" />
            {new Date(article.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {article.sourceUrl && (
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-blue-500 hover:underline"
            >
              <ExternalLink className="size-3.5" />
              Source
            </a>
          )}
        </div>

        <hr className="mb-10" />

        {/* Content */}
        <div
          className="prose prose-lg prose-neutral dark:prose-invert mx-auto
            prose-headings:tracking-tight prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:leading-[1.8]
            prose-li:leading-[1.8]
            prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-l-primary/30 prose-blockquote:italic prose-blockquote:not-italic prose-blockquote:text-muted-foreground
            prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-muted prose-pre:rounded-lg
            prose-img:rounded-lg prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-12 pt-8 border-t flex-wrap">
            <Tag className="size-4 text-muted-foreground" />
            {article.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </article>
    </div>
  )
}
