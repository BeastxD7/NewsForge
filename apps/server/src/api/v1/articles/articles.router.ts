import { Router } from "express"
import { articlesController } from "./articles.controller"
import { requireAdmin } from "../../../middleware/require-admin"
import { validate } from "../../../middleware/validate"
import { z } from "zod"

const router = Router()

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  category: z.string().optional(),
  tag: z.string().optional(),
  q: z.string().optional(),
})

const updateArticleSchema = z.object({
  title: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().url().optional(),
  keywords: z.array(z.string()).optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "REVIEW", "APPROVED", "REJECTED", "ARCHIVED"]).optional(),
  featured: z.boolean().optional(),
})

// Public routes
router.get("/", validate(listQuerySchema, "query"), articlesController.list)
router.get("/:slug", articlesController.findBySlug)

// Admin routes
router.patch("/:id", requireAdmin, validate(updateArticleSchema), articlesController.update)
router.delete("/:id", requireAdmin, articlesController.remove)

export { router as articlesRouter }
