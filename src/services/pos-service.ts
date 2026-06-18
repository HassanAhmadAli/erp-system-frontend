import { apiRequest, buildQuery } from "@/api/client"

export type PosProduct = {
  id: number
  name: string
  barcode?: string
  sellingPrice: number | string
  quantityInStock: number
  categoryId?: number
  supplierId?: number
}

export type ProductsResponse = {
  data: PosProduct[]
  total?: number
  limit?: number
  offset?: number
  isFinalPage?: boolean
}

export type SaleInvoiceItem = {
  productId: number
  quantity: number
}

export type CreateSaleInvoicePayload = {
  customerId: number
  discountId: number | null
  amountPaid: number
  items: SaleInvoiceItem[]
  complete: boolean
}

export type SaleInvoice = {
  id: number
  customerId: number
  discountId: number | null
  amountPaid: number | string
  subtotal?: number | string
  discountAmount?: number | string
  total?: number | string
  status?: string
  createdAt?: string
  items?: unknown[]
}

export function normalizePosProducts(
  response?: ProductsResponse | PosProduct[] | null
): PosProduct[] {
  if (!response) return []

  if (Array.isArray(response)) return response

  return response.data ?? []
}

export async function getPosProducts() {
  return apiRequest<ProductsResponse | PosProduct[]>(
    `/product${buildQuery({ limit: 100 })}`
  )
}

export async function createSaleInvoice(payload: CreateSaleInvoicePayload) {
  return apiRequest<SaleInvoice>("/sales/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
