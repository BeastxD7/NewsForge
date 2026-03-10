import { Router } from "express"
import { articlesRouter } from "./articles/articles.router"
import { adminRouter } from "./admin/admin.router"
import { prisma } from "../../lib/prisma"
import { apiSuccess } from "../../lib/response"

const router = Router()

router.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    apiSuccess(res, { timestamp: new Date().toISOString() }, "OK")
  } catch {
    res.status(503).json({
      success: false,
      statusCode: 503,
      message: "Database unreachable",
      error: "SERVICE_UNAVAILABLE",
    })
  }
})

router.use("/articles", articlesRouter)
router.use("/admin", adminRouter)

router.get("/categories", async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })
  apiSuccess(res, categories)
})

router.get("/tags", async (_req, res) => {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } })
  apiSuccess(res, tags)
})

export { router as v1Router }
