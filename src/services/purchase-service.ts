import { apiRequest, type PaginatedResponse } from "@/api/client"

export type PurchaseInvoiceStatus =
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED"

export type PurchaseInvoiceItem = {
  id?: number
  productId: number
  quantity: number
  unitCost: number | string
  subtotal?: number | string
  expiryDate?: string | null
  product?: {
    id: number
    name: string
    barcode?: string
  }
}

export type PurchaseInvoice = {
  id: number
  supplierId: number
  accountantId?: number
  invoiceDate: string
  status: PurchaseInvoiceStatus
  total?: number | string
  items?: PurchaseInvoiceItem[]
  supplier?: {
    id: number
    fullName: string
    email?: string
    phone?: string
  }
  createdAt?: string
}

export type CreatePurchaseInvoiceInput = {
  supplierId: number
  invoiceDate: string
  items: {
    productId: number
    quantity: number
    unitCost: number
    expiryDate?: string
  }[]
  receive: boolean
}

export function getPurchaseInvoices() {
  return apiRequest<PaginatedResponse<PurchaseInvoice> | PurchaseInvoice[]>(
    "/purchase/invoices"
  )
}

export function getPurchaseInvoiceById(id: number) {
  return apiRequest<PurchaseInvoice>(`/purchase/invoices/${id}`)
}

export function createPurchaseInvoice(data: CreatePurchaseInvoiceInput) {
  return apiRequest<PurchaseInvoice>("/purchase/invoices", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      invoiceDate: new Date(data.invoiceDate).toISOString(),
      items: data.items.map((item) => ({
        ...item,
        expiryDate: item.expiryDate
          ? new Date(item.expiryDate).toISOString()
          : undefined,
      })),
    }),
  })
}

export function updatePurchaseInvoiceStatus(
  id: number,
  status: PurchaseInvoiceStatus
) {
  return apiRequest<PurchaseInvoice>(`/purchase/invoices/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}
