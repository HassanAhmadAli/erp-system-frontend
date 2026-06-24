import { useMemo, useState } from "react"
import { Plus, ReceiptText, RefreshCw, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { useSalesInvoices } from "@/hooks/useSalesInvoices"
import { normalizeSalesInvoices } from "@/services/sales-invoices-service"
import { CreateSalesInvoiceForm } from "@/view/components/sales-invoices/create-sales-invoice-form"
import { SalesInvoicesTable } from "@/view/components/sales-invoices/sales-invoices-table"
import {
  formatNumber,
  NumberText,
} from "@/view/components/sales-invoices/sales-invoice-format"

export function SalesInvoicesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data, isLoading, isError, refetch, isFetching } = useSalesInvoices()

  const invoices = useMemo(() => normalizeSalesInvoices(data), [data])

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
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="text-right">
            <h2 className="text-lg font-bold text-[var(--erp-text)]">
              قائمة الفواتير
            </h2>

            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              عدد الفواتير المعروضة:{" "}
              <NumberText value={formatNumber(invoices.length)} />
            </p>
          </div>
        </div>

        <SalesInvoicesTable
          invoices={invoices}
          isLoading={isLoading}
          isError={isError}
        />
      </section>
    </main>
  )
}
