import { apiRequest, apiRequestBlob, buildQuery } from "@/api/client"
import {
  asTrimmedText,
  resolveMediaUrl,
  resolveStoredFileUrl,
} from "@/lib/media-url"
import {
  normalizePaginatedResponse,
  toPaginationQuery,
  type PaginationParams,
} from "@/lib/pagination"

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
  if (photo.id != null && photo.id !== "") return true
  if (typeof photo.storedFileId === "string" && photo.storedFileId.trim()) {
    return true
  }
  if (photo.storedFile && typeof photo.storedFile === "object") {
    const storedId = (photo.storedFile as { id?: unknown }).id
    return typeof storedId === "string" && storedId.trim().length > 0
  }
  return typeof photo.url === "string" && photo.url.trim().length > 0
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

  if (
    record.data &&
    typeof record.data === "object" &&
    !Array.isArray(record.data)
  ) {
    return asProductPhotoArray(record.data)
  }

  if (isProductPhotoLike(record)) {
    return [record]
  }

  return []
}

function hydrateProductPhoto(photo: ProductPhoto): ProductPhoto {
  const storedFileId =
    asTrimmedText(photo.storedFileId) || asTrimmedText(photo.storedFile?.id)
  if (!storedFileId) return photo
  if (photo.url?.includes("/product-photo/download/")) {
    return { ...photo, storedFileId }
  }

  return {
    ...photo,
    storedFileId,
    url: `/product-photo/download/${storedFileId}`,
  }
}

export function normalizeProductPhotos(response: unknown): ProductPhoto[] {
  return asProductPhotoArray(response)
    .filter((photo) => !photo.deletedAt)
    .map(hydrateProductPhoto)
}

export function isPersistedProductPhoto(photo: ProductPhoto) {
  const id = Number(photo.id)
  return Number.isSafeInteger(id) && id > 0
}

export function photoFromProductImageUrl(
  imageUrl?: string | null
): ProductPhoto | null {
  const trimmed = asTrimmedText(imageUrl)
  if (!trimmed) return null

  const storedFileId =
    trimmed.match(/product-photo\/download\/([^/?#]+)/i)?.[1] ??
    (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      trimmed
    )
      ? trimmed
      : undefined)
  const url = storedFileId ? `/product-photo/download/${storedFileId}` : trimmed
  const fileName = trimmed.split("/").filter(Boolean).pop() ?? null

  return {
    id: 0,
    storedFileId,
    url,
    fileName,
  }
}

export function resolveProductPhotos(
  listed: ProductPhoto[] | undefined,
  fallbackPhotos?: ProductPhoto[] | null,
  imageUrl?: string | null
): ProductPhoto[] {
  if (listed?.length) return listed

  if (listed === undefined) {
    const nested = normalizeProductPhotos(fallbackPhotos)
    if (nested.length) return nested
  }

  const fromImage = photoFromProductImageUrl(imageUrl)
  return fromImage ? [fromImage] : []
}

/**
 * Builds an absolute URL for a product's primary image.
 * Backend stores relative paths like `/product-photo/download/{storedFileId}` on `product.imageUrl`.
 */
export function getProductImageSrc(
  imageUrl?: string | null,
  storedFileId?: string | null
) {
  return (
    resolveStoredFileUrl("/product-photo/download", storedFileId) ??
    resolveMediaUrl(imageUrl)
  )
}

export function getProductPhotoStoredFileId(photo: ProductPhoto) {
  return (
    asTrimmedText(photo.storedFileId) ||
    asTrimmedText(photo.storedFile?.id) ||
    null
  )
}

export function getProductStoredFileId(
  imageUrl?: string | null,
  photos?: ProductPhoto[] | null
) {
  const fromImage = photoFromProductImageUrl(imageUrl)?.storedFileId ?? null
  const listed = [...(photos ?? [])].sort(
    (left, right) => Number(right.id) - Number(left.id)
  )
  const listedIds = listed
    .map((photo) => getProductPhotoStoredFileId(photo))
    .filter((id): id is string => Boolean(id))

  if (fromImage && listedIds.includes(fromImage)) return fromImage
  if (listedIds[0]) return listedIds[0]
  return fromImage
}

export function getProductPhotoFileName(photo: ProductPhoto) {
  return (
    asTrimmedText(photo.storedFile?.originalname) ||
    asTrimmedText(photo.fileName) ||
    null
  )
}

/**
 * Builds an absolute URL for a product photo.
 * Download endpoint is public and keyed by storedFileId (UUID), not photo id.
 */
export function getProductPhotoSrc(photo: ProductPhoto) {
  return (
    resolveStoredFileUrl(
      "/product-photo/download",
      getProductPhotoStoredFileId(photo)
    ) ?? resolveMediaUrl(photo.url)
  )
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

export async function uploadProductPhoto(
  productId: number,
  file: File
): Promise<ProductPhoto | { message?: string }> {
  const formData = new FormData()
  formData.append("file", file)

  const uploaded = await apiRequest<ProductPhoto | { message?: string }>(
    `/product-photo/upload/${productId}`,
    {
      method: "POST",
      body: formData,
    }
  )

  return uploaded ?? { message: "Uploaded" }
}

export async function listProductPhotos(productId: number) {
  // This endpoint is JSON, so apiRequest is fine.
  return apiRequest<ProductPhotoListResponse>(
    `/product-photo/product/${productId}`
  )
}

export async function deleteProductImage(productId: number) {
  if (!Number.isSafeInteger(productId) || productId <= 0) {
    throw new Error("Invalid product id")
  }

  return apiRequest<{ message: string }>(
    `/product-photo/product/${productId}`,
    {
      method: "DELETE",
    }
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
  return apiRequestBlob(
    `/product-photo/download/${encodeURIComponent(storedFileId)}`
  )
}

export async function importProducts(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  return apiRequest<ImportJob | Record<string, never>>("/product/import", {
    method: "POST",
    body: formData,
  })
}

export async function getProductImportJobs() {
  return apiRequest<ImportJobListResponse>("/product/import/jobs")
}

export async function getProductImportJob(jobId: number | string) {
  return apiRequest<ImportJob>(`/product/import/${jobId}`)
}
