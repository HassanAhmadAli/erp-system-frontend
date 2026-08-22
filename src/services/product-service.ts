import { apiRequest, BASE_URL, buildQuery } from "@/api/client"
import {
  normalizePaginatedResponse,
  toPaginationQuery,
  type PaginationParams,
} from "@/lib/pagination"
import { getAccessToken } from "@/utils/auth-storage"

export type ProductPhoto = {
  id: number
  productId?: number
  storedFileId?: string
  storedFile?: {
    id: string
    originalname?: string
    mimetype?: string
    path?: string
    size?: number
  } | null
  /** Legacy/compat fields some responses may include */
  url?: string | null
  fileName?: string | null
  deletedAt?: string | null
}

export type Product = {
  id: number
  name: string
  nameAr?: string | null
  description?: string | null
  descriptionAr?: string | null
  barcode: string
  purchasePrice?: number | string
  sellingPrice?: number | string
  quantityInStock?: number
  minQuantity?: number
  categoryId?: number
  supplierId?: number
  imageUrl?: string | null
  productPhotos?: ProductPhoto[] | null
  createdAt?: string
  updatedAt?: string

  // Some backend responses may include nested objects; we keep it optional.
  category?: {
    id: number
    name: string
    nameAr?: string | null
    description?: string | null
    descriptionAr?: string | null
  } | null
  supplier?: {
    id: number
    fullName: string
    fullNameAr?: string | null
    phone?: string
    email?: string
    address?: string
    addressAr?: string | null
  } | null
}

export type ProductListResponse =
  | {
      data: Product[]
      total?: number
      limit?: number
      offset?: number
      isFinalPage?: boolean
    }
  | Product[]

export type ProductsQuery = PaginationParams

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
  nameAr?: string
  description?: string
  descriptionAr?: string
  barcode: string
  purchasePrice: number
  sellingPrice: number
  quantityInStock: number
  minQuantity: number
  categoryId: number
  supplierId: number
}

export type UpdateProductInput = Partial<CreateProductInput>

export type UpdateStockInput = {
  quantityInStock: number
}

function asArray<T>(response: unknown): T[] {
  if (!response) return []
  if (Array.isArray(response)) return response as T[]

  const maybe = response as { data?: unknown }

  if (Array.isArray(maybe.data)) return maybe.data as T[]

  return []
}

export function normalizeProducts(response: unknown): Product[] {
  return asArray<Product>(response)
}

export function normalizeProductList(
  response: unknown,
  fallbackLimit = 10,
  fallbackOffset = 0
) {
  return normalizePaginatedResponse(
    response as ProductListResponse,
    fallbackLimit,
    fallbackOffset
  )
}

function isProductPhotoLike(value: unknown): value is ProductPhoto {
  if (!value || typeof value !== "object") return false

  const photo = value as Record<string, unknown>
  return typeof photo.id === "number" || typeof photo.id === "string"
}

function asProductPhotoArray(response: unknown): ProductPhoto[] {
  if (!response) return []
  if (Array.isArray(response)) {
    return response.filter(isProductPhotoLike)
  }

  if (typeof response !== "object") return []

  const record = response as Record<string, unknown>
  const nestedKeys = ["data", "productPhotos", "photos", "items", "rows"]

  for (const key of nestedKeys) {
    const value = record[key]
    if (Array.isArray(value)) {
      return value.filter(isProductPhotoLike)
    }
  }

  if (isProductPhotoLike(record)) {
    return [record]
  }

  return []
}

export function normalizeProductPhotos(response: unknown): ProductPhoto[] {
  return asProductPhotoArray(response).filter((photo) => !photo.deletedAt)
}

export function isPersistedProductPhoto(photo: ProductPhoto) {
  return Number.isSafeInteger(photo.id) && photo.id > 0
}

export function photoFromProductImageUrl(
  imageUrl?: string | null
): ProductPhoto | null {
  if (!imageUrl?.trim()) return null

  const trimmed = imageUrl.trim()
  const storedFileId =
    trimmed.match(/product-photo\/download\/([^/?#]+)/i)?.[1] ?? undefined
  const fileName = trimmed.split("/").filter(Boolean).pop() ?? null

  return {
    id: 0,
    storedFileId,
    url: trimmed,
    fileName,
  }
}

export function resolveProductPhotos(
  listed: ProductPhoto[] | undefined,
  fallbackPhotos?: ProductPhoto[] | null,
  imageUrl?: string | null
): ProductPhoto[] {
  if (listed?.length) return listed

  const nested = normalizeProductPhotos(fallbackPhotos)
  if (nested.length) return nested

  const fromImage = photoFromProductImageUrl(imageUrl)
  return fromImage ? [fromImage] : []
}

/**
 * Builds an absolute URL for a product's primary image.
 * Backend stores relative paths like `/product-photo/download/{storedFileId}` on `product.imageUrl`.
 */
export function getProductImageSrc(imageUrl?: string | null) {
  if (!imageUrl?.trim()) return null

  const trimmed = imageUrl.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith("/")) return `${BASE_URL}${trimmed}`
  return `${BASE_URL}/${trimmed}`
}

export function getProductPhotoStoredFileId(photo: ProductPhoto) {
  const fromField = photo.storedFileId?.trim()
  if (fromField) return fromField

  const fromNested = photo.storedFile?.id?.trim()
  if (fromNested) return fromNested

  return null
}

export function getProductPhotoFileName(photo: ProductPhoto) {
  return (
    photo.storedFile?.originalname?.trim() || photo.fileName?.trim() || null
  )
}

/**
 * Builds an absolute URL for a product photo.
 * Download endpoint is public and keyed by storedFileId (UUID), not photo id.
 */
export function getProductPhotoSrc(photo: ProductPhoto) {
  if (photo.url?.trim()) {
    const trimmed = photo.url.trim()
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    if (trimmed.startsWith("/")) return `${BASE_URL}${trimmed}`
    return `${BASE_URL}/${trimmed}`
  }

  const storedFileId = getProductPhotoStoredFileId(photo)
  if (storedFileId) {
    return `${BASE_URL}/product-photo/download/${storedFileId}`
  }

  return null
}

export function normalizeImportJobs(response: unknown): ImportJob[] {
  return asArray<ImportJob>(response)
}

export function getProducts(params?: ProductsQuery) {
  const query = toPaginationQuery(params)
  return apiRequest<ProductListResponse>(`/product${buildQuery(query)}`)
}

export function getProductsByCategory(
  categoryId: number,
  params?: ProductsQuery
) {
  const query = toPaginationQuery(params)
  return apiRequest<ProductListResponse>(
    `/product/category/${categoryId}${buildQuery(query)}`
  )
}

export function getProductsBySupplier(
  supplierId: number,
  params?: ProductsQuery
) {
  const query = toPaginationQuery(params)
  return apiRequest<ProductListResponse>(
    `/product/supplier/${supplierId}${buildQuery(query)}`
  )
}

export function getLowStockProducts(params?: ProductsQuery) {
  const query = toPaginationQuery(params)
  return apiRequest<ProductListResponse>(
    `/product/low-stock${buildQuery(query)}`
  )
}

export function getProductById(id: number) {
  return apiRequest<Product>(`/product/${id}`)
}

export function createProduct(data: CreateProductInput) {
  return apiRequest<Product>("/product", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function updateProduct(id: number, data: UpdateProductInput) {
  return apiRequest<Product>(`/product/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export function updateProductStock(id: number, data: UpdateStockInput) {
  return apiRequest<Product>(`/product/${id}/stock`, {
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

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

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

  if (!bodyText) {
    return { message: "Uploaded" }
  }

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

// Returns a Blob so the UI can trigger a download.
// Backend download is public and expects storedFileId (UUID), not photo id.
export async function downloadProductPhoto(storedFileId: string) {
  const response = await fetch(
    `${BASE_URL}/product-photo/download/${storedFileId}`,
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
  return apiRequest<ImportJobListResponse>("/product/import/jobs")
}

export async function getProductImportJob(jobId: number | string) {
  return apiRequest<ImportJob>(`/product/import/${jobId}`)
}
