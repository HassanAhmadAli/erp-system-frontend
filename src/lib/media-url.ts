import { BASE_URL } from "@/api/client"

export function asTrimmedText(value: unknown): string {
  if (typeof value === "string") return value.trim()
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return ""
}

export function resolveMediaUrl(
  source?: unknown,
  fallbackPath?: unknown
): string | null {
  const direct = asTrimmedText(source)
  if (direct) {
    if (/^(https?:|data:|blob:)/i.test(direct)) return direct
    return `${BASE_URL}${direct.startsWith("/") ? direct : `/${direct}`}`
  }

  const fallback = asTrimmedText(fallbackPath)
  if (!fallback) return null
  if (/^(https?:|data:|blob:)/i.test(fallback)) return fallback
  return `${BASE_URL}${fallback.startsWith("/") ? fallback : `/${fallback}`}`
}

export function resolveStoredFileUrl(
  downloadPath: string,
  storedFileId?: unknown
): string | null {
  const id = asTrimmedText(storedFileId)
  if (!id) return null

  const prefix = downloadPath.startsWith("/")
    ? downloadPath
    : `/${downloadPath}`
  return `${BASE_URL}${prefix}/${encodeURIComponent(id)}`
}

export function toApiEndpoint(src: string): string | null {
  const trimmed = src.trim()
  if (!trimmed) return null
  if (/^(blob:|data:)/i.test(trimmed)) return null

  if (trimmed.startsWith(BASE_URL)) {
    const path = trimmed.slice(BASE_URL.length)
    return path.startsWith("/") ? path : `/${path}`
  }

  if (
    trimmed.startsWith("/product-photo/") ||
    trimmed.startsWith("/category/image/") ||
    trimmed.startsWith("/ads/image/")
  ) {
    return trimmed
  }

  return null
}
