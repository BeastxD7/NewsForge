import type { Request, Response } from "express"
import { recordPageView, recordClick, getOverview, getSessionJourney } from "./analytics.service"
import { apiSuccess, apiNoContent } from "../../../lib/response"

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.socket.remoteAddress ??
    "unknown"
  )
}

export const analyticsController = {
  async trackPageView(req: Request, res: Response): Promise<void> {
    const { sessionId, url, referrer, duration } = req.body as {
      sessionId: string
      url: string
      referrer?: string
      duration?: number
    }
    const ip = getClientIp(req)
    const userAgent = req.headers["user-agent"] ?? ""

    // Fire and forget — don't block the response
    recordPageView({ sessionId, url, referrer, ip, userAgent, duration }).catch(() => {})
    apiNoContent(res)
  },

  async trackClick(req: Request, res: Response): Promise<void> {
    const { sessionId, url, element, text, href } = req.body as {
      sessionId: string
      url: string
      element?: string
      text?: string
      href?: string
    }
    recordClick({ sessionId, url, element, text, href }).catch(() => {})
    apiNoContent(res)
  },

  async getOverview(req: Request, res: Response): Promise<void> {
    const days = Math.min(90, Math.max(1, Number((req.query as Record<string, string>)["days"] ?? 30)))
    const data = await getOverview(days)
    apiSuccess(res, data)
  },

  async getSessionJourney(req: Request, res: Response): Promise<void> {
    const sessionId = String(req.params["sessionId"])
    const data = await getSessionJourney(sessionId)
    apiSuccess(res, data)
  },
}
