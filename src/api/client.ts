import { getAccessToken } from "@/utils/auth-storage"

export const BASE_URL = "http://localhost:3000"

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  limit: number
  offset: number
  isFinalPage: boolean
}

export function buildQuery(
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  const query = new URLSearchParams()

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value))
      }
    }
  }

  const qs = query.toString()
  return qs ? `?${qs}` : ""
}

function buildHeaders(options: RequestInit = {}) {
  const token = getAccessToken()
  const headers = new Headers(options.headers || {})
  const body = options.body
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  return headers
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(options),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error)
  }

  return response.json()
}

export async function apiRequestBlob(
  endpoint: string,
  options: RequestInit = {}
): Promise<Blob> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(options),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error)
  }

  return response.blob()
}
