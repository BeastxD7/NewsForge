export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
}

export interface AdminStats {
  articles: {
    draft: number
    review: number
    approved: number
    rejected: number
    total: number
  }
  jobs: {
    pending: number
    running: number
    failed: number
    completedToday: number
  }
  sources: {
    total: number
    enabled: number
  }
  channels: {
    total: number
    enabled: number
  }
}
