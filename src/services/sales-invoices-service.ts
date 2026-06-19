import { apiRequest } from "@/api/client"

export const SALES_INVOICES_ENDPOINT = "/sales/invoices"

export const SALES_INVOICE_STATUS_OPTIONS = [
  "PENDING",
  "COMPLETED",
  "REFUNDED",
] as const

export type SalesInvoiceStatus = (typeof SALES_INVOICE_STATUS_OPTIONS)[number]

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

export type CreateSalesInvoiceItem = {
  productId: number
  quantity: number
}

export type CreateSalesInvoicePayload = {
  customerId: number
  discountId: number | null
  amountPaid: number
  items: CreateSalesInvoiceItem[]
  complete: boolean
}

export function normalizeSalesInvoices(response?: SalesInvoicesResponse) {
  if (!response) return []

  if (Array.isArray(response)) {
    return response
  }

  return response.data ?? []
}

export async function getSalesInvoices() {
  return apiRequest<SalesInvoicesResponse>(SALES_INVOICES_ENDPOINT)
}

export async function getSalesInvoice(id: number) {
  return apiRequest<SalesInvoice>(`${SALES_INVOICES_ENDPOINT}/${id}`)
}

export async function createSalesInvoice(payload: CreateSalesInvoicePayload) {
  return apiRequest<SalesInvoice>(SALES_INVOICES_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateSalesInvoiceStatus(
  id: number,
  status: SalesInvoiceStatus
) {
  return apiRequest<SalesInvoice>(`${SALES_INVOICES_ENDPOINT}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}
