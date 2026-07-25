import { cn } from "@/lib/utils"
import type {
  PurchaseInvoice,
  PurchaseInvoiceItem,
} from "@/services/purchase-invoices-service"
import {
  formatCurrency,
  formatDateTime,
  formatId,
  formatNumber as formatGlobalNumber,
  toEnglishDigits,
} from "@/utils/number-formatters"

export const purchaseInvoiceStatusLabels: Record<string, string> = {
  PENDING: "معلقة",
  COMPLETED: "مكتملة",
  CANCELLED: "ملغاة",
  REFUNDED: "مستردة",
}

const purchaseInvoiceStatusStyles: Record<string, string> = {
  PENDING:
    "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300",
  COMPLETED:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300",
  CANCELLED:
    "bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300",
  REFUNDED:
    "bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:bg-sky-500/15 dark:text-sky-300",
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
 * Uses the global formatter.
 * Because formatDateTime does not pass a fixed timeZone,
 * the browser automatically displays the time using the local PC timezone.
 */
export function formatDate(value?: string | Date | null) {
  return formatDateTime(value)
}

export function getTodayDateTimeInputValue() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const localDate = new Date(now.getTime() - offset * 60 * 1000)

  return localDate.toISOString().slice(0, 16)
}

export function getNextYearDateInputValue() {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)

  return date.toISOString().slice(0, 10)
}

export function getSupplierName(invoice: PurchaseInvoice) {
  return (
    invoice.supplier?.name ||
    invoice.supplier?.companyName ||
    invoice.supplier?.user?.fullName ||
    invoice.supplier?.user?.email ||
    `مورد #${formatId(invoice.supplierId ?? "—")}`
  )
}

export function getInvoiceTotal(invoice: PurchaseInvoice) {
  return invoice.finalAmount ?? invoice.totalAmount ?? invoice.subtotal ?? null
}

export function getItemTotal(item: PurchaseInvoiceItem) {
  if (item.totalCost !== undefined && item.totalCost !== null) {
    return item.totalCost
  }

  if (item.totalPrice !== undefined && item.totalPrice !== null) {
    return item.totalPrice
  }

  const unitCost = Number(item.unitCost ?? item.unitPrice)
  const quantity = Number(item.quantity)

  if (Number.isNaN(unitCost) || Number.isNaN(quantity)) {
    return null
  }

  return unitCost * quantity
}

export function NumberText({ value }: { value: string | number }) {
  return (
    <span dir="ltr" className="inline-block tabular-nums">
      {toEnglishDigits(value)}
    </span>
  )
}

export function PurchaseInvoiceStatusBadge({ status }: { status?: string }) {
  const safeStatus = String(status ?? "PENDING").toUpperCase()

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1",
        purchaseInvoiceStatusStyles[safeStatus] ??
          "bg-slate-500/10 text-slate-700 ring-slate-500/20 dark:text-slate-300"
      )}
    >
      {purchaseInvoiceStatusLabels[safeStatus] ?? safeStatus}
    </span>
  )
}
