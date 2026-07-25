import { apiRequest } from "@/api/client"
import type { SupplierRequestPayload } from "@/validation/supplier-schema"
import { isValidId } from "@/validation/helpers"

export type Supplier = {
  id: number
  fullName: string
  phone: string
  email: string
  address: string

  products?: { id: number; name?: string }[]
  purchaseInvoices?: { id: number }[]

  _count?: {
    products: number
    purchaseInvoices: number
  }
}

export type SupplierListResponse = {
  data: Supplier[]
  total: number
  limit: number
  offset: number
  isFinalPage: boolean
}

export type CreateSupplierInput = SupplierRequestPayload
export type UpdateSupplierInput = SupplierRequestPayload

export function getSuppliers() {
  return apiRequest<SupplierListResponse>("/supplier")
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
