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
import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"

export const SALES_INVOICE_STATUS_KEYS: Record<string, string> = {
  PENDING: "statuses.pending",
  COMPLETED: "statuses.completed",
  REFUNDED: "statuses.refunded",
  CANCELLED: "statuses.cancelled",
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

export function getSalesInvoiceStatusLabel(status: string, t: TFunction) {
  const safeStatus = normalizeSalesInvoiceStatus(status)
  const key = SALES_INVOICE_STATUS_KEYS[safeStatus]
  return key ? t(`common:${key}`) : safeStatus
}

export function formatNumber(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "—"

  return formatGlobalNumber(value)
}

export function formatMoney(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "—"

  return formatCurrency(value)
}

export function formatDate(value?: string | Date | null) {
  return formatDateTime(value)
}

export function getCustomerName(invoice: SalesInvoice, t: TFunction) {
  return (
    invoice.customer?.user?.fullName ||
    invoice.customer?.user?.email ||
    t("common:customerFallback", {
      id: formatId(invoice.customerId ?? "—"),
    })
  )
}

export function getInvoiceTotal(invoice: SalesInvoice) {
  return (
    invoice.finalAmount ??
    invoice.totalAmount ??
    invoice.total ??
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
  const currentStatus = normalizeSalesInvoiceStatus(status)

  if (currentStatus === "PENDING") return ["COMPLETED", "CANCELLED"]
  if (currentStatus === "COMPLETED") return ["REFUNDED"]

  return []
}

export function normalizeSalesInvoiceStatus(status?: string | null) {
  return String(status ?? "PENDING")
    .trim()
    .toUpperCase()
}

export function NumberText({ value }: { value: string | number }) {
  return (
    <span dir="ltr" className="inline-block tabular-nums">
      {toEnglishDigits(value)}
    </span>
  )
}

export function SalesInvoiceStatusBadge({ status }: { status?: string }) {
  const { t } = useTranslation("common")
  const safeStatus = normalizeSalesInvoiceStatus(status)

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1",
        salesInvoiceStatusStyles[safeStatus] ??
          "bg-slate-500/10 text-slate-700 ring-slate-500/20 dark:text-slate-300"
      )}
    >
      {getSalesInvoiceStatusLabel(safeStatus, t)}
    </span>
  )
}
