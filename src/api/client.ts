import { getCurrentLanguage } from "@/i18n"
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "@/utils/auth-storage"

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"
).replace(/\/$/, "")

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

  if (!headers.has("Accept-Language")) {
    headers.set("Accept-Language", getCurrentLanguage())
  }

  return headers
}

function getErrorMessage(errorBody: unknown, fallback: string) {
  if (!errorBody) {
    return fallback
  }

  if (typeof errorBody === "string") {
    return errorBody
  }

  if (typeof errorBody !== "object") {
    return fallback
  }

  const maybeError = errorBody as {
    message?: unknown
    error?: unknown
  }

  if (Array.isArray(maybeError.message)) {
    return maybeError.message.join("\n")
  }

  if (typeof maybeError.message === "string") {
    return maybeError.message
  }

  if (typeof maybeError.error === "string") {
    return maybeError.error
  }

  return fallback
}

function parseResponseBody(text: string): unknown {
  if (!text.trim()) {
    return undefined
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function readResponseBody(response: Response) {
  const text = await response.text()
  return parseResponseBody(text)
}

let refreshInFlight: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return false

    try {
      const response = await fetch(
        `${BASE_URL}/authentication/refresh-tokens`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }
      )

      if (!response.ok) {
        clearTokens()
        return false
      }

      const data = (await response.json()) as {
        access_token?: string
        refresh_token?: string
      }

      if (!data.access_token?.trim() || !data.refresh_token?.trim()) {
        clearTokens()
        return false
      }

      saveTokens(data.access_token, data.refresh_token)
      return true
    } catch {
      return false
    }
  })().finally(() => {
    refreshInFlight = null
  })

  return refreshInFlight
}

async function authorizedFetch(
  endpoint: string,
  options: RequestInit = {},
  retried = false
): Promise<Response> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(options),
  })

  const isAuthEndpoint = endpoint.startsWith("/authentication/")
  if (response.status !== 401 || retried || isAuthEndpoint) {
    return response
  }

  const refreshed = await refreshAccessToken()
  if (!refreshed) return response

  return authorizedFetch(endpoint, options, true)
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await authorizedFetch(endpoint, options)
  const body = await readResponseBody(response)

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(body, `Request failed with status ${response.status}`),
      response.status
    )
  }

  return body as T
}

export async function apiRequestBlob(
  endpoint: string,
  options: RequestInit = {}
): Promise<Blob> {
  const response = await authorizedFetch(endpoint, options)

  if (!response.ok) {
    const body = await readResponseBody(response)

    throw new ApiError(
      getErrorMessage(body, `Request failed with status ${response.status}`),
      response.status
    )
  }

  return response.blob()
}
