import { Search, X } from "lucide-react"
import { useTranslation } from "react-i18next"

import { toEnglishDigits } from "@/utils/number-formatters"
import {
  PURCHASE_INVOICE_STATUS_OPTIONS,
  type PurchaseInvoiceStatus,
} from "@/validation/purchase-invoice-schema"
import {
  formatNumber,
  getPurchaseInvoiceStatusLabel,
  NumberText,
} from "@/view/components/purchase-invoices/purchase-invoice-format"

const fieldClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)]"

type PurchaseInvoicesListToolbarProps = {
  search: string
  status: string
  from: string
  to: string
  totalCount: number
  filteredCount: number
  listTotal?: number
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
}

export function PurchaseInvoicesListToolbar({
  search,
  status,
  from,
  to,
  totalCount,
  filteredCount,
  listTotal,
  onSearchChange,
  onStatusChange,
  onFromChange,
  onToChange,
}: PurchaseInvoicesListToolbarProps) {
  const { t } = useTranslation(["common", "pages"])
  const hasSearch = search.trim().length > 0

  return (
    <div className="mb-4 space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-start">
          <h2 className="text-lg font-bold text-[var(--erp-text)]">
            {t("pages:purchaseInvoices.list")}
          </h2>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("common:shownInvoices")}:{" "}
            <NumberText value={formatNumber(filteredCount)} />
            {hasSearch && (
              <> {t("common:ofTotal", { count: formatNumber(totalCount) })}</>
            )}
            {listTotal != null ? (
              <>
                {" "}
                {t("common:grandTotalSuffix", {
                  count: formatNumber(listTotal),
                })}
              </>
            ) : null}
          </p>
        </div>

        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-[var(--erp-muted)]" />

          <input
            value={search}
            onChange={(event) =>
              onSearchChange(toEnglishDigits(event.target.value))
            }
            type="search"
            placeholder={t("pages:purchaseInvoices.searchPlaceholder")}
            className={`${fieldClass} ps-11 pe-4`}
          />

          {hasSearch && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute end-4 top-1/2 -translate-y-1/2 text-[var(--erp-muted)] transition hover:text-[var(--erp-text)]"
              aria-label={t("common:clearSearch")}
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-[var(--erp-muted)]">
            {t("common:status")}
          </span>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className={fieldClass}
            aria-label={t("common:status")}
          >
            <option value="">{t("common:all")}</option>
            {PURCHASE_INVOICE_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {getPurchaseInvoiceStatusLabel(
                  option as PurchaseInvoiceStatus,
                  t
                )}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-[var(--erp-muted)]">
            {t("common:from")}
          </span>
          <input
            type="date"
            value={from}
            onChange={(event) => onFromChange(event.target.value)}
            className={fieldClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-[var(--erp-muted)]">
            {t("common:to")}
          </span>
          <input
            type="date"
            value={to}
            onChange={(event) => onToChange(event.target.value)}
            className={fieldClass}
          />
        </label>
      </div>
    </div>
  )
}
