import { apiRequest } from "@/api/client"
import type { CategoryRequestPayload } from "@/validation/category-schema"
import { isValidId, normalizeText, optionalText } from "@/validation/helpers"

export type Category = {
  id: number
  name: string
  description?: string | null
  _count?: { products: number }
}

export type CategoryListResponse = {
  data: Category[]
  total: number
  limit?: number
  offset?: number
  isFinalPage?: boolean
}

export type CreateCategoryInput = CategoryRequestPayload
export type UpdateCategoryInput = Partial<CategoryRequestPayload>

export type CategoriesQuery = {
  search?: string
  page?: number
  limit?: number
  offset?: number
  deleted?: boolean
}

export type CategoryDetails = {
  id: number
  name: string
  description?: string | null
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

function isPositiveSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
}

function buildCategoryQuery(params?: CategoriesQuery) {
  const query = new URLSearchParams()

  const search = optionalText(params?.search)
  if (search) {
    query.append("search", search)
  }

  if (isPositiveSafeInteger(params?.limit)) {
    query.append("limit", String(params.limit))
  }

  if (isNonNegativeSafeInteger(params?.offset)) {
    query.append("offset", String(params.offset))
  } else if (
    isPositiveSafeInteger(params?.page) &&
    isPositiveSafeInteger(params?.limit)
  ) {
    const offset = (params.page - 1) * params.limit
    query.append("offset", String(offset))
  }

  if (typeof params?.deleted === "boolean") {
    query.append("deleted", String(params.deleted))
  }

  const queryString = query.toString()

  return queryString ? `?${queryString}` : ""
}

function cleanCreateCategoryPayload(
  data: CreateCategoryInput
): CategoryRequestPayload {
  const description = optionalText(data.description)

  return {
    name: normalizeText(data.name),
    ...(description ? { description } : {}),
  }
}

function cleanUpdateCategoryPayload(data: UpdateCategoryInput) {
  const payload: UpdateCategoryInput = {}

  if (data.name != null) {
    payload.name = normalizeText(data.name)
  }

  if (data.description != null) {
    const description = optionalText(data.description)

    if (description) {
      payload.description = description
    }
  }

  return payload
}

export async function getCategories(params?: CategoriesQuery) {
  const response = await apiRequest<CategoryListResponse | Category[]>(
    `/category${buildCategoryQuery(params)}`
  )

  return normalizeCategoryResponse(response)
}

export function createCategory(data: CreateCategoryInput) {
  return apiRequest<Category>("/category", {
    method: "POST",
    body: JSON.stringify(cleanCreateCategoryPayload(data)),
  })
}

export function getCategoryById(id: number) {
  if (!isValidId(id)) {
    throw new Error("Invalid category id")
  }

  return apiRequest<CategoryDetails>(`/category/${id}`)
}

export function updateCategory(id: number, data: UpdateCategoryInput) {
  if (!isValidId(id)) {
    throw new Error("Invalid category id")
  }

  return apiRequest<Category>(`/category/${id}`, {
    method: "PATCH",
    body: JSON.stringify(cleanUpdateCategoryPayload(data)),
  })
}

export function deleteCategory(id: number) {
  if (!isValidId(id)) {
    throw new Error("Invalid category id")
  }

  return apiRequest<{ message: string }>(`/category/${id}`, {
    method: "DELETE",
  })
}