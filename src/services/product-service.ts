import { apiRequest } from "@/api/client"
import { getAccessToken } from "@/utils/auth-storage"

export type Product = {
  id: number
  name: string
  description?: string | null
  barcode: string
  purchasePrice?: number | string
  sellingPrice?: number | string
  quantityInStock?: number
  minQuantity?: number
  categoryId?: number
  supplierId?: number
  imageUrl?: string | null
  createdAt?: string
  updatedAt?: string

  // Some backend responses may include nested objects; we keep it optional.
  category?: { id: number; name: string; description?: string | null } | null
  supplier?: {
    id: number
    fullName: string
    phone?: string
    email?: string
    address?: string
  } | null
}

export type ProductListResponse =
  | {
      data: Product[]
      total?: number
    }
  | Product[]

export type ProductPhoto = {
  id: number | string
  // Backend might return fileName or url; keep optional.
  url?: string
  fileName?: string
}

export type ProductPhotoListResponse =
  | {
      data: ProductPhoto[]
      total?: number
    }
  | ProductPhoto[]

export type ImportJob = {
  id: number | string
  status?: string
  createdAt?: string
  finishedAt?: string
  // Logs/results are backend-specific; keep optional.
  result?: unknown
  errors?: unknown
}

export type ImportJobListResponse =
  | {
      data: ImportJob[]
      total?: number
    }
  | ImportJob[]

export type CreateProductInput = {
  name: string
  barcode: string
  purchasePrice: number
  sellingPrice: number
  quantityInStock: number
  minQuantity: number
  categoryId: number
  supplierId: number
}

export type UpdateProductInput = Partial<
  Omit<CreateProductInput, "categoryId" | "supplierId"> & {
    categoryId?: number
    supplierId?: number
  }
> & {
  name?: string
  barcode?: string
  purchasePrice?: number
  sellingPrice?: number
  quantityInStock?: number
  minQuantity?: number
}

export type UpdateStockInput = {
  quantityInStock: number
}

function asArray<T>(response: unknown): T[] {
  if (!response) return []
  if (Array.isArray(response)) return response as T[]
  const maybe = response as any
  if (maybe?.data && Array.isArray(maybe.data)) return maybe.data as T[]
  return []
}

export function normalizeProducts(response: unknown): Product[] {
  return asArray<Product>(response)
}

export function normalizeProductPhotos(response: unknown): ProductPhoto[] {
  return asArray<ProductPhoto>(response)
}

export function normalizeImportJobs(response: unknown): ImportJob[] {
  return asArray<ImportJob>(response)
}

const BASE_URL = "http://localhost:3000"

export function getProducts() {
  return apiRequest<ProductListResponse>(`/product`)
}

export function getProductsByCategory(categoryId: number) {
  return apiRequest<ProductListResponse>(`/product/category/${categoryId}`)
}

export function getProductsBySupplier(supplierId: number) {
  return apiRequest<ProductListResponse>(`/product/supplier/${supplierId}`)
}

export function getLowStockProducts() {
  return apiRequest<ProductListResponse>(`/product/low-stock`)
}

export function getProductById(id: number) {
  return apiRequest<Product>(`/product/${id}`)
}

export function createProduct(data: CreateProductInput) {
  return apiRequest(`/product`, {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function updateProduct(id: number, data: UpdateProductInput) {
  return apiRequest(`/product/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export function updateProductStock(id: number, data: UpdateStockInput) {
  return apiRequest(`/product/${id}/stock`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export function deleteProduct(id: number) {
  return apiRequest<{ message: string }>(`/product/${id}`, {
    method: "DELETE",
  })
}

async function authorizedFetch(url: string, options: RequestInit) {
  const token = getAccessToken()
  const headers = new Headers(options.headers || {})
  if (token) headers.set("Authorization", `Bearer ${token}`)

  return fetch(url, {
    ...options,
    headers,
  })
}

// Multipart upload uses FormData; we intentionally do not reuse apiRequest here
// to avoid coupling to JSON Content-Type behavior.
export async function uploadProductPhoto(
  productId: number,
  file: File
): Promise<ProductPhoto | { message?: string }> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await authorizedFetch(
    `${BASE_URL}/product-photo/upload/${productId}`,
    {
      method: "POST",
      body: formData,
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Failed to upload photo (${response.status})`)
  }

  // Some backends may return the created photo object, or just a message.
  const bodyText = await response.text()
  if (!bodyText) return { message: "Uploaded" }

  try {
    return JSON.parse(bodyText)
  } catch {
    return { message: bodyText }
  }
}

export async function listProductPhotos(productId: number) {
  // This endpoint is JSON, so apiRequest is fine.
  return apiRequest<ProductPhotoListResponse>(
    `/product-photo/product/${productId}`
  )
}

export async function deleteProductPhoto(photoId: number | string) {
  return apiRequest<{ message: string }>(`/product-photo/${photoId}`, {
    method: "DELETE",
  })
}

// Returns a Blob so the UI can render a thumbnail or trigger a download.
export async function downloadProductPhoto(photoId: number | string) {
  const response = await authorizedFetch(
    `${BASE_URL}/product-photo/download/${photoId}`,
    { method: "GET" }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      errorText || `Failed to download photo (${response.status})`
    )
  }

  return response.blob()
}

export async function importProducts(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await authorizedFetch(`${BASE_URL}/product/import`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Import failed (${response.status})`)
  }

  // Backend likely returns JSON about the created job.
  return response.json().catch(() => ({}))
}

export async function getProductImportJobs() {
  return apiRequest<ImportJobListResponse>(`/product/import/jobs`)
}

export async function getProductImportJob(jobId: number | string) {
  return apiRequest<ImportJob>(`/product/import/${jobId}`)
}
