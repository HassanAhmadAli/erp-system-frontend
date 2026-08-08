import { apiRequest, buildQuery, type PaginatedResponse } from "@/api/client"
import {
  normalizePaginatedResponse,
  toPaginationQuery,
  type PaginationParams,
} from "@/lib/pagination"
import type { AdPlacement, AdRequestPayload } from "@/validation/ad-schema"
import { isValidId } from "@/validation/helpers"

export type { AdPlacement }

export type Ad = {
  id: number
  title: string
  description?: string | null
  imageUrl?: string | null
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
