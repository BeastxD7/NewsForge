import { prisma } from "../../../lib/prisma"

// ── Geo lookup — no API key required ─────────────────────────────────────────
// Primary:   ip-api.com  (free, no key, 45 req/min)
// Fallback:  ipapi.co    (free, no key, 1000 req/day)
// Final:     skip geo silently — never crashes the tracker

interface IpInfo {
  country?: string
  region?: string
  city?: string
}

function isPrivateIp(ip: string): boolean {
  return (
    !ip ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.") ||
    ip === "unknown"
  )
}

async function getGeo(ip: string): Promise<IpInfo> {
  if (isPrivateIp(ip)) return { country: "Local", region: "Local", city: "Local" }

  // Primary: ip-api.com — completely free, no key, batch-friendly
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,regionName,city`,
      { signal: AbortSignal.timeout(3000) }
    )
    if (res.ok) {
      const d = await res.json() as Record<string, string>
      if (d["status"] === "success") {
        return { country: d["country"], region: d["regionName"], city: d["city"] }
      }
    }
  } catch { /* fall through */ }

  // Fallback: ipapi.co — free, no key, 1000/day
  try {
    const res = await fetch(
      `https://ipapi.co/${ip}/json/`,
      { signal: AbortSignal.timeout(3000) }
    )
    if (res.ok) {
      const d = await res.json() as Record<string, string>
      if (!d["error"]) {
        return { country: d["country_name"], region: d["region"], city: d["city"] }
      }
    }
  } catch { /* fall through */ }

  // If both fail, just skip geo — never block the tracker
  return {}
}

// ── User-Agent parsing (no external dep) ────────────────────────────────────

function parseUserAgent(ua: string): { browser: string; os: string; device: string } {
  const s = ua.toLowerCase()

  // Device
  let device = "desktop"
  if (/ipad|tablet|playbook|silk/.test(s)) device = "tablet"
  else if (/mobile|android|iphone|ipod|windows phone|blackberry|opera mini/.test(s)) device = "mobile"

  // OS
  let os = "Other"
  if (/windows nt/.test(s)) os = "Windows"
  else if (/mac os x|macos/.test(s)) os = "macOS"
  else if (/iphone|ipad|ipod/.test(s)) os = "iOS"
  else if (/android/.test(s)) os = "Android"
  else if (/linux/.test(s)) os = "Linux"

  // Browser
  let browser = "Other"
  if (/edg\//.test(s)) browser = "Edge"
  else if (/opr\/|opera/.test(s)) browser = "Opera"
  else if (/chrome\//.test(s) && !/chromium/.test(s)) browser = "Chrome"
  else if (/safari\//.test(s) && !/chrome/.test(s)) browser = "Safari"
  else if (/firefox\//.test(s)) browser = "Firefox"
  else if (/msie|trident/.test(s)) browser = "IE"

  return { browser, os, device }
}

// ── Record a page view ───────────────────────────────────────────────────────

export async function recordPageView(data: {
  sessionId: string
  url: string
  referrer?: string
  ip: string
  userAgent: string
  duration?: number
}): Promise<void> {
  const [geo, parsed] = await Promise.all([
    getGeo(data.ip),
    Promise.resolve(parseUserAgent(data.userAgent)),
  ])

  await prisma.pageView.create({
    data: {
      sessionId: data.sessionId,
      url: data.url,
      referrer: data.referrer || null,
      country: geo.country || null,
      region: geo.region || null,
      city: geo.city || null,
      browser: parsed.browser,
      os: parsed.os,
      device: parsed.device,
      ip: data.ip,
      userAgent: data.userAgent.slice(0, 500),
      duration: data.duration ?? null,
    },
  })
}

// ── Record a click event ─────────────────────────────────────────────────────

export async function recordClick(data: {
  sessionId: string
  url: string
  element?: string
  text?: string
  href?: string
}): Promise<void> {
  await prisma.clickEvent.create({
    data: {
      sessionId: data.sessionId,
      url: data.url,
      element: data.element || null,
      text: data.text ? data.text.slice(0, 100) : null,
      href: data.href || null,
    },
  })
}

// ── Admin analytics queries ──────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function getOverview(days = 30) {
  const since = daysAgo(days)

  const [totalViews, uniqueSessions, topPages, byCountry, byDevice, byBrowser, byOs, recentVisitors, dailyViews] =
    await Promise.all([
      // Total page views
      prisma.pageView.count({ where: { createdAt: { gte: since } } }),

      // Unique sessions (visitors)
      prisma.pageView.groupBy({
        by: ["sessionId"],
        where: { createdAt: { gte: since } },
        _count: true,
      }),

      // Top pages
      prisma.pageView.groupBy({
        by: ["url"],
        where: { createdAt: { gte: since } },
        _count: { url: true },
        orderBy: { _count: { url: "desc" } },
        take: 10,
      }),

      // By country
      prisma.pageView.groupBy({
        by: ["country"],
        where: { createdAt: { gte: since }, country: { not: null } },
        _count: { country: true },
        orderBy: { _count: { country: "desc" } },
        take: 10,
      }),

      // By device
      prisma.pageView.groupBy({
        by: ["device"],
        where: { createdAt: { gte: since } },
        _count: { device: true },
        orderBy: { _count: { device: "desc" } },
      }),

      // By browser
      prisma.pageView.groupBy({
        by: ["browser"],
        where: { createdAt: { gte: since } },
        _count: { browser: true },
        orderBy: { _count: { browser: "desc" } },
        take: 6,
      }),

      // By OS
      prisma.pageView.groupBy({
        by: ["os"],
        where: { createdAt: { gte: since } },
        _count: { os: true },
        orderBy: { _count: { os: "desc" } },
        take: 6,
      }),

      // Recent 50 visitors
      prisma.pageView.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          sessionId: true,
          url: true,
          referrer: true,
          country: true,
          region: true,
          city: true,
          browser: true,
          os: true,
          device: true,
          createdAt: true,
        },
      }),

      // Daily pageviews for chart
      prisma.$queryRaw<Array<{ date: string; views: bigint }>>`
        SELECT DATE_TRUNC('day', "createdAt")::date::text AS date,
               COUNT(*) AS views
        FROM page_views
        WHERE "createdAt" >= ${since}
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY DATE_TRUNC('day', "createdAt")
      `,
    ])

  // Referrer breakdown
  const byReferrer = await prisma.pageView.groupBy({
    by: ["referrer"],
    where: { createdAt: { gte: since } },
    _count: { referrer: true },
    orderBy: { _count: { referrer: "desc" } },
    take: 10,
  })

  return {
    totalViews,
    uniqueVisitors: uniqueSessions.length,
    topPages: topPages.map((p) => ({ url: p.url, views: p._count.url })),
    byCountry: byCountry.map((c) => ({ country: c.country ?? "Unknown", views: c._count.country })),
    byDevice: byDevice.map((d) => ({ device: d.device ?? "unknown", views: d._count.device })),
    byBrowser: byBrowser.map((b) => ({ browser: b.browser ?? "Other", views: b._count.browser })),
    byOs: byOs.map((o) => ({ os: o.os ?? "Other", views: o._count.os })),
    byReferrer: byReferrer.map((r) => ({
      referrer: r.referrer || "Direct",
      views: r._count.referrer,
    })),
    recentVisitors,
    dailyViews: dailyViews.map((d) => ({ date: d.date, views: Number(d.views) })),
  }
}

export async function getSessionJourney(sessionId: string) {
  const [views, clicks] = await Promise.all([
    prisma.pageView.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      select: { url: true, createdAt: true, duration: true },
    }),
    prisma.clickEvent.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      select: { url: true, element: true, text: true, href: true, createdAt: true },
    }),
  ])
  return { views, clicks }
}
