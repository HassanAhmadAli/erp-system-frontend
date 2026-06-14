import { apiRequest } from "@/api/client"

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

export type CreateLoyaltyRewardInput = {
  pointsThreshold: number
  rewardDescription: string
  discountValue: number
  isActive: boolean
}

export type UpdateLoyaltyRewardInput = Partial<CreateLoyaltyRewardInput>

export function getLoyaltyPolicy() {
  return apiRequest<LoyaltyPolicy>("/loyalty-rewards/policy")
}

export function updateLoyaltyPolicy(data: LoyaltyPolicy) {
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
  return apiRequest<LoyaltyReward>(`/loyalty-rewards/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export function deleteLoyaltyReward(id: string) {
  return apiRequest<{ message: string }>(`/loyalty-rewards/${id}`, {
    method: "DELETE",
  })
}
