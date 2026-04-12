"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
  Users, Eye, Globe, Monitor, Smartphone, Tablet,
  TrendingUp, MousePointer, ArrowUpRight, Clock,
} from "lucide-react"

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

function StatCard({ label, value, icon: Icon, sub }: {
  label: string
  value: string | number
  icon: React.ElementType
  sub?: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="size-4 text-primary" />
        </div>
      </div>
      <p className="text-3xl font-black text-foreground">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

function BarList({ title, items, total }: {
  title: string
  items: { label: string; value: number }[]
  total: number
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">{title}</p>
      <div className="space-y-3">
        {items.slice(0, 8).map((item) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground truncate max-w-[70%]">{item.label || "Unknown"}</span>
                <span className="text-muted-foreground text-xs">{item.value.toLocaleString()} ({pct}%)</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
        {items.length === 0 && <p className="text-sm text-muted-foreground">No data yet</p>}
      </div>
    </div>
  )
}

function MiniChart({ data }: { data: { date: string; views: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        No data yet
      </div>
    )
  }
  const max = Math.max(...data.map((d) => d.views), 1)
  return (
    <div className="flex items-end gap-0.5 h-32 w-full">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full bg-primary/80 hover:bg-primary rounded-t transition-colors"
            style={{ height: `${Math.max(4, (d.views / max) * 100)}%` }}
          />
          <span className="absolute bottom-full mb-1 text-[10px] bg-foreground text-background px-1.5 py-0.5 rounded hidden group-hover:block whitespace-nowrap z-10">
            {d.date}: {d.views}
          </span>
        </div>
      ))}
    </div>
  )
}

function deviceIcon(device: string | null) {
  if (device === "mobile") return <Smartphone className="size-3.5" />
  if (device === "tablet") return <Tablet className="size-3.5" />
  return <Monitor className="size-3.5" />
}

function cleanUrl(url: string) {
  try {
    const u = new URL(url)
    return u.pathname + (u.search || "")
  } catch {
    return url
  }
}

function cleanReferrer(ref: string | null) {
  if (!ref || ref === "Direct") return "Direct"
  try {
    return new URL(ref).hostname
  } catch {
    return ref
  }
}

export function AnalyticsDashboard({ data, days }: { data: OverviewData | null; days: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setDays(d: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("days", String(d))
    router.push(`/admin/analytics?${params}`)
  }

  const noData = !data || (data.totalViews === 0 && data.uniqueVisitors === 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Visitor insights and traffic data</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                days === d
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {noData ? (
        <div className="rounded-2xl border border-border bg-card p-16 text-center">
          <TrendingUp className="size-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">No data yet</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Analytics will appear here once visitors start browsing the site. The tracker runs automatically on all public pages.
          </p>
        </div>
      ) : (
        <>
          {/* Overview cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Page Views" value={data!.totalViews} icon={Eye} sub={`Last ${days} days`} />
            <StatCard label="Unique Visitors" value={data!.uniqueVisitors} icon={Users} sub="By session ID" />
            <StatCard
              label="Top Country"
              value={data!.byCountry[0]?.country ?? "—"}
              icon={Globe}
              sub={data!.byCountry[0] ? `${data!.byCountry[0].views} views` : undefined}
            />
            <StatCard
              label="Top Device"
              value={data!.byDevice[0]?.device ?? "—"}
              icon={Monitor}
              sub={data!.byDevice[0] ? `${data!.byDevice[0].views} views` : undefined}
            />
          </div>

          {/* Daily chart */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Pageviews — last {days} days
            </p>
            <MiniChart data={data!.dailyViews} />
          </div>

          {/* Bar lists row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <BarList
              title="Top Pages"
              items={data!.topPages.map((p) => ({ label: cleanUrl(p.url), value: p.views }))}
              total={data!.totalViews}
            />
            <BarList
              title="Traffic Sources"
              items={data!.byReferrer.map((r) => ({ label: cleanReferrer(r.referrer), value: r.views }))}
              total={data!.totalViews}
            />
            <BarList
              title="Countries"
              items={data!.byCountry.map((c) => ({ label: c.country, value: c.views }))}
              total={data!.totalViews}
            />
          </div>

          {/* Bar lists row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BarList
              title="Devices"
              items={data!.byDevice.map((d) => ({ label: d.device, value: d.views }))}
              total={data!.totalViews}
            />
            <BarList
              title="Browsers"
              items={data!.byBrowser.map((b) => ({ label: b.browser, value: b.views }))}
              total={data!.totalViews}
            />
            <BarList
              title="Operating Systems"
              items={data!.byOs.map((o) => ({ label: o.os, value: o.views }))}
              total={data!.totalViews}
            />
          </div>

          {/* Recent visitors table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Recent Visitors
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Time</th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Location</th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Device</th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Page</th>
                    <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {data!.recentVisitors.map((v) => (
                    <tr key={v.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3" />
                          {new Date(v.createdAt).toLocaleString("en-US", {
                            month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{v.country ?? "Unknown"}</div>
                        {(v.city || v.region) && (
                          <div className="text-xs text-muted-foreground">{[v.city, v.region].filter(Boolean).join(", ")}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          {deviceIcon(v.device)}
                          <span className="capitalize">{v.device ?? "—"}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{v.browser} · {v.os}</div>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <span className="truncate block font-mono text-xs text-foreground">
                          {cleanUrl(v.url)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {v.referrer ? (
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <ArrowUpRight className="size-3" />
                            <span className="truncate max-w-[120px]">{cleanReferrer(v.referrer)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MousePointer className="size-3" /> Direct
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data!.recentVisitors.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        No visitors yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
