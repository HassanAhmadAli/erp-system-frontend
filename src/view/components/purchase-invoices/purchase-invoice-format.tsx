import { cn } from "@/lib/utils"
import type {
  PurchaseInvoice,
  PurchaseInvoiceItem,
} from "@/services/purchase-invoices-service"

export const purchaseInvoiceStatusLabels: Record<string, string> = {
  PENDING: "قيد الانتظار",
  RECEIVED: "مستلمة",
  COMPLETED: "مكتملة",
  CANCELLED: "ملغاة",
}

const purchaseInvoiceStatusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  RECEIVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
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
    `مورد #${invoice.supplierId ?? "—"}`
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
      {value}
    </span>
  )
}

export function PurchaseInvoiceStatusBadge({ status }: { status?: string }) {
  const safeStatus = status ?? "PENDING"

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1",
        purchaseInvoiceStatusStyles[safeStatus] ??
          "bg-slate-50 text-slate-700 ring-slate-200"
      )}
    >
      {purchaseInvoiceStatusLabels[safeStatus] ?? safeStatus}
    </span>
  )
}
