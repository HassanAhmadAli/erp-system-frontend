import { apiRequest, type PaginatedResponse } from "@/api/client"

export type SalesInvoiceStatus =
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED"

export type SalesInvoiceItem = {
  id?: number
  productId: number
  quantity: number
  unitPrice: number | string
  discount?: number | string
  subtotal?: number | string
  product?: {
    id: number
    name: string
    barcode?: string
  }
}

export type SalesInvoice = {
  id: number
  status: SalesInvoiceStatus
  cashierId?: number
  customerId?: number | null
  subtotal?: number | string
  discountAmount?: number | string
  total?: number | string
  amountPaid?: number | string
  createdAt?: string
  items?: SalesInvoiceItem[]
  customer?: {
    id: number
    user?: { fullName?: string; email?: string }
  } | null
  cashier?: {
    id: number
    user?: { fullName?: string; email?: string }
  } | null
}

export function getSalesInvoices() {
  return apiRequest<PaginatedResponse<SalesInvoice> | SalesInvoice[]>(
    "/sales/invoices"
  )
}

export function getSalesInvoiceById(id: number) {
  return apiRequest<SalesInvoice>(`/sales/invoices/${id}`)
}

export function updateSalesInvoiceStatus(
  id: number,
  status: SalesInvoiceStatus
) {
  return apiRequest<SalesInvoice>(`/sales/invoices/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}
