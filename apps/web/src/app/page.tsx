import Link from "next/link"
import { Newspaper } from "lucide-react"
import { serverApi } from "@/lib/api-server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { ArticleListItem } from "@news-app/types"

export default async function HomePage() {
  let articles: ArticleListItem[] = []

  try {
    articles = await serverApi.get<ArticleListItem[]>("/articles?pageSize=20")
  } catch {
    // Server may be unavailable during build
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="size-6" />
            <span className="font-bold text-xl">NewsForge</span>
          </div>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Latest News</h1>

        {articles.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Newspaper className="mx-auto mb-4 size-12 opacity-30" />
            <p>No articles published yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  {article.ogImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.ogImage}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <CardHeader className="pb-2">
                    {article.category && (
                      <Badge variant="outline" className="w-fit text-xs">
                        {article.category.name}
                      </Badge>
                    )}
                    <h2 className="font-semibold leading-snug line-clamp-2">{article.title}</h2>
                  </CardHeader>
                  <CardContent>
                    {article.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{article.excerpt}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-3">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString()
                        : new Date(article.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
