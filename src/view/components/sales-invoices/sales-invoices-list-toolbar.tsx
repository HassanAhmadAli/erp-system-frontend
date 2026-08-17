import { Search, X } from "lucide-react"
import { useTranslation } from "react-i18next"

import { toEnglishDigits } from "@/utils/number-formatters"
import {
  formatNumber,
  NumberText,
} from "@/view/components/sales-invoices/sales-invoice-format"

type SalesInvoicesListToolbarProps = {
  search: string
  totalCount: number
  filteredCount: number
  onSearchChange: (value: string) => void
}

export function SalesInvoicesListToolbar({
  search,
  totalCount,
  filteredCount,
  onSearchChange,
}: SalesInvoicesListToolbarProps) {
  const { t } = useTranslation(["common", "pages"])
  const hasSearch = search.trim().length > 0

  return (
    <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="text-start">
        <h2 className="text-lg font-bold text-[var(--erp-text)]">
          {t("pages:salesInvoices.list")}
        </h2>

        <p className="mt-1 text-sm text-[var(--erp-muted)]">
          {t("common:shownInvoices")}:{" "}
          <NumberText value={formatNumber(filteredCount)} />
          {hasSearch && (
            <> {t("common:ofTotal", { count: formatNumber(totalCount) })}</>
          )}
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
          placeholder={t("pages:salesInvoices.searchPlaceholder")}
          className="w-full rounded-2xl border border-[var(--erp-border)] bg-transparent py-3 ps-11 pe-4 text-sm text-[var(--erp-text)] transition outline-none placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)]"
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
  )
}
