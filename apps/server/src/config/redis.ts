import { Redis } from "ioredis"
import { env } from "./env"

const globalForRedis = globalThis as unknown as { redis: Redis | undefined }

export const redis =
  globalForRedis.redis ??
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // Required for BullMQ
  })

if (env.NODE_ENV !== "production") {
  globalForRedis.redis = redis
}

redis.on("error", (err) => {
  console.error("[Redis] Connection error:", err.message)
})

redis.on("connect", () => {
  console.log("[Redis] Connected")
})
