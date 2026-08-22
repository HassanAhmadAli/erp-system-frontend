import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

import i18n from "@/i18n"
import { formatAuditRole } from "@/services/audit-log-service"
import {
  formatDateTime,
  formatId,
  formatNumber,
  formatPrice,
  toEnglishDigits,
} from "@/utils/number-formatters"
import { CustomerInfoCard } from "@/view/components/customers/customer-info-card"

const ISO_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?$/

const PRICE_KEY_PATTERN = /(price|amount|total|cost)$/i
const ID_KEY_PATTERN = /(^id$|Id$|_id$)/
const DATE_KEY_PATTERN = /(At$|Date$|^date$)/i
const URL_KEY_PATTERN = /(url|link|href|path)$/i

const COMMON_FIELD_KEYS: Record<string, string> = {
  id: "id",
  userId: "userId",
  customerId: "customerId",
  productId: "productId",
  supplierId: "supplierId",
  categoryId: "categoryId",
  entityId: "entityId",
  fullName: "fullName",
  fullNameAr: "fullNameAr",
  name: "name",
  nameAr: "nameAr",
  title: "title",
  titleAr: "titleAr",
  description: "description",
  descriptionAr: "descriptionAr",
  email: "email",
  phone: "phone",
  address: "address",
  addressAr: "addressAr",
  role: "role",
  status: "status",
  barcode: "barcode",
  amount: "amount",
  quantity: "quantity",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  startDate: "startDate",
  endDate: "endDate",
  notes: "notes",
  image: "image",
  supplier: "supplier",
  customer: "customer",
  product: "product",
  category: "category",
  type: "type",
  value: "value",
  scope: "scope",
  percentage: "percentage",
}

type AuditValueCardProps = {
  title: string
  value: unknown
}

export function AuditValueCard({ title, value }: AuditValueCardProps) {
  const { t } = useTranslation(["common", "pages"])
  const parsed = parseAuditValue(value)

  if (isEmptyAuditValue(parsed)) {
    return (
      <CustomerInfoCard title={title}>
        <p className="rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-6 text-center text-sm text-[var(--erp-muted)]">
          {t("none")}
        </p>
      </CustomerInfoCard>
    )
  }

  return (
    <CustomerInfoCard title={title}>
      <div className="erp-scrollbar max-h-[28rem] space-y-3 overflow-auto pe-1">
        <AuditValueTree value={parsed} depth={0} />
      </div>
    </CustomerInfoCard>
  )
}

function AuditValueTree({ value, depth }: { value: unknown; depth: number }) {
  if (isPlainObject(value)) {
    const entries = Object.entries(value)

    if (entries.length === 0) {
      return <PrimitiveValue value={null} />
    }

    return (
      <div className="space-y-3">
        {entries.map(([key, fieldValue]) => (
          <AuditField
            key={key}
            fieldKey={key}
            value={fieldValue}
            depth={depth}
          />
        ))}
      </div>
    )
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <PrimitiveValue value={null} />
    }

    return (
      <div className="space-y-3">
        {value.map((item, index) => (
          <AuditField
            key={index}
            fieldKey={String(index + 1)}
            value={item}
            depth={depth}
            labelOverride={`#${index + 1}`}
          />
        ))}
      </div>
    )
  }

  return (
    <PrimitiveValue value={formatPrimitive(value)} ltr={shouldUseLtr(value)} />
  )
}

function AuditField({
  fieldKey,
  value,
  depth,
  labelOverride,
}: {
  fieldKey: string
  value: unknown
  depth: number
  labelOverride?: string
}) {
  const { t } = useTranslation(["common", "pages"])
  const label = labelOverride ?? formatFieldLabel(fieldKey, t)
  const nested = isPlainObject(value) || Array.isArray(value)
  const parsedNested = nested ? parseAuditValue(value) : value

  if (nested && !isEmptyAuditValue(parsedNested) && depth < 4) {
    return (
      <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
        <p className="mb-3 text-sm text-[var(--erp-muted)]">{label}</p>
        <AuditValueTree value={parsedNested} depth={depth + 1} />
      </div>
    )
  }

  const formatted = formatFieldValue(fieldKey, parsedNested, t)

  return (
    <div className="flex flex-col gap-1 border-b border-[var(--erp-border)] pb-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="shrink-0 text-sm text-[var(--erp-muted)]">{label}</span>
      <span
        dir={
          shouldUseLtr(parsedNested) || looksLatin(formatted)
            ? "ltr"
            : undefined
        }
        className="text-sm font-medium break-all text-[var(--erp-text)] sm:text-end"
      >
        {formatted}
      </span>
    </div>
  )
}

function PrimitiveValue({
  value,
  ltr = false,
}: {
  value: ReactNode
  ltr?: boolean
}) {
  return (
    <p
      dir={ltr ? "ltr" : undefined}
      className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-3 text-sm font-medium break-all text-[var(--erp-text)]"
    >
      {value}
    </p>
  )
}

export function parseAuditValue(value: unknown): unknown {
  if (typeof value !== "string") return value

  const trimmed = value.trim()

  if (!trimmed) return null

  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      return JSON.parse(trimmed) as unknown
    } catch {
      return value
    }
  }

  return value
}

export function isEmptyAuditValue(value: unknown): boolean {
  if (value == null || value === "") return true
  if (Array.isArray(value)) return value.length === 0
  if (isPlainObject(value)) return Object.keys(value).length === 0
  return false
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function formatFieldLabel(
  key: string,
  t: ReturnType<typeof useTranslation>["t"]
) {
  const fieldKey = `auditLogs.fields.${key}`

  if (i18n.exists(fieldKey, { ns: "pages" })) {
    return t(`pages:${fieldKey}`)
  }

  const commonKey = COMMON_FIELD_KEYS[key]

  if (commonKey) {
    return t(`common:${commonKey}`)
  }

  return humanizeKey(key)
}

function formatFieldValue(
  key: string,
  value: unknown,
  t: ReturnType<typeof useTranslation>["t"]
): string {
  if (value == null || value === "") {
    return t("notAvailable")
  }

  if (typeof value === "string" && value === "[REDACTED]") {
    return t("pages:auditLogs.redacted")
  }

  if (typeof value === "boolean" || key === "isActive") {
    const boolValue =
      typeof value === "boolean"
        ? value
        : value === "true" || value === 1 || value === "1"

    if (key === "isActive") {
      return boolValue ? t("active") : t("inactive")
    }

    return boolValue ? t("yes") : t("no")
  }

  if (key === "role" && typeof value === "string") {
    return formatAuditRole(value)
  }

  if (DATE_KEY_PATTERN.test(key) || isIsoDateString(value)) {
    const formatted = formatDateTime(String(value))
    if (formatted !== "—") return formatted
  }

  if (PRICE_KEY_PATTERN.test(key) && isNumeric(value)) {
    return `${formatPrice(String(value))} SYP`
  }

  if (
    ID_KEY_PATTERN.test(key) &&
    (typeof value === "number" || typeof value === "string")
  ) {
    return formatId(value)
  }

  if (typeof value === "number") {
    return formatNumber(value)
  }

  if (typeof value === "string") {
    if (URL_KEY_PATTERN.test(key) || /^https?:\/\//i.test(value)) {
      return toEnglishDigits(value)
    }

    return toEnglishDigits(value)
  }

  if (Array.isArray(value) || isPlainObject(value)) {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }

  return toEnglishDigits(String(value))
}

function formatPrimitive(value: unknown): string {
  if (value == null || value === "") return "—"
  if (isIsoDateString(value)) return formatDateTime(String(value))
  if (typeof value === "number") return formatNumber(value)
  if (typeof value === "boolean") return value ? "Yes" : "No"
  return toEnglishDigits(String(value))
}

function isIsoDateString(value: unknown): value is string {
  return typeof value === "string" && ISO_DATE_PATTERN.test(value)
}

function isNumeric(value: unknown): boolean {
  if (typeof value === "number") return Number.isFinite(value)
  if (typeof value !== "string" || !value.trim()) return false
  return Number.isFinite(Number(value))
}

function shouldUseLtr(value: unknown): boolean {
  if (typeof value === "number") return true
  if (typeof value !== "string") return false
  return (
    ISO_DATE_PATTERN.test(value) ||
    /^https?:\/\//i.test(value) ||
    /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(value) ||
    /^\d[\d.,]*$/.test(value)
  )
}

function looksLatin(value: string): boolean {
  return /[A-Za-z0-9]/.test(value) && !/[\u0600-\u06FF]/.test(value)
}

function humanizeKey(key: string) {
  const spaced = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()

  if (!spaced) return key

  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}
