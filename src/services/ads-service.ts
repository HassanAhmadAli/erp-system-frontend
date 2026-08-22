import {
  apiRequest,
  BASE_URL,
  buildQuery,
  type PaginatedResponse,
} from "@/api/client"
import {
  normalizePaginatedResponse,
  toPaginationQuery,
  type PaginationParams,
} from "@/lib/pagination"
import { getAccessToken } from "@/utils/auth-storage"
import type { AdPlacement, AdRequestPayload } from "@/validation/ad-schema"
import { isValidId } from "@/validation/helpers"

export type { AdPlacement }

export type Ad = {
  id: number
  title: string
  titleAr?: string | null
  description?: string | null
  descriptionAr?: string | null
  imageUrl?: string | null
  storedFileId?: string | null
  linkUrl?: string | null
  placement: AdPlacement
  isActive: boolean
  startDate: string
  endDate?: string | null
  createdAt?: string
  updatedAt?: string
}

export type AdsListResponse =
  | {
      data: Ad[]
      total?: number
      limit?: number
      offset?: number
      isFinalPage?: boolean
    }
  | Ad[]

export type CreateAdInput = AdRequestPayload

export type UpdateAdInput = Partial<AdRequestPayload>

function asArray<T>(response: unknown): T[] {
  if (!response) return []

  if (Array.isArray(response)) {
    return response as T[]
  }

  const maybe = response as { data?: unknown }

  if (Array.isArray(maybe.data)) {
    return maybe.data as T[]
  }

  return []
}

export type AdsQuery = PaginationParams & {
  activeOnly?: boolean
}

export function normalizeAds(response: unknown): Ad[] {
  return asArray<Ad>(response)
}

export function normalizeAdsList(
  response: unknown,
  fallbackLimit = 10,
  fallbackOffset = 0
): PaginatedResponse<Ad> {
  return normalizePaginatedResponse(
    response as AdsListResponse,
    fallbackLimit,
    fallbackOffset
  )
}

export function getAds(params: AdsQuery | boolean = false) {
  const normalized =
    typeof params === "boolean" ? { activeOnly: params } : (params ?? {})
  const { activeOnly = false, ...pagination } = normalized
  const query = toPaginationQuery(pagination)

  return apiRequest<AdsListResponse>(
    `/ads${buildQuery({ ...query, activeOnly })}`
  )
}

export function getAdById(id: number) {
  if (!isValidId(id)) {
    throw new Error("Invalid ad id")
  }

  return apiRequest<Ad>(`/ads/${id}`)
}

export function createAd(data: CreateAdInput) {
  return apiRequest<Ad>("/ads", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function updateAd(id: number, data: UpdateAdInput) {
  if (!isValidId(id)) {
    throw new Error("Invalid ad id")
  }

  return apiRequest<Ad>(`/ads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export function deleteAd(id: number) {
  if (!isValidId(id)) {
    throw new Error("Invalid ad id")
  }

  return apiRequest<{ message: string }>(`/ads/${id}`, {
    method: "DELETE",
  })
}

function authorizedFetch(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {})
  const token = getAccessToken()

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

/**
 * Builds an absolute URL for an advertisement image.
 * Backend stores relative paths like `/ads/image/download/{storedFileId}`.
 */
export function getAdImageSrc(
  imageUrl?: string | null,
  storedFileId?: string | null
) {
  if (imageUrl?.trim()) {
    const trimmed = imageUrl.trim()
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    if (trimmed.startsWith("/")) return `${BASE_URL}${trimmed}`
    return `${BASE_URL}/${trimmed}`
  }

  if (storedFileId?.trim()) {
    return `${BASE_URL}/ads/image/download/${storedFileId.trim()}`
  }

  return null
}

export async function uploadAdImage(adId: number, file: File) {
  if (!isValidId(adId)) {
    throw new Error("Invalid ad id")
  }

  const formData = new FormData()
  formData.append("file", file)

  const response = await authorizedFetch(`${BASE_URL}/ads/${adId}/image`, {
    method: "POST",
    body: formData,
  })

  const bodyText = await response.text()

  if (!response.ok) {
    let message = `Failed to upload ad image (${response.status})`

    try {
      const parsed = JSON.parse(bodyText) as { message?: string | string[] }
      if (Array.isArray(parsed.message)) message = parsed.message.join("\n")
      else if (typeof parsed.message === "string") message = parsed.message
      else if (bodyText.trim()) message = bodyText
    } catch {
      if (bodyText.trim()) message = bodyText
    }

    throw new Error(message)
  }

  if (!bodyText.trim()) {
    return { id: adId } as Ad
  }

  try {
    return JSON.parse(bodyText) as Ad
  } catch {
    return { id: adId, message: bodyText } as Ad & {
      message?: string
    }
  }
}

export function deleteAdImage(adId: number) {
  if (!isValidId(adId)) {
    throw new Error("Invalid ad id")
  }

  return apiRequest<{ message: string }>(`/ads/${adId}/image`, {
    method: "DELETE",
  })
}
