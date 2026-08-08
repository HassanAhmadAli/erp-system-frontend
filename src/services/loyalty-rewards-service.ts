import { apiRequest, buildQuery, type PaginatedResponse } from "@/api/client"
import {
  normalizePaginatedResponse,
  toPaginationQuery,
  type PaginationParams,
} from "@/lib/pagination"
import {
  type LoyaltyDiscountType,
  type LoyaltyRewardPayload,
} from "@/validation/loyalty-schema"
import { isValidUuid } from "@/validation/helpers"

export type LoyaltyReward = {
  id: string
  name: string
  description?: string | null
  pointsCost: number
  discountType: LoyaltyDiscountType
  discountValue: number | string
  maxUses: number
  validityDays: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type LoyaltyRewardsQuery = PaginationParams

export type CreateLoyaltyRewardInput = LoyaltyRewardPayload

export type UpdateLoyaltyRewardInput = Partial<LoyaltyRewardPayload> & {
  /** Backend update DTO currently requires pointsCost on every PATCH. */
  pointsCost: number
}

export function normalizeLoyaltyRewardsList(
  response?: PaginatedResponse<LoyaltyReward> | LoyaltyReward[] | null,
  fallbackLimit = 10,
  fallbackOffset = 0
) {
  return normalizePaginatedResponse(response, fallbackLimit, fallbackOffset)
}

export function getLoyaltyRewards(params?: LoyaltyRewardsQuery) {
  const query = toPaginationQuery(params ?? { limit: 100 })
  return apiRequest<PaginatedResponse<LoyaltyReward> | LoyaltyReward[]>(
    `/loyalty-rewards${buildQuery(query)}`
  )
}

export function getLoyaltyRewardById(id: string) {
  if (!isValidUuid(id)) throw new Error("Invalid loyalty reward id")

  return apiRequest<LoyaltyReward>(`/loyalty-rewards/${id}`)
}

export function createLoyaltyReward(data: CreateLoyaltyRewardInput) {
  return apiRequest<LoyaltyReward>("/loyalty-rewards", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function updateLoyaltyReward(
  id: string,
  data: UpdateLoyaltyRewardInput
) {
  if (!isValidUuid(id)) throw new Error("Invalid loyalty reward id")

  return apiRequest<LoyaltyReward>(`/loyalty-rewards/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export function deleteLoyaltyReward(id: string) {
  if (!isValidUuid(id)) throw new Error("Invalid loyalty reward id")

  return apiRequest<{ message: string }>(`/loyalty-rewards/${id}`, {
    method: "DELETE",
  })
}
