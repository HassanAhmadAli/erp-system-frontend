import { apiRequest, buildQuery, type PaginatedResponse } from "@/api/client"
import type { AppLanguage } from "@/i18n/types"

export type UserRole =
  | "CUSTOMER"
  | "CASHIER"
  | "STORE_MANAGER"
  | "ACCOUNTANT"
  | "WAREHOUSE_WORKER"

export type UserProfile = {
  id?: number
  fullName: string
  fullNameAr?: string | null
  email: string
  phoneNumber?: string | null
  role: UserRole
  nationalId?: string | null
  jobTitle?: string | null
  jobTitleAr?: string | null
  language?: AppLanguage | string
  createdAt?: string
}

export type UpdateCurrentUserProfilePayload = {
  fullName?: string
  fullNameAr?: string
  email?: string
  phoneNumber?: string
  nationalId?: string
  language?: AppLanguage
}

export type UsersQuery = {
  limit?: number
  offset?: number
  role?: UserRole
}

export function normalizeUsers(
  response?: PaginatedResponse<UserProfile> | UserProfile[]
) {
  if (!response) return []

  if (Array.isArray(response)) return response

  return response.data ?? []
}

export async function getUsers(params?: UsersQuery) {
  return apiRequest<PaginatedResponse<UserProfile> | UserProfile[]>(
    `/user${buildQuery(params)}`
  )
}

export async function getCurrentUser() {
  return apiRequest<UserProfile>("/user/me")
}

export async function updateCurrentUserProfile(
  data: UpdateCurrentUserProfilePayload
) {
  return apiRequest<UserProfile>("/user/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function updateUserLanguage(language: AppLanguage) {
  return apiRequest<void>("/user/language", {
    method: "PATCH",
    body: JSON.stringify({ language }),
  })
}

export async function updateStoreManagerProfile(
  data: UpdateCurrentUserProfilePayload
) {
  return apiRequest<UserProfile>("/user/store-manager/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}
