import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { prisma } from "@news-app/db"

const API = `http://localhost:${process.env.PORT ?? 3001}/api/v1`

const TEST_SLUG = "integration-test-article"

beforeAll(async () => {
  await prisma.article.upsert({
    where: { slug: TEST_SLUG },
    update: {},
    create: {
      title: "Integration Test Article",
      slug: TEST_SLUG,
      content: "This is test content for integration testing.",
      excerpt: "Test excerpt",
      status: "APPROVED",
      publishedAt: new Date(),
      aiGenerated: false,
    },
  })
})

afterAll(async () => {
  await prisma.article.deleteMany({ where: { slug: TEST_SLUG } })
  await prisma.$disconnect()
})

describe("GET /api/v1/articles", () => {
  it("returns 200 with success envelope", async () => {
    const res = await fetch(`${API}/articles`)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.statusCode).toBe(200)
    expect(Array.isArray(body.data)).toBe(true)
    expect(typeof body.total).toBe("number")
    expect(typeof body.page).toBe("number")
    expect(typeof body.totalPages).toBe("number")
  })

  it("respects pageSize param", async () => {
    const res = await fetch(`${API}/articles?pageSize=3`)
    const body = await res.json()
    expect(body.data.length).toBeLessThanOrEqual(3)
    expect(body.pageSize).toBe(3)
  })

  it("returns 400 for invalid page param", async () => {
    const res = await fetch(`${API}/articles?page=abc`)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toBe("VALIDATION_ERROR")
  })

  it("filters by category slug without error", async () => {
    const res = await fetch(`${API}/articles?category=technology`)
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)
  })

  it("supports full-text search", async () => {
    const res = await fetch(`${API}/articles?q=integration`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
  })
})

describe("GET /api/v1/articles/:slug", () => {
  it("returns article wrapped in success envelope", async () => {
    const res = await fetch(`${API}/articles/${TEST_SLUG}`)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.slug).toBe(TEST_SLUG)
  })

  it("returns 404 with error envelope for unknown slug", async () => {
    const res = await fetch(`${API}/articles/this-does-not-exist-xyz`)
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.success).toBe(false)
    expect(body.error).toBe("NOT_FOUND")
  })

  it("does not expose DRAFT articles on public endpoint", async () => {
    const draftSlug = "integration-test-draft"
    await prisma.article.upsert({
      where: { slug: draftSlug },
      update: {},
      create: { title: "Draft", slug: draftSlug, content: "Draft", status: "DRAFT", aiGenerated: false },
    })
    const res = await fetch(`${API}/articles/${draftSlug}`)
    expect(res.status).toBe(404)
    await prisma.article.delete({ where: { slug: draftSlug } })
  })
})

describe("GET /api/v1/health", () => {
  it("returns success envelope with timestamp", async () => {
    const res = await fetch(`${API}/health`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toHaveProperty("timestamp")
  })
})

describe("GET /api/v1/categories", () => {
  it("returns seeded categories in success envelope", async () => {
    const res = await fetch(`${API}/categories`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThan(0)
  })
})
