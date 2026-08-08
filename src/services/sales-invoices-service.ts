import { apiRequest, buildQuery, type PaginatedResponse } from "@/api/client"
import {
  normalizePaginatedResponse,
  toPaginationQuery,
  type PaginationParams,
} from "@/lib/pagination"
import {
  SALES_INVOICE_STATUS_OPTIONS,
  isSalesInvoiceStatus,
  type SalesInvoiceItemPayload,
  type SalesInvoicePayload,
  type SalesInvoiceStatus,
} from "@/validation/sales-invoice-schema"
import { isValidId } from "@/validation/helpers"

export const SALES_INVOICES_ENDPOINT = "/sales/invoices"

export { SALES_INVOICE_STATUS_OPTIONS }
export type { SalesInvoiceStatus }

export type SalesInvoiceItem = {
  id?: number
  productId: number
  quantity: number
  unitPrice?: string | number
  totalPrice?: string | number
  product?: {
    id: number
    name?: string
    title?: string
    sellingPrice?: string | number
    price?: string | number
  }
}

export type SalesInvoice = {
  id: number
  customerId?: number
  discountId?: number | null
  appliedDiscountId?: number | null
  cashierId?: number
  status: SalesInvoiceStatus | string
  amountPaid?: string | number
  totalAmount?: string | number
  finalAmount?: string | number
  total?: string | number
  subtotal?: string | number
  discountAmount?: string | number
  remainingAmount?: string | number
  createdAt?: string
  updatedAt?: string
  customer?: {
    id: number
    user?: {
      id?: number
      fullName?: string
      email?: string
      phoneNumber?: string
    }
  }
  cashier?: {
    id?: number
    user?: {
      id?: number
      fullName?: string
      email?: string
    }
  }
  discount?: {
    id: number
    name?: string
    title?: string
    value?: string | number
    type?: string
  } | null
  appliedDiscount?: {
    id: number
    name?: string
  } | null
  items?: SalesInvoiceItem[]
}

export type SalesInvoicesResponse =
  | SalesInvoice[]
  | {
      data: SalesInvoice[]
      total?: number
      limit?: number
      offset?: number
      isFinalPage?: boolean
    }

export type CreateSalesInvoiceItem = SalesInvoiceItemPayload

export type CreateSalesInvoicePayload = SalesInvoicePayload

export type SalesInvoicesQuery = PaginationParams

export function normalizeSalesInvoices(response?: unknown): SalesInvoice[] {
  if (!response) return []

  if (Array.isArray(response)) {
    return response as SalesInvoice[]
  }

  if (typeof response !== "object") {
    return []
  }

  const data = (response as { data?: unknown }).data

  if (Array.isArray(data)) {
    return data as SalesInvoice[]
  }

  if (data && typeof data === "object") {
    const nestedData = (data as { data?: unknown }).data

    if (Array.isArray(nestedData)) {
      return nestedData as SalesInvoice[]
    }
  }

  return []
}

export function normalizeSalesInvoicesList(
  response?: unknown,
  fallbackLimit = 10,
  fallbackOffset = 0
): PaginatedResponse<SalesInvoice> {
  return normalizePaginatedResponse(
    {
      data: normalizeSalesInvoices(response),
      total: (response as { total?: number } | null)?.total,
      limit: (response as { limit?: number } | null)?.limit,
      offset: (response as { offset?: number } | null)?.offset,
      isFinalPage: (response as { isFinalPage?: boolean } | null)?.isFinalPage,
    } as PaginatedResponse<SalesInvoice>,
    fallbackLimit,
    fallbackOffset
  )
}

export async function getSalesInvoices(
  params?: SalesInvoicesQuery
): Promise<SalesInvoicesResponse> {
  const query = toPaginationQuery(params)
  return apiRequest<SalesInvoicesResponse>(
    `${SALES_INVOICES_ENDPOINT}${buildQuery(query)}`
  )
}

export async function getSalesInvoice(id: number): Promise<SalesInvoice> {
  if (!isValidId(id)) {
    throw new Error("Invalid sales invoice id")
  }

  return apiRequest<SalesInvoice>(`${SALES_INVOICES_ENDPOINT}/${id}`)
}

export async function createSalesInvoice(
  payload: CreateSalesInvoicePayload
): Promise<SalesInvoice> {
  return apiRequest<SalesInvoice>(SALES_INVOICES_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateSalesInvoiceStatus(
  id: number,
  status: SalesInvoiceStatus
): Promise<SalesInvoice> {
  if (!isValidId(id)) {
    throw new Error("Invalid sales invoice id")
  }

  if (!isSalesInvoiceStatus(status)) {
    throw new Error("Invalid sales invoice status")
  }

  return apiRequest<SalesInvoice>(`${SALES_INVOICES_ENDPOINT}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}
