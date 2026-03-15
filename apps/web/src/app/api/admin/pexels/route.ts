import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { serverEnv } from "@/lib/env-server"

interface PexelsPhoto {
  id: number
  url: string
  src: { medium: string; large2x: string }
  alt: string
  photographer: string
}

interface PexelsResponse {
  photos: PexelsPhoto[]
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, photos: [] }, { status: 401 })
    }

    const pexelsKey = serverEnv.PEXELS_API_KEY
    if (!pexelsKey) {
      return NextResponse.json({ success: false, message: "Pexels API key not configured", photos: [] }, { status: 503 })
    }

    const q = req.nextUrl.searchParams.get("q") ?? ""
    if (!q.trim()) {
      return NextResponse.json({ success: true, photos: [] })
    }

    const url = new URL("https://api.pexels.com/v1/search")
    url.searchParams.set("query", q)
    url.searchParams.set("per_page", "12")
    url.searchParams.set("orientation", "landscape")

    const res = await fetch(url.toString(), { headers: { Authorization: pexelsKey } })
    if (!res.ok) {
      return NextResponse.json({ success: false, photos: [] }, { status: 502 })
    }

    const data = await res.json() as PexelsResponse
    const photos = data.photos.map((p) => ({
      id: p.id,
      thumb: p.src.medium,
      url: p.src.large2x,
      alt: p.alt,
      photographer: p.photographer,
    }))

    return NextResponse.json({ success: true, photos })
  } catch {
    return NextResponse.json({ success: false, photos: [] }, { status: 500 })
  }
}
