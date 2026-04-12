import { Router } from "express"
import { analyticsController } from "./analytics.controller"
import { validate } from "../../../middleware/validate"
import { requireAdmin } from "../../../middleware/require-admin"
import { z } from "zod"

const router = Router()

// ── Public: receive events from browser ─────────────────────────────────────
const pageViewSchema = z.object({
  sessionId: z.string().min(1),
  url: z.string().min(1),
  referrer: z.string().optional(),
  duration: z.number().int().optional(),
})

const clickSchema = z.object({
  sessionId: z.string().min(1),
  url: z.string().min(1),
  element: z.string().optional(),
  text: z.string().optional(),
  href: z.string().optional(),
})

router.post("/pageview", validate(pageViewSchema), analyticsController.trackPageView)
router.post("/click", validate(clickSchema), analyticsController.trackClick)

// ── Admin: read analytics ─────────────────────────────────────────────────
router.get("/overview", requireAdmin, analyticsController.getOverview)
router.get("/session/:sessionId", requireAdmin, analyticsController.getSessionJourney)

export { router as analyticsRouter }
