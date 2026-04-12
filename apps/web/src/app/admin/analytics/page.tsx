import type { Metadata } from "next"
import { serverApi } from "@/lib/api-server"
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard"

export const metadata: Metadata = { title: "Analytics" }
export const dynamic = "force-dynamic"

interface OverviewData {
  totalViews: number
  uniqueVisitors: number
  topPages: { url: string; views: number }[]
  byCountry: { country: string; views: number }[]
  byDevice: { device: string; views: number }[]
  byBrowser: { browser: string; views: number }[]
  byOs: { os: string; views: number }[]
  byReferrer: { referrer: string; views: number }[]
  dailyViews: { date: string; views: number }[]
  recentVisitors: {
    id: string
    sessionId: string
    url: string
    referrer: string | null
    country: string | null
    region: string | null
    city: string | null
    browser: string | null
    os: string | null
    device: string | null
    createdAt: string
  }[]
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const { days } = await searchParams
  const d = Math.min(90, Math.max(1, Number(days ?? 30)))

  let data: OverviewData | null = null
  try {
    data = await serverApi.get<OverviewData>(`/analytics/overview?days=${d}`)
  } catch {
    // server unavailable
  }

  return <AnalyticsDashboard data={data} days={d} />
}
