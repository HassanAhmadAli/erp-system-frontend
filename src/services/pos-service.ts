import { apiRequest, buildQuery } from "@/api/client"
import { unwrapData } from "@/lib/report-parsers"
import { isValidId } from "@/validation/helpers"
import type {
  PosCheckoutItemPayload,
  PosCheckoutPayload,
} from "@/validation/pos-schema"

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

export type SaleInvoiceItem = PosCheckoutItemPayload

export type CreateSaleInvoicePayload = PosCheckoutPayload

export type SaleInvoice = {
  id: number
  customerId?: number
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
  const response = await apiRequest<unknown>("/sales/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  const invoice = getCreatedSaleInvoice(response)

  if (!invoice) {
    throw new Error("Invalid sales invoice response")
  }

  return invoice
}

export function getCreatedSaleInvoice(response: unknown): SaleInvoice | null {
  const invoice = unwrapData(response)

  if (!invoice || typeof invoice !== "object") {
    return null
  }

  const id = Number((invoice as { id?: unknown }).id)

  if (!isValidId(id)) {
    return null
  }

  return invoice as SaleInvoice
}

export function getCreatedSaleInvoiceId(response: unknown): number | null {
  return getCreatedSaleInvoice(response)?.id ?? null
}
