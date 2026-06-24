import { apiRequest, buildQuery, type PaginatedResponse } from "@/api/client"

export type UserRole =
  | "CUSTOMER"
  | "CASHIER"
  | "STORE_MANAGER"
  | "ACCOUNTANT"
  | "WAREHOUSE_WORKER"

export type UserProfile = {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  role: UserRole
  nationalId?: string
  createdAt?: string
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
