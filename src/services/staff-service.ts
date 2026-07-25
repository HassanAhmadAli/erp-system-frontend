import { apiRequest, buildQuery, type PaginatedResponse } from "@/api/client"
import type {
  CreateStaffPayload,
  UpdateStaffProfilePayload,
} from "@/validation/staff-schema"
import { isValidId } from "@/validation/helpers"
import {
  normalizeUsers,
  type UserProfile,
  type UserRole,
  type UsersQuery,
} from "@/services/user-service"

export type StaffRole = Exclude<UserRole, "CUSTOMER" | "STORE_MANAGER">

export type StaffProfile = UserProfile

export type StaffQuery = UsersQuery

export const STAFF_ROLES: readonly StaffRole[] = [
  "CASHIER",
  "ACCOUNTANT",
  "WAREHOUSE_WORKER",
] as const

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  CASHIER: "كاشير",
  ACCOUNTANT: "محاسب",
  WAREHOUSE_WORKER: "عامل مستودع",
}

export function isStaffRole(role: UserRole): role is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(role)
}

export function formatStaffRole(role: UserRole) {
  if (isStaffRole(role)) {
    return STAFF_ROLE_LABELS[role]
  }

  return role
}

export function normalizeStaffProfiles(
  response?: PaginatedResponse<StaffProfile> | StaffProfile[]
) {
  return normalizeUsers(
    response as PaginatedResponse<UserProfile> | UserProfile[]
  ) as StaffProfile[]
}

export function getStaffProfiles(params?: StaffQuery) {
  return apiRequest<PaginatedResponse<StaffProfile> | StaffProfile[]>(
    `/user${buildQuery(params)}`
  )
}

export async function getStaffById(id: number) {
  if (!isValidId(id)) {
    throw new Error("Invalid staff id")
  }

  const response = await getStaffProfiles()
  const staff = normalizeStaffProfiles(response).find((user) => user.id === id)

  if (!staff) {
    throw new Error("Staff member not found")
  }

  return staff
}

export function createStaff(data: CreateStaffPayload) {
  return apiRequest<StaffProfile>("/user/staff", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function updateStaffProfile(
  id: number,
  data: UpdateStaffProfilePayload
) {
  if (!isValidId(id)) {
    throw new Error("Invalid staff id")
  }

  return apiRequest<StaffProfile>(`/user/staff/profile/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export function deleteStaff(id: number) {
  if (!isValidId(id)) {
    throw new Error("Invalid staff id")
  }

  return apiRequest<{ message: string }>(`/user/delete/${id}`, {
    method: "DELETE",
  })
}
