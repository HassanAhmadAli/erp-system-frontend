import { apiRequest } from "@/api/client"

export const PURCHASE_INVOICES_ENDPOINT = "/purchase/invoices"

export const PURCHASE_INVOICE_STATUS_OPTIONS = [
  "PENDING",
  "RECEIVED",
  "COMPLETED",
  "CANCELLED",
] as const

export type PurchaseInvoiceStatus =
  (typeof PURCHASE_INVOICE_STATUS_OPTIONS)[number]

export type PurchaseInvoiceItem = {
  id?: number
  productId: number
  quantity: number
  unitCost?: string | number
  unitPrice?: string | number
  totalCost?: string | number
  totalPrice?: string | number
  expiryDate?: string
  product?: {
    id: number
    name?: string
    title?: string
  }
}

export type PurchaseInvoice = {
  id: number
  supplierId?: number
  status?: PurchaseInvoiceStatus | string
  invoiceDate?: string
  createdAt?: string
  updatedAt?: string
  receive?: boolean
  received?: boolean
  totalAmount?: string | number
  finalAmount?: string | number
  subtotal?: string | number
  supplier?: {
    id: number
    name?: string
    companyName?: string
    fullName?: string
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

export type CreatePurchaseInvoiceItem = {
  productId: number
  quantity: number
  unitCost: number
  expiryDate: string
}

export type CreatePurchaseInvoicePayload = {
  supplierId: number
  invoiceDate: string
  items: CreatePurchaseInvoiceItem[]
  receive: boolean
}

export function normalizePurchaseInvoices(response?: PurchaseInvoicesResponse) {
  if (!response) return []

  if (Array.isArray(response)) {
    return response
  }

  return response.data ?? []
}

export async function getPurchaseInvoices() {
  return apiRequest<PurchaseInvoicesResponse>(PURCHASE_INVOICES_ENDPOINT)
}

export async function getPurchaseInvoice(id: number) {
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

export async function updatePurchaseInvoiceStatus(
  id: number,
  status: PurchaseInvoiceStatus
) {
  return apiRequest<PurchaseInvoice>(
    `${PURCHASE_INVOICES_ENDPOINT}/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  )
}
