import { apiRequest, buildQuery } from "@/api/client"

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
  return apiRequest<Customer>(`/customer/${id}`)
}

export async function updateCustomerStatus(id: number, status: string) {
  return apiRequest<Customer>(`/customer/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}

export async function updateCustomerLoyalty(id: number, loyaltyPoints: number) {
  return apiRequest<Customer>(`/customer/${id}/loyalty`, {
    method: "PATCH",
    body: JSON.stringify({ loyaltyPoints }),
  })
}
