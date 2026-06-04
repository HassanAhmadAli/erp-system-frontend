import { getAccessToken } from "@/utils/auth-storage"

export const BASE_URL = "http://localhost:3000"

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken()

  const headers = new Headers(options.headers || {})

  const body = options.body
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData

  // For multipart uploads, let the browser set the Content-Type boundary.
  // For JSON requests, keep existing behavior.
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error)
  }

  return response.json()
}
