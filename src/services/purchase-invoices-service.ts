import { apiRequest, buildQuery, type PaginatedResponse } from "@/api/client"
import {
  normalizePaginatedResponse,
  toPaginationQuery,
  type PaginationParams,
} from "@/lib/pagination"
import { isValidId } from "@/validation/helpers"
import {
  PURCHASE_INVOICE_STATUS_OPTIONS,
  isPurchaseInvoiceStatus,
  type PurchaseInvoiceItemPayload,
  type PurchaseInvoicePayload,
  type PurchaseInvoiceStatus,
} from "@/validation/purchase-invoice-schema"

export const PURCHASE_INVOICES_ENDPOINT = "/purchase/invoices"

export { PURCHASE_INVOICE_STATUS_OPTIONS }
export type { PurchaseInvoiceStatus }

export type PurchaseInvoiceItem = {
  id?: number
  productId: number
  quantity: number
  unitCost?: string | number
  unitPrice?: string | number
  totalCost?: string | number
  totalPrice?: string | number
  expiryDate?: string | null
  product?: {
    id: number
    name?: string
    title?: string
    purchasePrice?: string | number
    costPrice?: string | number
    buyingPrice?: string | number
    price?: string | number
  }
}

export type PurchaseInvoice = {
  id: number
  supplierId?: number
  accountantId?: number
  warehouseWorkerId?: number
  status?: PurchaseInvoiceStatus | string
  invoiceDate?: string
  createdAt?: string
  updatedAt?: string
  receive?: boolean
  received?: boolean
  total?: string | number
  totalAmount?: string | number
  finalAmount?: string | number
  subtotal?: string | number
  amountPaid?: string | number
  remainingAmount?: string | number
  supplier?: {
    id: number
    name?: string
    companyName?: string
    fullName?: string
    fullNameAr?: string | null
    user?: {
      fullName?: string
      email?: string
      phoneNumber?: string
    }
  }
  items?: PurchaseInvoiceItem[]
}

export type PurchaseInvoicesResponse =
  | PurchaseInvoice[]
  | {
      data: PurchaseInvoice[]
      total?: number
      limit?: number
      offset?: number
      isFinalPage?: boolean
    }

export type CreatePurchaseInvoiceItem = PurchaseInvoiceItemPayload
export type CreatePurchaseInvoicePayload = PurchaseInvoicePayload

export type PurchaseInvoicesQuery = PaginationParams & {
  status?: PurchaseInvoiceStatus
  supplierId?: number
  from?: string
  to?: string
}

export function normalizePurchaseInvoices(response?: PurchaseInvoicesResponse) {
  if (!response) return []

  if (Array.isArray(response)) {
    return response
  }

  return response.data ?? []
}

export function normalizePurchaseInvoicesList(
  response?: PurchaseInvoicesResponse | null,
  fallbackLimit = 10,
  fallbackOffset = 0
): PaginatedResponse<PurchaseInvoice> {
  return normalizePaginatedResponse(response, fallbackLimit, fallbackOffset)
}

export async function getPurchaseInvoices(params?: PurchaseInvoicesQuery) {
  const pagination = toPaginationQuery(params)

  return apiRequest<PurchaseInvoicesResponse>(
    `${PURCHASE_INVOICES_ENDPOINT}${buildQuery({
      ...pagination,
      status: params?.status,
      supplierId: params?.supplierId,
      from: params?.from,
      to: params?.to,
    })}`
  )
}

export async function getPurchaseInvoice(id: number) {
  if (!isValidId(id)) {
    throw new Error("Invalid purchase invoice id")
  }

  return apiRequest<PurchaseInvoice>(`${PURCHASE_INVOICES_ENDPOINT}/${id}`)
}

export async function createPurchaseInvoice(
  payload: CreatePurchaseInvoicePayload
) {
  return apiRequest<PurchaseInvoice>(PURCHASE_INVOICES_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

const LIST_ALL_PAGE_SIZE = 100
const LIST_ALL_MAX_PAGES = 50

export async function listAllPurchaseInvoices(
  params?: Omit<PurchaseInvoicesQuery, "page" | "limit" | "offset">
) {
  const invoices: PurchaseInvoice[] = []
  let offset = 0

  for (let page = 0; page < LIST_ALL_MAX_PAGES; page += 1) {
    const response = await getPurchaseInvoices({
      ...params,
      limit: LIST_ALL_PAGE_SIZE,
      offset,
    })
    const list = normalizePurchaseInvoicesList(
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

export async function updatePurchaseInvoiceStatus(
  id: number,
  status: PurchaseInvoiceStatus
) {
  if (!isValidId(id)) {
    throw new Error("Invalid purchase invoice id")
  }

  if (!isPurchaseInvoiceStatus(status)) {
    throw new Error("Invalid purchase invoice status")
  }

  return apiRequest<PurchaseInvoice>(
    `${PURCHASE_INVOICES_ENDPOINT}/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  )
}
