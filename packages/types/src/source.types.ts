import type { SourceType } from "./article.types"

export interface ContentSource {
  id: string
  type: SourceType
  name: string
  url: string | null
  config: unknown
  enabled: boolean
  topicId: string | null
  lastFetchAt: string | null
  createdAt: string
}

export interface YoutubeChannel {
  id: string
  channelId: string
  channelName: string
  channelUrl: string
  enabled: boolean
  topicId: string | null
  lastCheckedAt: string | null
  lastVideoId: string | null
  createdAt: string
}

export interface Topic {
  id: string
  name: string
  description: string | null
  keywords: string[]
  enabled: boolean
  categoryId: string | null
  createdAt: string
}

export interface CreateSourceDto {
  type: SourceType
  name: string
  url?: string
  config?: Record<string, unknown>
  topicId?: string
}

export interface CreateChannelDto {
  channelId: string
  channelName: string
  channelUrl: string
  topicId?: string
}

export interface CreateTopicDto {
  name: string
  description?: string
  keywords: string[]
  categoryId?: string
}
