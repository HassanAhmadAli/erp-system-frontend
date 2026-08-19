import { apiRequest } from "@/api/client"
import { toPaginationQuery } from "@/lib/pagination"
import {
  discountFormValuesToPayload,
  discountScopeSchema,
  discountTypeSchema,
  type DiscountFormValues,
  type DiscountRequestPayload,
  type DiscountScope,
  type DiscountType,
} from "@/validation/discount-schema"
import {
  isValidId,
  optionalPositiveIntegerOrNull,
  requirePositiveInteger,
  requirePositiveNumber,
} from "@/validation/helpers"

export type { DiscountScope, DiscountType }

export type Discount = {
  id: number
  name: string
  nameAr?: string | null
  type: DiscountType
  value: string
  scope: DiscountScope

  categoryId?: number | null
  productId?: number | null

  maxInvoiceValue: string | number | null
  maxUses: number | null
  usedCount: number

  startDate: string
  endDate: string | null

  isActive: boolean

  createdById?: number
  createdAt?: string

  createdBy?: {
    id: number
    fullName: string
    fullNameAr?: string | null
  }
}

export type DiscountsResponse = {
  data: Discount[]
  total: number
  limit: number
  offset: number
  isFinalPage: boolean
}

export type DeleteDiscountResponse = {
  message: string
}

export type BestDiscountParams = {
  subtotal: number
  categoryId?: number
  productId?: number
}

export type CalculateDiscountParams = {
  discountId: number
  subtotal: number
  categoryId?: number
  productId?: number
}

export type BestDiscountResponse = Discount | null

export type CalculateDiscountResponse = {
  discountAmount?: number
  finalAmount?: number
  subtotal?: number
  discount?: Discount
} & Record<string, unknown>

export type GetDiscountsParams = {
  page?: number
  limit?: number
  offset?: number
  search?: string
  type?: DiscountType
  scope?: DiscountScope
}

export type CreateDiscountInput = DiscountFormValues
export type UpdateDiscountInput = DiscountFormValues

function isDiscountType(value: unknown): value is DiscountType {
  return discountTypeSchema.safeParse(value).success
}

function isDiscountScope(value: unknown): value is DiscountScope {
  return discountScopeSchema.safeParse(value).success
}

function buildDiscountQuery(params?: GetDiscountsParams) {
  const { limit, offset, search } = toPaginationQuery(params)
  const query = new URLSearchParams()

  query.append("limit", String(limit))
  query.append("offset", String(offset))

  if (search) {
    query.append("search", search)
  }

  // type/scope are not supported by the backend list endpoint;
  // callers should filter those client-side when needed.

  return `?${query.toString()}`
}

function normalizeBestDiscountPayload(params: BestDiscountParams) {
  const subtotal = requirePositiveNumber(params.subtotal, "subtotal")
  const categoryId = optionalPositiveIntegerOrNull(params.categoryId)
  const productId = optionalPositiveIntegerOrNull(params.productId)

  return {
    subtotal,
    ...(categoryId ? { categoryId } : {}),
    ...(productId ? { productId } : {}),
  }
}

function normalizeCalculateDiscountPayload(params: CalculateDiscountParams) {
  const discountId = requirePositiveInteger(params.discountId, "discountId")
  const subtotal = requirePositiveNumber(params.subtotal, "subtotal")
  const categoryId = optionalPositiveIntegerOrNull(params.categoryId)
  const productId = optionalPositiveIntegerOrNull(params.productId)

  return {
    discountId,
    subtotal,
    ...(categoryId ? { categoryId } : {}),
    ...(productId ? { productId } : {}),
  }
}

export function getDiscounts(params?: GetDiscountsParams) {
  return apiRequest<DiscountsResponse>(`/discount${buildDiscountQuery(params)}`)
}

export function getActiveDiscounts() {
  return apiRequest<DiscountsResponse>("/discount/active")
}

export function getDiscountById(id: number) {
  if (!isValidId(id)) {
    throw new Error("Invalid discount id")
  }

  return apiRequest<Discount>(`/discount/${id}`)
}

export function getBestDiscount(params: BestDiscountParams) {
  return apiRequest<BestDiscountResponse>("/discount/best", {
    method: "POST",
    body: JSON.stringify(normalizeBestDiscountPayload(params)),
  })
}

export function calculateDiscount(params: CalculateDiscountParams) {
  return apiRequest<CalculateDiscountResponse>("/discount/calculate", {
    method: "POST",
    body: JSON.stringify(normalizeCalculateDiscountPayload(params)),
  })
}

export function toggleDiscount(id: number, isActive: boolean) {
  if (!isValidId(id)) {
    throw new Error("Invalid discount id")
  }

  return apiRequest<Discount>(`/discount/${id}/toggle`, {
    method: "PATCH",
    body: JSON.stringify({
      isActive,
    }),
  })
}

export function deleteDiscount(id: number) {
  if (!isValidId(id)) {
    throw new Error("Invalid discount id")
  }

  return apiRequest<DeleteDiscountResponse>(`/discount/${id}`, {
    method: "DELETE",
  })
}

export function createDiscount(data: CreateDiscountInput) {
  const payload: DiscountRequestPayload = discountFormValuesToPayload(data)

  return apiRequest<Discount>("/discount", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateDiscount(id: number, data: UpdateDiscountInput) {
  if (!isValidId(id)) {
    throw new Error("Invalid discount id")
  }

  const payload: DiscountRequestPayload = discountFormValuesToPayload(data)

  return apiRequest<Discount>(`/discount/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}
