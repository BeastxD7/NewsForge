// ─── Standardized response envelopes ─────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  statusCode: number
  message: string
  data: T
}

export interface ApiError {
  success: false
  statusCode: number
  message: string
  error: string
  details?: Record<string, unknown>
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Paginated wrapper ────────────────────────────────────────────────────────

export interface PaginatedData<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type PaginatedResponse<T> = ApiSuccess<PaginatedData<T>>

// ─── Admin stats ──────────────────────────────────────────────────────────────

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
