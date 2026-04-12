import { serverEnv } from "@/lib/env-server"
import type { ApiResponse, ApiError } from "@/lib/api"

function parseApiPayload<T>(raw: string, url: string, status: number): ApiResponse<T> | ApiError {
  try {
    return JSON.parse(raw) as ApiResponse<T> | ApiError
  } catch {
    const preview = raw.slice(0, 120).replace(/\s+/g, " ")
    throw new Error(
      `Expected JSON from ${url} (status ${status}), but got non-JSON response: ${preview}`
    )
  }
}

function parseJsonObject(raw: string, url: string, status: number): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>
    }
    throw new Error("Response JSON was not an object")
  } catch {
    const preview = raw.slice(0, 120).replace(/\s+/g, " ")
    throw new Error(
      `Expected JSON object from ${url} (status ${status}), but got invalid response: ${preview}`
    )
  }
}

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

  const url = `${serverEnv.NEXT_PUBLIC_API_URL}/api/v1${path}`
  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  })

  const raw = await res.text()
  const json = parseApiPayload<T>(raw, url, res.status)

  if (!json.success) {
    throw new Error(json.message ?? "Request failed")
  }

  return json.data
}

async function serverRequestRaw(path: string, options: RequestInit = {}): Promise<Record<string, unknown>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${serverEnv.API_SECRET}`,
    ...(options.headers as Record<string, string>),
  }
  const url = `${serverEnv.NEXT_PUBLIC_API_URL}/api/v1${path}`
  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  })
  const raw = await res.text()
  const json = parseJsonObject(raw, url, res.status)
  if (!json["success"]) throw new Error(String(json["message"] ?? "Request failed"))
  return json
}

export const serverApi = {
  get: <T>(path: string) => serverRequest<T>(path, { method: "GET" }),
  getRaw: (path: string) => serverRequestRaw(path, { method: "GET" }),

  post: <T>(path: string, body: unknown) =>
    serverRequest<T>(path, { method: "POST", body: JSON.stringify(body) }),

  patch: <T>(path: string, body: unknown) =>
    serverRequest<T>(path, { method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(path: string) => serverRequest<T>(path, { method: "DELETE" }),
}
