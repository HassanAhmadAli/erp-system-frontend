// import { apiRequest } from "@/api/client"

// export type Supplier = {
//   id: number
//   fullName: string
//   phone: string
//   email: string
//   address: string

//   _count?: {
//     products: number
//     purchaseInvoices: number
//   }
// }

// export type SupplierListResponse = {
//   data: Supplier[]
//   total: number
//   limit: number
//   offset: number
//   isFinalPage: boolean
// }

// export function getSuppliers() {
//   return apiRequest<SupplierListResponse>("/supplier")
// }

// export function createSupplier(data: {
//   fullName: string
//   phone: string
//   email: string
//   address: string
// }) {
//   return apiRequest<Supplier>("/supplier", {
//     method: "POST",
//     body: JSON.stringify(data),
//   })
// }

import { apiRequest } from "@/api/client"

export type Supplier = {
  id: number
  fullName: string
  phone: string
  email: string
  address: string

  products?: unknown[]
  purchaseInvoices?: unknown[]

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

/* GET ALL */
export function getSuppliers() {
  return apiRequest<SupplierListResponse>("/supplier")
}

/* CREATE */
export function createSupplier(data: {
  fullName: string
  phone: string
  email: string
  address: string
}) {
  return apiRequest<Supplier>("/supplier", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/* GET BY ID */
export function getSupplierById(id: number) {
  return apiRequest<Supplier>(`/supplier/${id}`)
}

/* UPDATE */
export function updateSupplier(
  id: number,
  data: {
    fullName: string
    phone: string
    email: string
    address: string
  }
) {
  return apiRequest<Supplier>(`/supplier/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

/* DELETE */
export function deleteSupplier(id: number) {
  return apiRequest<{ message: string }>(`/supplier/${id}`, {
    method: "DELETE",
  })
}
