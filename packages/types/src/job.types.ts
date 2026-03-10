export type JobStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED"
export type JobType =
  | "NEWS_FETCH"
  | "RSS_FETCH"
  | "TRENDS_FETCH"
  | "YOUTUBE_MONITOR"
  | "YOUTUBE_PROCESS"
  | "AUDIO_PROCESS"

export interface JobRun {
  id: string
  type: JobType
  status: JobStatus
  bullJobId: string | null
  sourceId: string | null
  channelId: string | null
  payload: unknown
  result: unknown
  errorMessage: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

export interface YoutubeProcessPayload {
  videoId: string
  videoUrl: string
  channelId?: string
  topicId?: string
}

export interface AudioProcessPayload {
  mediaUploadId: string
  topicId?: string
}

export interface NewsFetchPayload {
  sourceId: string
}

export interface RssFetchPayload {
  sourceId: string
}
