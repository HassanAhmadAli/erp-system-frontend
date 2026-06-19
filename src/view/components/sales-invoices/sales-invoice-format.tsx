import { cn } from "@/lib/utils"
import type {
  SalesInvoice,
  SalesInvoiceItem,
  SalesInvoiceStatus,
} from "@/services/sales-invoices-service"
import {
  formatCurrency,
  formatDateTime,
  formatId,
  formatNumber as formatGlobalNumber,
  toEnglishDigits,
} from "@/utils/number-formatters"

export const salesInvoiceStatusLabels: Record<string, string> = {
  PENDING: "قيد الانتظار",
  COMPLETED: "مكتملة",
  REFUNDED: "مستردة",
  CANCELLED: "ملغاة",
}

const salesInvoiceStatusStyles: Record<string, string> = {
  PENDING:
    "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300",
  COMPLETED:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300",
  REFUNDED:
    "bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300",
  CANCELLED:
    "bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300",
}

export function formatNumber(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "—"

  return formatGlobalNumber(value)
}

export function formatMoney(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "—"

  return formatCurrency(value)
}

/**
 * Used by the sales invoice table/details.
 * It uses the global date-time formatter, which displays dates in English
 * and automatically converts to the user's local browser/PC timezone.
 */
export function formatDate(value?: string | Date | null) {
  return formatDateTime(value)
}

export function getCustomerName(invoice: SalesInvoice) {
  return (
    invoice.customer?.user?.fullName ||
    invoice.customer?.user?.email ||
    `عميل #${formatId(invoice.customerId ?? "—")}`
  )
}

export function getInvoiceTotal(invoice: SalesInvoice) {
  return (
    invoice.finalAmount ??
    invoice.totalAmount ??
    invoice.subtotal ??
    invoice.amountPaid ??
    null
  )
}

export function getItemTotal(item: SalesInvoiceItem) {
  if (item.totalPrice !== undefined && item.totalPrice !== null) {
    return item.totalPrice
  }

  const unitPrice = Number(
    item.unitPrice ?? item.product?.sellingPrice ?? item.product?.price
  )
  const quantity = Number(item.quantity)

  if (Number.isNaN(unitPrice) || Number.isNaN(quantity)) {
    return null
  }

  return unitPrice * quantity
}

export function getNextSalesInvoiceStatusOptions(
  status?: string
): SalesInvoiceStatus[] {
  const currentStatus = String(status ?? "PENDING").toUpperCase()

  if (currentStatus === "PENDING") return ["COMPLETED"]
  if (currentStatus === "COMPLETED") return ["REFUNDED"]

  return []
}

export function NumberText({ value }: { value: string | number }) {
  return (
    <span dir="ltr" className="inline-block tabular-nums">
      {toEnglishDigits(value)}
    </span>
  )
}

export function SalesInvoiceStatusBadge({ status }: { status?: string }) {
  const safeStatus = String(status ?? "PENDING").toUpperCase()

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1",
        salesInvoiceStatusStyles[safeStatus] ??
          "bg-slate-500/10 text-slate-700 ring-slate-500/20 dark:text-slate-300"
      )}
    >
      {salesInvoiceStatusLabels[safeStatus] ?? safeStatus}
    </span>
  )
}