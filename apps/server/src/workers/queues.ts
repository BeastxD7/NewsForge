import { Queue } from "bullmq"
import { env } from "../config/env"

// Pass URL-based connection to avoid ioredis version type conflicts between
// BullMQ's peer dep and the standalone ioredis used elsewhere.
const bullMQConnection = { url: env.REDIS_URL, maxRetriesPerRequest: null as unknown as undefined }

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential" as const,
    delay: 5000,
  },
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 200 },
}

export const newsFetchQueue = new Queue("news-fetch", {
  connection: bullMQConnection,
  defaultJobOptions,
})

export const rssFetchQueue = new Queue("rss-fetch", {
  connection: bullMQConnection,
  defaultJobOptions,
})

export const trendsFetchQueue = new Queue("trends-fetch", {
  connection: bullMQConnection,
  defaultJobOptions,
})

export const youtubeMonitorQueue = new Queue("youtube-monitor", {
  connection: bullMQConnection,
  defaultJobOptions,
})

export const youtubeProcessQueue = new Queue("youtube-process", {
  connection: bullMQConnection,
  defaultJobOptions,
})

export const audioProcessQueue = new Queue("audio-process", {
  connection: bullMQConnection,
  defaultJobOptions,
})

export const allQueues = [
  newsFetchQueue,
  rssFetchQueue,
  trendsFetchQueue,
  youtubeMonitorQueue,
  youtubeProcessQueue,
  audioProcessQueue,
]
