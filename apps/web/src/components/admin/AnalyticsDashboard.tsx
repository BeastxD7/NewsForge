"use client"

import { useMemo, useState, type ElementType } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Users,
  Eye,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  TrendingUp,
  MousePointer,
  ArrowUpRight,
  Clock,
  ChevronLeft,
  ChevronRight,
  Activity,
  BarChart3,
  PieChart,
  CircleHelp,
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
  icon: ElementType
  sub?: string
  help?: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="inline-flex items-center gap-1.5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/90">{label}</p>
          {sub && (
              <button
                type="button"
                className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:text-foreground"
                aria-label={`${label} help`}
                title={sub}
              >
                <CircleHelp className="size-3.5" />
              </button>
          )}
        </div>
        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="size-4 text-primary" />
        </div>
      </div>
      <p className="text-3xl font-black text-foreground">{value.toLocaleString()}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground/90">{sub}</p>}
    </div>
  )
}

function PaginatedBarList({ title, items, total, rows = 6 }: {
  title: string
  items: { label: string; value: number }[]
  total: number
  rows?: number
}) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / rows))

  const paged = useMemo(() => {
    const start = (page - 1) * rows
    return items.slice(start, start + rows)
  }, [items, page, rows])

  const startRow = items.length === 0 ? 0 : (page - 1) * rows + 1
  const endRow = Math.min(page * rows, items.length)

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/90">{title}</p>
        <span className="text-[11px] text-muted-foreground/80">
          {startRow}-{endRow} of {items.length}
        </span>
      </div>

      <div className="space-y-3">
        {paged.map((item, index) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
          const absoluteIndex = (page - 1) * rows + index
          return (
            <div key={`${item.label}-${item.value}-${absoluteIndex}`} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="max-w-[70%] truncate font-medium text-foreground/90">{item.label || "Unknown"}</span>
                <span className="text-xs text-muted-foreground/90">{item.value.toLocaleString()} ({pct}%)</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
        {items.length === 0 && <p className="text-sm text-muted-foreground">No data yet</p>}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="size-3.5" /> Prev
          </button>
          <span className="px-1 text-xs text-muted-foreground">{page}/{totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-40"
          >
            Next <ChevronRight className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

function TrendAreaChart({ data }: { data: { date: string; views: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        No data yet
      </div>
    )
  }

  if (data.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
        Not enough data to show a trend yet
      </div>
    )
  }

  const width = 760
  const height = 190
  const padX = 18
  const padTop = 16
  const padBottom = 30
  const max = Math.max(...data.map((d) => d.views), 1)
  const min = 0

  const points = data.map((d, i) => {
    const x = padX + (i / Math.max(1, data.length - 1)) * (width - padX * 2)
    const normalized = (d.views - min) / Math.max(1, max - min)
    const y = padTop + (1 - normalized) * (height - padTop - padBottom)
    return { x, y, d }
  })

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ")

  const areaPath = [
    `M ${points[0]?.x.toFixed(1)} ${(height - padBottom).toFixed(1)}`,
    ...points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`),
    `L ${points[points.length - 1]?.x.toFixed(1)} ${(height - padBottom).toFixed(1)}`,
    "Z",
  ].join(" ")

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full">
        <defs>
          <linearGradient id="viewsArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <line
          x1={padX}
          y1={height - padBottom}
          x2={width - padX}
          y2={height - padBottom}
          stroke="hsl(var(--border))"
          strokeDasharray="4 5"
        />

        <path d={areaPath} fill="url(#viewsArea)" />
        <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" />

        {points.map((p) => (
          <g key={p.d.date}>
            <circle cx={p.x} cy={p.y} r="3" fill="hsl(var(--primary))" />
            <title>{`${p.d.date}: ${p.d.views.toLocaleString()} views`}</title>
          </g>
        ))}
      </svg>

      <div className="pointer-events-none absolute inset-0">
        {points.map((p) => {
          const left = `${(p.x / width) * 100}%`
          const top = `${(p.y / height) * 100}%`
          return (
            <button
              key={`tip-${p.d.date}`}
              type="button"
              className="pointer-events-auto absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none"
              style={{ left, top }}
              aria-label={`${p.d.date}: ${p.d.views} views`}
              title={`${p.d.date}: ${p.d.views.toLocaleString()} views`}
            >
              <span className="absolute inset-0 rounded-full bg-primary/15 ring-1 ring-primary/25 transition-transform hover:scale-110" />
            </button>
          )
        })}
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>{data[0]?.date}</span>
        <span>Peak: {max.toLocaleString()}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  )
}

function DonutBreakdown({
  title,
  items,
  total,
}: {
  title: string
  items: { label: string; value: number }[]
  total: number
}) {
  const palette = ["#1D4ED8", "#0284C7", "#0EA5E9", "#14B8A6", "#64748B", "#94A3B8"]
  const normalized = items.filter((i) => i.value > 0).slice(0, 6)
  const radius = 46
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/90">{title}</p>

      {normalized.length === 0 ? (
        <div className="flex h-36 items-center justify-center text-sm text-muted-foreground">No data yet</div>
      ) : (
        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
          <div className="relative mx-auto h-28 w-28">
            <svg viewBox="0 0 120 120" className="size-full -rotate-90">
              <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
              {normalized.map((item, i) => {
                const share = item.value / Math.max(total, 1)
                const dash = share * circumference
                const segment = (
                  <circle
                    key={`${item.label}-${i}`}
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke={palette[i % palette.length]}
                    strokeWidth="12"
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                  >
                    <title>{`${item.label || "Unknown"}: ${item.value.toLocaleString()} views (${Math.round(share * 100)}%)`}</title>
                  </circle>
                )
                offset += dash
                return segment
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-black text-foreground">{total.toLocaleString()}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">views</span>
            </div>
          </div>

          <div className="space-y-2">
            {normalized.map((item, i) => {
              const pct = Math.round((item.value / Math.max(total, 1)) * 100)
              return (
                <button
                  key={`${item.label}-${item.value}-${i}`}
                  type="button"
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-1.5 py-1 text-left text-sm transition-colors hover:bg-muted/50"
                  title={`${item.label || "Unknown"}: ${item.value.toLocaleString()} views`}
                >
                  <span className="inline-flex min-w-0 items-center gap-2 text-foreground/90">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: palette[i % palette.length] }} />
                    <span className="truncate">{item.label || "Unknown"}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground/90">{pct}%</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
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
  const [recentPage, setRecentPage] = useState(1)
  const [recentPageSize, setRecentPageSize] = useState(10)
  const [recentSearch, setRecentSearch] = useState("")
  const [recentDeviceFilter, setRecentDeviceFilter] = useState<"all" | "mobile" | "tablet" | "desktop">("all")
  const [recentSortBy, setRecentSortBy] = useState<"createdAt" | "country" | "device" | "url" | "referrer">("createdAt")
  const [recentSortDirection, setRecentSortDirection] = useState<"asc" | "desc">("desc")

  function setDays(d: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("days", String(d))
    router.push(`/admin/analytics?${params}`)
  }

  const noData = !data || (data.totalViews === 0 && data.uniqueVisitors === 0)
  const recentRows = data?.recentVisitors ?? []
  const filteredRecentRows = useMemo(() => {
    const query = recentSearch.trim().toLowerCase()

    return recentRows.filter((row) => {
      const searchable = [
        row.url,
        row.referrer ?? "",
        row.country ?? "",
        row.region ?? "",
        row.city ?? "",
        row.browser ?? "",
        row.os ?? "",
        row.device ?? "",
      ]
        .join(" ")
        .toLowerCase()

      const matchesQuery = query.length === 0 || searchable.includes(query)
      const matchesDevice = recentDeviceFilter === "all" || (row.device ?? "") === recentDeviceFilter

      return matchesQuery && matchesDevice
    })
  }, [recentRows, recentSearch, recentDeviceFilter])

  const sortedRecentRows = useMemo(() => {
    const rows = [...filteredRecentRows]

    const valueFor = (row: (typeof recentRows)[number]) => {
      if (recentSortBy === "createdAt") return new Date(row.createdAt).getTime()
      if (recentSortBy === "country") return row.country ?? ""
      if (recentSortBy === "device") return row.device ?? ""
      if (recentSortBy === "referrer") return row.referrer ?? ""
      return row.url
    }

    rows.sort((a, b) => {
      const left = valueFor(a)
      const right = valueFor(b)

      if (typeof left === "number" && typeof right === "number") {
        return recentSortDirection === "asc" ? left - right : right - left
      }

      return recentSortDirection === "asc"
        ? String(left).localeCompare(String(right))
        : String(right).localeCompare(String(left))
    })

    return rows
  }, [filteredRecentRows, recentSortBy, recentSortDirection])

  const recentTotalPages = Math.max(1, Math.ceil(sortedRecentRows.length / recentPageSize))
  const recentPageSafe = Math.min(recentPage, recentTotalPages)
  const recentStart = (recentPageSafe - 1) * recentPageSize
  const recentPageRows = sortedRecentRows.slice(recentStart, recentStart + recentPageSize)

  const growthPct = useMemo(() => {
    if (!data || data.dailyViews.length < 2) return 0
    const midpoint = Math.floor(data.dailyViews.length / 2)
    const firstHalf = data.dailyViews.slice(0, midpoint).reduce((acc, d) => acc + d.views, 0)
    const secondHalf = data.dailyViews.slice(midpoint).reduce((acc, d) => acc + d.views, 0)
    if (firstHalf === 0) return secondHalf > 0 ? 100 : 0
    return Math.round(((secondHalf - firstHalf) / firstHalf) * 100)
  }, [data])

  const overviewCards = [
    {
      key: "views",
      label: "Page Views",
      value: data?.totalViews ?? 0,
      icon: Eye,
      sub: `Last ${days} days`,
      help: "Total pageview events recorded in the selected time range.",
      visible: Boolean(data),
    },
    {
      key: "visitors",
      label: "Unique Visitors",
      value: data?.uniqueVisitors ?? 0,
      icon: Users,
      sub: "By session ID",
      help: "Count of distinct visitor sessions, not total hits.",
      visible: Boolean(data),
    },
    {
      key: "country",
      label: "Top Country",
      value: data?.byCountry[0]?.country ?? "—",
      icon: Globe,
      sub: data?.byCountry[0] ? `${data.byCountry[0].views} views` : undefined,
      help: "Country with the highest number of tracked visits in the current range.",
      visible: Boolean(data?.byCountry[0]),
    },
    {
      key: "device",
      label: "Top Device",
      value: data?.byDevice[0]?.device ?? "—",
      icon: BarChart3,
      sub: data?.byDevice[0] ? `${data.byDevice[0].views} views` : undefined,
      help: "Device category with the most pageviews for the selected period.",
      visible: Boolean(data?.byDevice[0]),
    },
  ].filter((card) => card.visible)

  const showSummaryMetrics = overviewCards.length > 0

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-card to-card/70 p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-primary/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-24 size-52 rounded-full bg-sky-500/10 blur-2xl" />

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Admin Intelligence</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Traffic Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Visitor behavior, trends, and acquisition signals</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-background/70 p-1">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                title={`Show the last ${d} days of traffic`}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                  days === d
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground">
            <Activity className="size-3.5" />
            <span>
              Momentum: <span className={growthPct >= 0 ? "text-emerald-600" : "text-rose-600"}>{growthPct}%</span>
            </span>
          </div>
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
          {showSummaryMetrics ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {overviewCards.map((card) => (
                <StatCard
                  key={card.key}
                  label={card.label}
                  value={card.value}
                  icon={card.icon}
                  sub={card.sub}
                  help={card.help}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
              Not enough data to show summary metrics yet. Some cards will appear once more traffic is tracked.
            </div>
          )}

          {/* Main charts */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pageviews Trend — last {days} days</p>
                <div className="inline-flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/70 px-2 py-1">
                    <span className="size-2 rounded-full bg-primary" />
                    Trend
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/70 px-2 py-1">
                    <span className="size-2 rounded-full bg-sky-500" />
                    Device share
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/70 px-2 py-1">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    Browser share
                  </span>
                </div>
              </div>
              <TrendAreaChart data={data!.dailyViews} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1">
              <DonutBreakdown
                title="Device Share"
                items={data!.byDevice.map((d) => ({ label: d.device, value: d.views }))}
                total={data!.totalViews}
              />
              <DonutBreakdown
                title="Browser Share"
                items={data!.byBrowser.map((b) => ({ label: b.browser, value: b.views }))}
                total={data!.totalViews}
              />
            </div>
          </div>

          {/* Bar lists row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PaginatedBarList
              title="Top Pages"
              items={data!.topPages.map((p) => ({ label: cleanUrl(p.url), value: p.views }))}
              total={data!.totalViews}
            />
            <PaginatedBarList
              title="Traffic Sources"
              items={data!.byReferrer.map((r) => ({ label: cleanReferrer(r.referrer), value: r.views }))}
              total={data!.totalViews}
            />
            <PaginatedBarList
              title="Countries"
              items={data!.byCountry.map((c) => ({ label: c.country, value: c.views }))}
              total={data!.totalViews}
            />
          </div>

          {/* Bar lists row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PaginatedBarList
              title="Devices"
              items={data!.byDevice.map((d) => ({ label: d.device, value: d.views }))}
              total={data!.totalViews}
            />
            <PaginatedBarList
              title="Browsers"
              items={data!.byBrowser.map((b) => ({ label: b.browser, value: b.views }))}
              total={data!.totalViews}
            />
            <PaginatedBarList
              title="Operating Systems"
              items={data!.byOs.map((o) => ({ label: o.os, value: o.views }))}
              total={data!.totalViews}
            />
          </div>

          {/* Recent visitors table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/90">
                    Recent Visitors
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/80">
                    Search and filter recent traffic before sorting or paging.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground/90">
                  <span>{filteredRecentRows.length} matched</span>
                  <CircleHelp className="size-3.5" />
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1.4fr_220px_120px]">
                <input
                  type="search"
                  value={recentSearch}
                  onChange={(e) => {
                    setRecentSearch(e.target.value)
                    setRecentPage(1)
                  }}
                  placeholder="Search URL, country, browser, source..."
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary/60"
                />

                <select
                  value={recentDeviceFilter}
                  onChange={(e) => {
                    setRecentDeviceFilter(e.target.value as typeof recentDeviceFilter)
                    setRecentPage(1)
                  }}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground/90 outline-none focus:border-primary/60"
                >
                  <option value="all">All devices</option>
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                  <option value="tablet">Tablet</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setRecentSearch("")
                    setRecentDeviceFilter("all")
                    setRecentSortBy("createdAt")
                    setRecentSortDirection("desc")
                    setRecentPage(1)
                  }}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-muted-foreground/90 transition-colors hover:bg-muted hover:text-foreground"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {([
                      { key: "createdAt", label: "Time" },
                      { key: "country", label: "Location" },
                      { key: "device", label: "Device" },
                      { key: "url", label: "Page" },
                      { key: "referrer", label: "Source" },
                    ] as const).map((column) => {
                      const active = recentSortBy === column.key
                      const direction = active ? recentSortDirection : null
                      return (
                        <th key={column.key} className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                          <button
                            type="button"
                            onClick={() => {
                              if (active) {
                                setRecentSortDirection((current) => (current === "asc" ? "desc" : "asc"))
                              } else {
                                setRecentSortBy(column.key)
                                setRecentSortDirection(column.key === "createdAt" ? "desc" : "asc")
                              }
                              setRecentPage(1)
                            }}
                            className="inline-flex items-center gap-1 text-foreground/80 transition-colors hover:text-foreground"
                            title={`Click to sort by ${column.label.toLowerCase()}${active ? ` (${direction === "asc" ? "ascending" : "descending"})` : ""}`}
                          >
                            {column.label}
                            <span className="text-[10px] text-muted-foreground/80">
                              {active ? (direction === "asc" ? "↑" : "↓") : "↕"}
                            </span>
                          </button>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {recentPageRows.map((v) => (
                    <tr key={v.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3" />
                          <span title={new Date(v.createdAt).toLocaleString("en-US", {
                            month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}>
                            {new Date(v.createdAt).toLocaleString("en-US", {
                              month: "short", day: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground" title={v.country ?? "Unknown"}>{v.country ?? "Unknown"}</div>
                        {(v.city || v.region) && (
                          <div className="text-xs text-muted-foreground" title={[v.city, v.region].filter(Boolean).join(", ")}>
                            {[v.city, v.region].filter(Boolean).join(", ")}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          {deviceIcon(v.device)}
                          <span className="capitalize" title={v.device ?? "—"}>{v.device ?? "—"}</span>
                        </div>
                        <div className="text-xs text-muted-foreground" title={`${v.browser ?? "Unknown"} · ${v.os ?? "Unknown"}`}>
                          {v.browser} · {v.os}
                        </div>
                      </td>
                      <td className="max-w-50 px-4 py-3">
                        <span className="block truncate font-mono text-xs text-foreground" title={cleanUrl(v.url)}>
                          {cleanUrl(v.url)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {v.referrer ? (
                          <div className="flex items-center gap-1 text-xs text-primary" title={cleanReferrer(v.referrer)}>
                            <ArrowUpRight className="size-3" />
                            <span className="max-w-30 truncate">{cleanReferrer(v.referrer)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MousePointer className="size-3" /> Direct
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {recentRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                        No visitors yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {recentRows.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Rows:</span>
                  <select
                    value={recentPageSize}
                    onChange={(e) => {
                      setRecentPageSize(Number(e.target.value))
                      setRecentPage(1)
                    }}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground/90"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                  </select>
                  <span>
                    {recentRows.length > 0
                      ? `${recentStart + 1}-${Math.min(recentStart + recentPageSize, recentRows.length)} of ${recentRows.length}`
                      : "0 of 0"}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRecentPage((p) => Math.max(1, p - 1))}
                    disabled={recentPageSafe === 1}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground/90 hover:bg-muted hover:text-foreground disabled:opacity-40"
                  >
                    <ChevronLeft className="size-3.5" /> Prev
                  </button>
                  <span className="px-1 text-xs text-muted-foreground/90">{recentPageSafe}/{recentTotalPages}</span>
                  <button
                    type="button"
                    onClick={() => setRecentPage((p) => Math.min(recentTotalPages, p + 1))}
                    disabled={recentPageSafe === recentTotalPages}
                    className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground/90 hover:bg-muted hover:text-foreground disabled:opacity-40"
                  >
                    Next <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
