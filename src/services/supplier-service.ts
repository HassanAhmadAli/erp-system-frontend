import { apiRequest, buildQuery, type PaginatedResponse } from "@/api/client"
import {
  normalizePaginatedResponse,
  toPaginationQuery,
  type PaginationParams,
} from "@/lib/pagination"
import type { SupplierRequestPayload } from "@/validation/supplier-schema"
import { isValidId } from "@/validation/helpers"

export type Supplier = {
  id: number
  fullName: string
  fullNameAr?: string | null
  phone: string
  email: string
  address: string
  addressAr?: string | null

  products?: { id: number; name?: string; nameAr?: string | null }[]
  purchaseInvoices?: { id: number }[]

  _count?: {
    products: number
    purchaseInvoices: number
  }
}

export type SupplierListResponse = PaginatedResponse<Supplier> | Supplier[]

export type CreateSupplierInput = SupplierRequestPayload
export type UpdateSupplierInput = SupplierRequestPayload
export type SuppliersQuery = PaginationParams

export function getSuppliers(params?: SuppliersQuery) {
  const query = toPaginationQuery(params ?? { limit: 100 })
  return apiRequest<SupplierListResponse>(`/supplier${buildQuery(query)}`)
}

export function normalizeSuppliers(
  response: SupplierListResponse | null | undefined,
  fallbackLimit = 10,
  fallbackOffset = 0
) {
  return normalizePaginatedResponse(response, fallbackLimit, fallbackOffset)
}

export function createSupplier(data: CreateSupplierInput) {
  return apiRequest<Supplier>("/supplier", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function getSupplierById(id: number) {
  if (!isValidId(id)) {
    throw new Error("Invalid supplier id")
  }

  return apiRequest<Supplier>(`/supplier/${id}`)
}

export function updateSupplier(id: number, data: UpdateSupplierInput) {
  if (!isValidId(id)) {
    throw new Error("Invalid supplier id")
  }

  return apiRequest<Supplier>(`/supplier/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export function deleteSupplier(id: number) {
  if (!isValidId(id)) {
    throw new Error("Invalid supplier id")
  }

  return apiRequest<{ message: string }>(`/supplier/${id}`, {
    method: "DELETE",
  })
}
