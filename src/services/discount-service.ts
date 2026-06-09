import { apiRequest } from "@/api/client"

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT"

export type DiscountScope = "GLOBAL" | "CATEGORY" | "PRODUCT" | "CUSTOMER"

export type Discount = {
  id: number
  name: string
  type: DiscountType
  value: string
  scope: DiscountScope

  maxInvoiceValue: string | null
  maxUses: number | null
  usedCount: number

  startDate: string
  endDate: string | null

  isActive: boolean

  createdById: number
  createdAt: string

  createdBy?: {
    id: number
    fullName: string
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

/* ========================================
   BEST DISCOUNT + CALCULATE TYPES
======================================== */

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

// The backend may return the matched discount (or null when none applies).
export type BestDiscountResponse = Discount | null

// Shape is backend-defined; we keep the common fields optional and permissive.
export type CalculateDiscountResponse = {
  discountAmount?: number
  finalAmount?: number
  subtotal?: number
  discount?: Discount
} & Record<string, unknown>

export type GetDiscountsParams = {
  page?: number
  limit?: number
  search?: string
  type?: DiscountType
  scope?: DiscountScope
}

/* ========================================
   GET ALL DISCOUNTS
======================================== */

export function getDiscounts(params?: GetDiscountsParams) {
  const query = new URLSearchParams()

  if (params?.page != null) {
    query.append("page", String(params.page))
  }

  if (params?.limit != null) {
    query.append("limit", String(params.limit))
  }

  if (params?.search) {
    query.append("search", params.search)
  }

  if (params?.type) {
    query.append("type", params.type)
  }

  if (params?.scope) {
    query.append("scope", params.scope)
  }

  const endpoint = query.toString()
    ? `/discount?${query.toString()}`
    : "/discount"

  return apiRequest<DiscountsResponse>(endpoint)
}

/* ========================================
   GET ACTIVE DISCOUNTS
======================================== */

export function getActiveDiscounts() {
  return apiRequest<DiscountsResponse>("/discount/active")
}

/* ========================================
   GET DISCOUNT BY ID
======================================== */

export function getDiscountById(id: number) {
  return apiRequest<Discount>(`/discount/${id}`)
}

/* ========================================
   GET BEST DISCOUNT  (POST /discount/best)
======================================== */

export function getBestDiscount(params: BestDiscountParams) {
  const payload: Record<string, number> = {
    subtotal: Number(params.subtotal),
  }

  if (params.categoryId != null) payload.categoryId = Number(params.categoryId)
  if (params.productId != null) payload.productId = Number(params.productId)

  return apiRequest<BestDiscountResponse>("/discount/best", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

/* ========================================
   CALCULATE DISCOUNT  (POST /discount/calculate)
======================================== */

export function calculateDiscount(params: CalculateDiscountParams) {
  const payload: Record<string, number> = {
    discountId: Number(params.discountId),
    subtotal: Number(params.subtotal),
  }

  if (params.categoryId != null) payload.categoryId = Number(params.categoryId)
  if (params.productId != null) payload.productId = Number(params.productId)

  return apiRequest<CalculateDiscountResponse>("/discount/calculate", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

/* ========================================
   TOGGLE DISCOUNT
======================================== */

// export function toggleDiscount(
//   id: number,
//   isActive: boolean
// ) {
//   return apiRequest<Discount>(
//     `/discount/${id}/toggle`,
//     {
//       method: "PATCH",
//       body: JSON.stringify({
//         isActive,
//       }),
//     }
//   )
// }
export function toggleDiscount(id: number, isActive: boolean) {
  return apiRequest(`/discount/${id}/toggle`, {
    method: "PATCH",
    body: JSON.stringify({
      isActive,
    }),
  })
}
/* ========================================
   DELETE DISCOUNT
======================================== */

// export function deleteDiscount(id: number) {
//   return apiRequest<DeleteDiscountResponse>(
//     `/discount/${id}`,
//     {
//       method: "DELETE",
//     }
//   )
// }

export function deleteDiscount(id: number) {
  return apiRequest<{ message: string }>(`/discount/${id}`, {
    method: "DELETE",
  })
}

// create discount
// export function createDiscount(data: any) {
//   return apiRequest("/discount", {
//     method: "POST",
//     body: JSON.stringify(data),
//   })
// }

// export function createDiscount(data: any) {
//   const payload = {
//     name: data.name,
//     type: data.type,
//     scope: data.scope,
//     value: String(data.value),

//     maxInvoiceValue: data.maxInvoiceValue ? Number(data.maxInvoiceValue) : null,
//     maxUses: data.maxUses ? Number(data.maxUses) : null,

//     startDate: new Date(data.startDate).toISOString(),
//     endDate: data.endDate ? new Date(data.endDate).toISOString() : null,

//     isActive: data.isActive ?? true,
//   }

//   return apiRequest("/discount", {
//     method: "POST",
//     body: JSON.stringify(payload),
//   })
// }

// export function updateDiscount(
//   id: number,
//   data: any
// ) {
//   return apiRequest(`/discount/${id}`, {
//     method: "PATCH",
//     body: JSON.stringify(data),
//   })
// }

// export function updateDiscount(id: number, data: any) {
//   return apiRequest(`/discount/${id}`, {
//     method: "PATCH",
//     body: JSON.stringify({
//       name: data.name,
//       type: data.type,
//       scope: data.scope,

//       value: String(data.value),

//       maxInvoiceValue: data.maxInvoiceValue
//         ? String(data.maxInvoiceValue)
//         : "0",

//       maxUses: data.maxUses
//         ? Number(data.maxUses)
//         : null,

//       startDate: new Date(data.startDate).toISOString(),

//       endDate: data.endDate
//         ? new Date(data.endDate).toISOString()
//         : null,

//       isActive: data.isActive ?? true,
//     }),
//   })
// }

/////////////////////////////////////////////////

// import { apiRequest } from "@/api/client"

export function createDiscount(data: any) {
  const payload = normalizeDiscount(data)

  return apiRequest("/discount", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateDiscount(id: number, data: any) {
  const payload = normalizeDiscount(data)

  return apiRequest(`/discount/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

/* =========================
   NORMALIZER (IMPORTANT)
========================= */

function normalizeDiscount(data: any) {
  const payload: Record<string, unknown> = {
    name: data.name,
    type: data.type,
    scope: data.scope,
    value: String(data.value),

    maxInvoiceValue:
      data.maxInvoiceValue !== undefined && data.maxInvoiceValue !== ""
        ? Number(data.maxInvoiceValue)
        : null,

    maxUses:
      data.maxUses !== undefined && data.maxUses !== ""
        ? Number(data.maxUses)
        : null,

    startDate: new Date(data.startDate).toISOString(),

    endDate: data.endDate ? new Date(data.endDate).toISOString() : null,

    isActive: data.isActive ?? true,
  }

  // Scope-specific targets: CATEGORY needs categoryId, PRODUCT needs productId.
  if (data.scope === "CATEGORY" && data.categoryId) {
    payload.categoryId = Number(data.categoryId)
  }

  if (data.scope === "PRODUCT" && data.productId) {
    payload.productId = Number(data.productId)
  }

  return payload
}
