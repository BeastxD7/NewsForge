import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { prisma } from "@news-app/db"
import { env } from "../../../apps/server/src/config/env"

const API = `http://localhost:${env.PORT}/api/v1`
const adminHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${env.API_SECRET}`,
}

const TEST_SLUG = "integration-admin-test-article"
let articleId: string

beforeAll(async () => {
  const article = await prisma.article.upsert({
    where: { slug: TEST_SLUG },
    update: {},
    create: {
      title: "Admin Test Article",
      slug: TEST_SLUG,
      content: "Content for admin testing.",
      status: "DRAFT",
      aiGenerated: true,
    },
  })
  articleId = article.id
})

afterAll(async () => {
  await prisma.article.deleteMany({ where: { slug: TEST_SLUG } })
  await prisma.$disconnect()
})

describe("GET /api/v1/admin/articles", () => {
  it("returns 401 without auth header", async () => {
    const res = await fetch(`${API}/admin/articles`)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.success).toBe(false)
  })

  it("returns paginated success envelope with admin auth", async () => {
    const res = await fetch(`${API}/admin/articles`, { headers: adminHeaders })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(typeof body.total).toBe("number")
  })

  it("filters by status", async () => {
    const res = await fetch(`${API}/admin/articles?status=DRAFT`, { headers: adminHeaders })
    const body = await res.json()
    expect(body.success).toBe(true)
    body.data.forEach((a: { status: string }) => expect(a.status).toBe("DRAFT"))
  })
})

describe("PATCH /api/v1/articles/:id (admin approve/reject)", () => {
  it("returns 401 without auth", async () => {
    const res = await fetch(`${API}/articles/${articleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    })
    expect(res.status).toBe(401)
  })

  it("approves article and sets publishedAt", async () => {
    const res = await fetch(`${API}/articles/${articleId}`, {
      method: "PATCH",
      headers: adminHeaders,
      body: JSON.stringify({ status: "APPROVED" }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.status).toBe("APPROVED")
    expect(body.data.publishedAt).not.toBeNull()
  })

  it("rejects article", async () => {
    const res = await fetch(`${API}/articles/${articleId}`, {
      method: "PATCH",
      headers: adminHeaders,
      body: JSON.stringify({ status: "REJECTED" }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.status).toBe("REJECTED")
  })
})

describe("GET /api/v1/admin/stats", () => {
  it("returns stats with success envelope", async () => {
    const res = await fetch(`${API}/admin/stats`, { headers: adminHeaders })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toHaveProperty("articles")
    expect(body.data).toHaveProperty("jobs")
    expect(body.data).toHaveProperty("sources")
    expect(body.data).toHaveProperty("channels")
  })
})

describe("GET /api/v1/admin/ai-config", () => {
  it("returns active AI config", async () => {
    const res = await fetch(`${API}/admin/ai-config`, { headers: adminHeaders })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toHaveProperty("provider")
    expect(body.data).toHaveProperty("model")
    expect(body.data).toHaveProperty("temperature")
    expect(body.data).toHaveProperty("maxTokens")
  })

  it("updates AI config", async () => {
    const res = await fetch(`${API}/admin/ai-config`, {
      method: "PATCH",
      headers: adminHeaders,
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", temperature: 0.5 }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.model).toBe("claude-haiku-4-5-20251001")
    expect(body.data.temperature).toBe(0.5)

    // restore
    await fetch(`${API}/admin/ai-config`, {
      method: "PATCH",
      headers: adminHeaders,
      body: JSON.stringify({ model: "claude-sonnet-4-6", temperature: 0.7 }),
    })
  })
})
