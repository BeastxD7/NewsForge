import { FileText, CheckCircle, Clock, XCircle, Zap, Radio } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AdminStats } from "@news-app/types"

interface StatsCardsProps {
  stats: AdminStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const articleCards = [
    {
      label: "Drafts",
      value: stats.articles.draft,
      icon: FileText,
      color: "text-muted-foreground",
    },
    {
      label: "In Review",
      value: stats.articles.review,
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      label: "Approved",
      value: stats.articles.approved,
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      label: "Rejected",
      value: stats.articles.rejected,
      icon: XCircle,
      color: "text-destructive",
    },
  ]

  const systemCards = [
    {
      label: "Jobs Today",
      value: stats.jobs.completedToday,
      icon: Zap,
      color: "text-blue-500",
      sub: `${stats.jobs.pending} pending · ${stats.jobs.failed} failed`,
    },
    {
      label: "Active Sources",
      value: stats.sources.enabled,
      icon: Radio,
      color: "text-purple-500",
      sub: `${stats.sources.total} total`,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Articles</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {articleCards.map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className={`size-4 ${color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">System</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {systemCards.map(({ label, value, icon: Icon, color, sub }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className={`size-4 ${color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
