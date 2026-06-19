import { useMemo, useState } from "react"
import { Plus, ReceiptText, RefreshCw, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useSalesInvoices } from "@/hooks/useSalesInvoices"
import {
  normalizeSalesInvoices,
  type SalesInvoice,
} from "@/services/sales-invoices-service"
import { toEnglishDigits } from "@/utils/number-formatters"
import { CreateSalesInvoiceForm } from "@/view/components/sales-invoices/create-sales-invoice-form"
import { SalesInvoicesListToolbar } from "@/view/components/sales-invoices/sales-invoices-list-toolbar"
import { SalesInvoicesTable } from "@/view/components/sales-invoices/sales-invoices-table"

function getSearchableCustomerName(invoice: SalesInvoice) {
  const fullName = invoice.customer?.user?.fullName?.trim()

  if (fullName) {
    return fullName
  }

  return "عميل نقدي"
}

export function SalesInvoicesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [search, setSearch] = useState("")

  const { data, isLoading, isError, refetch, isFetching } = useSalesInvoices()

  const invoices = useMemo(() => normalizeSalesInvoices(data), [data])

  const filteredInvoices = useMemo(() => {
    const query = toEnglishDigits(search).trim().toLowerCase()

    if (!query) {
      return invoices
    }

    const queryWithoutHash = query.replace(/^#/, "")

    return invoices.filter((invoice) => {
      const invoiceId = String(invoice.id)
      const invoiceIdWithHash = `#${invoice.id}`
      const customerName = getSearchableCustomerName(invoice).toLowerCase()

      return (
        invoiceId.includes(queryWithoutHash) ||
        invoiceIdWithHash.includes(query) ||
        customerName.includes(query)
      )
    })
  }, [invoices, search])

  return (
    <main className="space-y-6" dir="rtl">
      <section className="flex flex-col gap-4 rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)] md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 text-right">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-6 text-[var(--erp-brand-solid)]" />

            <h1 className="text-2xl font-bold text-[var(--erp-text)]">
              فواتير المبيعات
            </h1>
          </div>

          <p className="text-sm text-[var(--erp-muted)]">
            عرض الفواتير، إنشاء فاتورة جديدة، وتحديث حالة الفاتورة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
            تحديث
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen((currentValue) => !currentValue)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--erp-brand-solid)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 dark:!text-[#24114f]"
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
        <CreateSalesInvoiceForm onCreated={() => setIsCreateOpen(false)} />
      )}

      <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <SalesInvoicesListToolbar
          search={search}
          totalCount={invoices.length}
          filteredCount={filteredInvoices.length}
          onSearchChange={setSearch}
        />

        <SalesInvoicesTable
          invoices={filteredInvoices}
          isLoading={isLoading}
          isError={isError}
        />
      </section>
    </main>
  )
}