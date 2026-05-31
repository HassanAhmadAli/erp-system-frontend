import { apiRequest } from "@/api/client"

export type Category = {
  id: number
  name: string
  description?: string
  _count?: { products: number }
}

export type CategoryListResponse = {
  data: Category[]
  total: number
}

export function getCategories(params?: {
  search?: string
  page?: number
  limit?: number
}) {
  const query = new URLSearchParams()

  if (params?.search) query.append("search", params.search)
  if (params?.page) query.append("page", String(params.page))
  if (params?.limit) query.append("limit", String(params.limit))

  return apiRequest<CategoryListResponse>(`/category?${query.toString()}`)
}

export function createCategory(data: { name: string; description?: string }) {
  return apiRequest("/category", {
    method: "POST",
    body: JSON.stringify(data),
  })
}
//  ver  ONE

// export function updateCategory(
//   id: number,
//   data: { name?: string; description?: string }
// ) {
//   return apiRequest(`/category/${id}`, {
//     method: "PATCH",
//     body: JSON.stringify(data),
//   })
// }

export function deleteCategory(id: number) {
  return apiRequest(`/category/${id}`, {
    method: "DELETE",
  })
}

export type CategoryDetails = {
  id: number
  name: string
  description?: string
  products: {
    id: number
    name: string
    barcode: string
    sellingPrice: string
    quantityInStock: number
  }[]
  _count: {
    products: number
  }
}

// GET ONE
export function getCategoryById(id: number) {
  return apiRequest<CategoryDetails>(`/category/${id}`)
}

//UPDATE
export function updateCategory(
  id: number,
  data: { name?: string; description?: string }
) {
  return apiRequest(`/category/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}
