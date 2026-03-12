import { env } from "@/lib/env"

export interface ApiResponse<T> {
  success: true
  statusCode: number
  message: string
  data: T
}

export interface ApiError {
  success: false
  statusCode: number
  message: string
  error?: unknown
}

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/v1${path}`, {
    ...fetchOptions,
    headers,
  })

  const json = (await res.json()) as ApiResponse<T> | ApiError

  if (!json.success) {
    throw new Error(json.message ?? "Request failed")
  }

  return json.data
}

export const api = {
  get: <T>(path: string, token?: string) =>
    request<T>(path, { method: "GET", token }),

  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body), token }),

  patch: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body), token }),

  delete: <T>(path: string, token?: string) =>
    request<T>(path, { method: "DELETE", token }),
}
