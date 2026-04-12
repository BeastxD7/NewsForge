import { type NextRequest, NextResponse } from "next/server"
import { serverEnv } from "@/lib/env-server"

/**
 * Proxy analytics events from the browser to the Express server.
 * Using a Next.js proxy avoids CORS issues and ad-blocker blocks on direct API calls.
 */
async function proxy(req: NextRequest, path: string): Promise<NextResponse> {
  try {
    const body = await req.text()
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown"

    const res = await fetch(`${serverEnv.NEXT_PUBLIC_API_URL}/api/v1/analytics/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": ip,
        "User-Agent": req.headers.get("user-agent") ?? "",
      },
      body,
    })

    if (res.status === 204) return new NextResponse(null, { status: 204 })
    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url)
  const path = url.searchParams.get("event") ?? "pageview"
  return proxy(req, path)
}
