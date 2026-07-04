import { apiRequest, buildQuery } from "@/api/client"
import {
  customerFormValuesToPayload,
  customerSchema,
  isCustomerStatus,
  type CustomerRequestPayload,
  type CustomerStatus,
} from "@/validation/customer-schema"
import { isValidId } from "@/validation/helpers"

export type CustomerUser = {
  id: number
  fullName: string
  email: string
  phoneNumber: string
  isActive: boolean
}

export type Customer = {
  id: number
  userId: number
  address?: string
  loyaltyPoints: number
  totalSpent: string
  user: CustomerUser
}

export type CustomersResponse = {
  data: Customer[]
  total: number
  limit: number
  offset: number
  isFinalPage: boolean
}

export type CustomersQuery = {
  limit?: number
  offset?: number
}

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

export async function getCustomers(params?: CustomersQuery) {
  return apiRequest<CustomersResponse>(`/customer${buildQuery(params)}`)
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
    body: JSON.stringify({ status }),
  })
}

export async function updateCustomerLoyalty(id: number, loyaltyPoints: number) {
  if (!isValidId(id)) {
    throw new Error("Invalid customer id")
  }

  const validationResult = customerSchema.safeParse({ loyaltyPoints })
  if (!validationResult.success) {
    throw new Error("Invalid customer loyalty points")
  }

  const payload = customerFormValuesToPayload(validationResult.data)
  if (payload.loyaltyPoints == null) {
    throw new Error("Invalid customer loyalty points")
  }

  return apiRequest<Customer>(`/customer/${id}/loyalty`, {
    method: "PATCH",
    body: JSON.stringify({ loyaltyPoints: payload.loyaltyPoints }),
  })
}
