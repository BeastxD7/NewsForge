import { Router } from "express"
import { articlesRouter } from "./articles/articles.router"
import { adminRouter } from "./admin/admin.router"
import { prisma } from "../../lib/prisma"

const router = Router()

router.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: "ok", timestamp: new Date().toISOString() })
  } catch {
    res.status(503).json({ status: "error", message: "Database unreachable" })
  }
})

router.use("/articles", articlesRouter)
router.use("/admin", adminRouter)

// Categories
router.get("/categories", async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  })
  res.json({ data: categories })
})

// Tags
router.get("/tags", async (_req, res) => {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
  })
  res.json({ data: tags })
})

export { router as v1Router }
