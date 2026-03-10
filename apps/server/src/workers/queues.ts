import { Queue } from "bullmq"
import { redis } from "../config/redis"

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
  connection: redis,
  defaultJobOptions,
})

export const rssFetchQueue = new Queue("rss-fetch", {
  connection: redis,
  defaultJobOptions,
})

export const trendsFetchQueue = new Queue("trends-fetch", {
  connection: redis,
  defaultJobOptions,
})

export const youtubeMonitorQueue = new Queue("youtube-monitor", {
  connection: redis,
  defaultJobOptions,
})

export const youtubeProcessQueue = new Queue("youtube-process", {
  connection: redis,
  defaultJobOptions,
})

export const audioProcessQueue = new Queue("audio-process", {
  connection: redis,
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
