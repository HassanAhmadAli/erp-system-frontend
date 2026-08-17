import { apiRequest, buildQuery, type PaginatedResponse } from "@/api/client"
import {
  normalizePaginatedResponse,
  toPaginationQuery,
  type PaginationParams,
} from "@/lib/pagination"
import {
  isCustomerStatus,
  type CustomerRequestPayload,
  type CustomerStatus,
} from "@/validation/customer-schema"
import { isValidId } from "@/validation/helpers"

export type CustomerUser = {
  id: number
  fullName: string
  fullNameAr?: string | null
  email: string
  phoneNumber: string
  isActive: boolean
  language?: string
}

export type Customer = {
  id: number
  userId: number
  address?: string
  addressAr?: string | null
  loyaltyPoints: number
  totalSpent: string
  user: CustomerUser
}

export type CustomersResponse = PaginatedResponse<Customer>

export type CustomersQuery = PaginationParams

export type CreateCustomerInput = CustomerRequestPayload
export type UpdateCustomerInput = Partial<CustomerRequestPayload>
export type { CustomerStatus }

export function normalizeCustomers(
  response?: CustomersResponse | Customer[] | null
) {
  if (!response) return []

  if (Array.isArray(response)) return response

  return response.data ?? []
}

export function normalizeCustomersList(
  response?: CustomersResponse | Customer[] | null,
  fallbackLimit = 10,
  fallbackOffset = 0
) {
  return normalizePaginatedResponse(response, fallbackLimit, fallbackOffset)
}

export async function getCustomers(params?: CustomersQuery) {
  const query = toPaginationQuery(params)
  return apiRequest<CustomersResponse>(`/customer${buildQuery(query)}`)
}

export async function getCustomer(id: number) {
  if (!isValidId(id)) {
    throw new Error("Invalid customer id")
  }

  return apiRequest<Customer>(`/customer/${id}`)
}

export async function updateCustomerStatus(id: number, status: CustomerStatus) {
  if (!isValidId(id)) {
    throw new Error("Invalid customer id")
  }

  if (!isCustomerStatus(status)) {
    throw new Error("Invalid customer status")
  }

  return apiRequest<Customer>(`/customer/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      isActive: status === "active",
    }),
  })
}

function isValidLoyaltyPoints(value: number) {
  return Number.isSafeInteger(value) && value >= 0
}

export async function updateCustomerLoyalty(id: number, loyaltyPoints: number) {
  if (!isValidId(id)) {
    throw new Error("Invalid customer id")
  }

  if (!isValidLoyaltyPoints(loyaltyPoints)) {
    throw new Error("Invalid customer loyalty points")
  }

  return apiRequest<Customer>(`/customer/${id}/loyalty`, {
    method: "PATCH",
    body: JSON.stringify({
      points: loyaltyPoints,
    }),
  })
}
