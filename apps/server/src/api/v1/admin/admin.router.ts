import { Router } from "express"
import { requireAdmin } from "../../../middleware/require-admin"
import { adminController } from "./admin.controller"
import { validate } from "../../../middleware/validate"
import { z } from "zod"

const router = Router()

// All admin routes require admin auth
router.use(requireAdmin)

// Stats
router.get("/stats", adminController.getStats)

// Articles queue
const articleQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(["DRAFT", "REVIEW", "APPROVED", "REJECTED", "ARCHIVED"]).optional(),
})
router.get("/articles", validate(articleQuerySchema, "query"), adminController.listArticles)

// Jobs
const jobQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  type: z.string().optional(),
  status: z.string().optional(),
})
router.get("/jobs", validate(jobQuerySchema, "query"), adminController.listJobs)
router.get("/jobs/:id", adminController.getJob)
router.delete("/jobs/:id", adminController.cancelJob)

export { router as adminRouter }
