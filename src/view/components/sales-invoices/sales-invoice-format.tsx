import { cn } from "@/lib/utils"
import type {
  SalesInvoice,
  SalesInvoiceItem,
  SalesInvoiceStatus,
} from "@/services/sales-invoices-service"

export const salesInvoiceStatusLabels: Record<string, string> = {
  PENDING: "قيد الانتظار",
  COMPLETED: "مكتملة",
  REFUNDED: "مستردة",
  CANCELLED: "ملغاة",
}

const salesInvoiceStatusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REFUNDED: "bg-rose-50 text-rose-700 ring-rose-200",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
}

export function formatNumber(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "—"

  const numberValue = Number(value)

  if (Number.isNaN(numberValue)) {
    return String(value)
  }

  return numberValue.toLocaleString("en-US")
}

export function formatMoney(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "—"

  return `${formatNumber(value)} SYP`
}

export function formatDate(value?: string) {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return new Intl.DateTimeFormat("ar-SY-u-nu-latn", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function getCustomerName(invoice: SalesInvoice) {
  return (
    invoice.customer?.user?.fullName ||
    invoice.customer?.user?.email ||
    `عميل #${invoice.customerId ?? "—"}`
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
      {value}
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
          "bg-slate-50 text-slate-700 ring-slate-200"
      )}
    >
      {salesInvoiceStatusLabels[safeStatus] ?? safeStatus}
    </span>
  )
}