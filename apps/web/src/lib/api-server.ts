import { serverEnv } from "@/lib/env-server"
import type { ApiResponse, ApiError } from "@/lib/api"

/**
 * Server-side API client that uses the API_SECRET for trusted internal calls.
 * Only import this in Server Components or Server Actions.
 */
async function serverRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${serverEnv.API_SECRET}`,
    ...(options.headers as Record<string, string>),
  }

  const res = await fetch(`${serverEnv.NEXT_PUBLIC_API_URL}/api/v1${path}`, {
    ...options,
    headers,
    cache: "no-store",
  })

  const json = (await res.json()) as ApiResponse<T> | ApiError

  if (!json.success) {
    throw new Error(json.message ?? "Request failed")
  }

  return json.data
}

export const serverApi = {
  get: <T>(path: string) => serverRequest<T>(path, { method: "GET" }),

  post: <T>(path: string, body: unknown) =>
    serverRequest<T>(path, { method: "POST", body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    serverRequest<T>(path, { method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(path: string) => serverRequest<T>(path, { method: "DELETE" }),
}
