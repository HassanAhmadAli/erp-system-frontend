import { apiRequest } from "@/api/client"
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

export type CreatePurchaseInvoiceItem = PurchaseInvoiceItemPayload
export type CreatePurchaseInvoicePayload = PurchaseInvoicePayload

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