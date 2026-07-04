import { apiRequest } from "@/api/client"
import type { CategoryRequestPayload } from "@/validation/category-schema"
import { isValidId, normalizeText, optionalText } from "@/validation/helpers"

export type Category = {
  id: number
  name: string
  description?: string
  _count?: { products: number }
}

export type CategoryListResponse = {
  data: Category[]
  total: number
  limit?: number
  offset?: number
  isFinalPage?: boolean
}

export type CreateCategoryInput = {
  name: string
  description?: string
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>

function normalizeCategoryResponse(
  response: CategoryListResponse | Category[]
): CategoryListResponse {
  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length,
      limit: response.length,
      offset: 0,
      isFinalPage: true,
    }
  }

  return response
}

function cleanCategoryPayload<T extends UpdateCategoryInput>(data: T) {
  const payload: UpdateCategoryInput = {}

  if (data.name != null) {
    payload.name = normalizeText(data.name)
  }

  const description = optionalText(data.description)
  if (description) {
    payload.description = description
  }

  return payload as T extends CreateCategoryInput
    ? CategoryRequestPayload
    : UpdateCategoryInput
}

export async function getCategories(params?: {
  search?: string
  page?: number
  limit?: number
}) {
  const query = new URLSearchParams()

  if (params?.search) query.append("search", params.search)
  if (params?.page) query.append("page", String(params.page))
  if (params?.limit) query.append("limit", String(params.limit))

  const qs = query.toString()
  const endpoint = qs ? `/category?${qs}` : "/category"
  const response = await apiRequest<CategoryListResponse | Category[]>(endpoint)
  return normalizeCategoryResponse(response)
}

export function createCategory(data: CreateCategoryInput) {
  return apiRequest("/category", {
    method: "POST",
    body: JSON.stringify(cleanCategoryPayload(data)),
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
  if (!isValidId(id)) {
    throw new Error("Invalid category id")
  }

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
  if (!isValidId(id)) {
    throw new Error("Invalid category id")
  }

  return apiRequest<CategoryDetails>(`/category/${id}`)
}

//UPDATE
export function updateCategory(id: number, data: UpdateCategoryInput) {
  if (!isValidId(id)) {
    throw new Error("Invalid category id")
  }

  return apiRequest(`/category/${id}`, {
    method: "PATCH",
    body: JSON.stringify(cleanCategoryPayload(data)),
  })
}
