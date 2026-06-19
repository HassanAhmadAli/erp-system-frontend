import { useMemo, useState } from "react"
import { Plus, ReceiptText, RefreshCw, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { usePurchaseInvoices } from "@/hooks/usePurchaseInvoices"
import { normalizePurchaseInvoices } from "@/services/purchase-invoices-service"
import { toEnglishDigits } from "@/utils/number-formatters"
import { CreatePurchaseInvoiceForm } from "@/view/components/purchase-invoices/create-purchase-invoice-form"
import { PurchaseInvoicesListToolbar } from "@/view/components/purchase-invoices/purchase-invoices-list-toolbar"
import { PurchaseInvoicesTable } from "@/view/components/purchase-invoices/purchase-invoices-table"
import { getSupplierName } from "@/view/components/purchase-invoices/purchase-invoice-format"

export function PurchaseInvoicesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [search, setSearch] = useState("")

  const { data, isLoading, isError, refetch, isFetching } =
    usePurchaseInvoices()

  const invoices = useMemo(() => normalizePurchaseInvoices(data), [data])

  const filteredInvoices = useMemo(() => {
    const query = toEnglishDigits(search).trim().toLowerCase()

    if (!query) {
      return invoices
    }

    const queryWithoutHash = query.replace(/^#/, "")

    return invoices.filter((invoice) => {
      const invoiceId = String(invoice.id)
      const invoiceIdWithHash = `#${invoice.id}`
      const supplierName = getSupplierName(invoice).toLowerCase()

      return (
        invoiceId.includes(queryWithoutHash) ||
        invoiceIdWithHash.includes(query) ||
        supplierName.includes(query)
      )
    })
  }, [invoices, search])

  return (
    <main className="space-y-6" dir="rtl">
      <section className="flex flex-col gap-4 rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)] md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 text-right">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-6 text-[var(--erp-brand-solid)]" />

            <h1 className="text-2xl font-bold text-[var(--erp-text)]">
              فواتير الشراء
            </h1>
          </div>

          <p className="text-sm text-[var(--erp-muted)]">
            إنشاء وعرض فواتير الشراء وتحديث حالتها.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-nav-active-bg)]"
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
            تحديث
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen((currentValue) => !currentValue)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--erp-brand-solid)] px-4 py-2 text-sm font-semibold text-[var(--erp-brand-solid-foreground)] transition hover:opacity-90"
          >
            {isCreateOpen ? (
              <X className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            {isCreateOpen ? "إغلاق النموذج" : "إنشاء فاتورة"}
          </button>
        </div>
      </section>

      {isCreateOpen && (
        <CreatePurchaseInvoiceForm onCreated={() => setIsCreateOpen(false)} />
      )}

      <section className="rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
        <PurchaseInvoicesListToolbar
          search={search}
          totalCount={invoices.length}
          filteredCount={filteredInvoices.length}
          onSearchChange={setSearch}
        />

        <PurchaseInvoicesTable
          invoices={filteredInvoices}
          isLoading={isLoading}
          isError={isError}
        />
      </section>
    </main>
  )
}