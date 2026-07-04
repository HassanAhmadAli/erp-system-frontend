import { apiRequest } from "@/api/client"
import {
  type AdPlacement,
  type AdRequestPayload,
} from "@/validation/ad-schema"
import { isValidId } from "@/validation/helpers"

export type { AdPlacement }

export type Ad = {
  id: number
  title: string
  description: string
  imageUrl: string | null
  linkUrl: string | null
  placement: AdPlacement
  isActive: boolean
  startDate: string
  endDate: string
  createdAt?: string
  updatedAt?: string
}

export type AdsListResponse =
  | {
      data: Ad[]
      total?: number
    }
  | Ad[]

export type CreateAdInput = AdRequestPayload

export type UpdateAdInput = Partial<CreateAdInput>

function asArray<T>(response: unknown): T[] {
  if (!response) return []

  if (Array.isArray(response)) return response as T[]

  const maybe = response as { data?: unknown }

  if (maybe?.data && Array.isArray(maybe.data)) {
    return maybe.data as T[]
  }

  return []
}

export function normalizeAds(response: unknown): Ad[] {
  return asArray<Ad>(response)
}

export function getAds(activeOnly = false) {
  return apiRequest<AdsListResponse>(`/ads?activeOnly=${activeOnly}`)
}

export function getAdById(id: number) {
  if (!isValidId(id)) throw new Error("Invalid ad id")

  return apiRequest<Ad>(`/ads/${id}`)
}

export function createAd(data: CreateAdInput) {
  return apiRequest<Ad>(`/ads`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function updateAd(id: number, data: UpdateAdInput) {
  if (!isValidId(id)) throw new Error("Invalid ad id")

  return apiRequest<Ad>(`/ads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export function deleteAd(id: number) {
  if (!isValidId(id)) throw new Error("Invalid ad id")

  return apiRequest<{ message: string }>(`/ads/${id}`, {
    method: "DELETE",
  })
}
