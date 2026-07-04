import { apiRequest } from "@/api/client"
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
  cashierId?: number
  status: SalesInvoiceStatus | string
  amountPaid?: string | number
  totalAmount?: string | number
  finalAmount?: string | number
  subtotal?: string | number
  discountAmount?: string | number
  remainingAmount?: string | number
  createdAt?: string
  updatedAt?: string
  customer?: {
    id: number
    user?: {
      fullName?: string
      email?: string
      phoneNumber?: string
    }
  }
  discount?: {
    id: number
    name?: string
    title?: string
    value?: string | number
    type?: string
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

export async function getSalesInvoices(): Promise<SalesInvoicesResponse> {
  return apiRequest<SalesInvoicesResponse>(SALES_INVOICES_ENDPOINT)
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
