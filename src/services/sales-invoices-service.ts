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

export type SalesInvoicesQuery = PaginationParams & {
  status?: SalesInvoiceStatus
  cashierId?: number
  from?: string
  to?: string
}

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
  const pagination = toPaginationQuery(params)

  return apiRequest<SalesInvoicesResponse>(
    `${SALES_INVOICES_ENDPOINT}${buildQuery({
      ...pagination,
      status: params?.status,
      cashierId: params?.cashierId,
      from: params?.from,
      to: params?.to,
    })}`
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

const LIST_ALL_PAGE_SIZE = 100
const LIST_ALL_MAX_PAGES = 50

export async function listAllSalesInvoices(
  params?: Omit<SalesInvoicesQuery, "page" | "limit" | "offset">
) {
  const invoices: SalesInvoice[] = []
  let offset = 0

  for (let page = 0; page < LIST_ALL_MAX_PAGES; page += 1) {
    const response = await getSalesInvoices({
      ...params,
      limit: LIST_ALL_PAGE_SIZE,
      offset,
    })
    const list = normalizeSalesInvoicesList(
      response,
      LIST_ALL_PAGE_SIZE,
      offset
    )

    invoices.push(...list.data)

    if (list.isFinalPage || list.data.length === 0) {
      break
    }

    offset += LIST_ALL_PAGE_SIZE
  }

  return invoices
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
