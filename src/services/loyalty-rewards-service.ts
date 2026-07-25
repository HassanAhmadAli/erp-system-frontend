import { apiRequest } from "@/api/client"
import {
  type LoyaltyPolicyPayload,
  type LoyaltyRewardPayload,
} from "@/validation/loyalty-schema"
import { isValidId } from "@/validation/helpers"

export type LoyaltyPolicy = {
  id?: number
  pointsPerCurrency: number | string
  currencyPerPoint: number | string
  updatedAt?: string
}

export type LoyaltyReward = {
  id: string
  pointsThreshold: number
  rewardDescription: string
  discountValue: number | string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type UpdateLoyaltyPolicyInput = LoyaltyPolicyPayload

export type CreateLoyaltyRewardInput = LoyaltyRewardPayload

export type UpdateLoyaltyRewardInput = Partial<CreateLoyaltyRewardInput>

export function getLoyaltyPolicy() {
  return apiRequest<LoyaltyPolicy>("/loyalty-rewards/policy")
}

export function updateLoyaltyPolicy(data: UpdateLoyaltyPolicyInput) {
  return apiRequest<LoyaltyPolicy>("/loyalty-rewards/policy", {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export function getLoyaltyRewards() {
  return apiRequest<LoyaltyReward[] | { data: LoyaltyReward[] }>(
    "/loyalty-rewards/"
  )
}

export function getLoyaltyRewardById(id: string) {
  if (!isValidId(id)) throw new Error("Invalid loyalty reward id")

  return apiRequest<LoyaltyReward>(`/loyalty-rewards/${id}`)
}

export function createLoyaltyReward(data: CreateLoyaltyRewardInput) {
  return apiRequest<LoyaltyReward>("/loyalty-rewards/", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function updateLoyaltyReward(
  id: string,
  data: UpdateLoyaltyRewardInput
) {
  if (!isValidId(id)) throw new Error("Invalid loyalty reward id")

  return apiRequest<LoyaltyReward>(`/loyalty-rewards/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export function deleteLoyaltyReward(id: string) {
  if (!isValidId(id)) throw new Error("Invalid loyalty reward id")

  return apiRequest<{ message: string }>(`/loyalty-rewards/${id}`, {
    method: "DELETE",
  })
}
