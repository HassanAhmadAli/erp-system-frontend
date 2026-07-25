import { Search, X } from "lucide-react"

import { toEnglishDigits } from "@/utils/number-formatters"
import {
  formatNumber,
  NumberText,
} from "@/view/components/purchase-invoices/purchase-invoice-format"

type PurchaseInvoicesListToolbarProps = {
  search: string
  totalCount: number
  filteredCount: number
  onSearchChange: (value: string) => void
}

export function PurchaseInvoicesListToolbar({
  search,
  totalCount,
  filteredCount,
  onSearchChange,
}: PurchaseInvoicesListToolbarProps) {
  const hasSearch = search.trim().length > 0

  return (
    <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="text-right">
        <h2 className="text-lg font-bold text-[var(--erp-text)]">
          قائمة فواتير الشراء
        </h2>

        <p className="mt-1 text-sm text-[var(--erp-muted)]">
          عدد الفواتير المعروضة:{" "}
          <NumberText value={formatNumber(filteredCount)} />
          {hasSearch && (
            <>
              {" "}
              من أصل <NumberText value={formatNumber(totalCount)} />
            </>
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
          dir="rtl"
          placeholder="ابحث برقم الفاتورة أو اسم المورد..."
          className="w-full rounded-2xl border border-[var(--erp-border)] bg-transparent py-3 ps-11 pe-4 text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)]"
        />

        {hasSearch && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute end-4 top-1/2 -translate-y-1/2 text-[var(--erp-muted)] transition hover:text-[var(--erp-text)]"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  )
}