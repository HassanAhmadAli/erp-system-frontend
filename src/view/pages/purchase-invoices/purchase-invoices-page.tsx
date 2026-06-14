import { useMemo, useState } from "react"
import { Plus, ReceiptText, RefreshCw, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { usePurchaseInvoices } from "@/hooks/usePurchaseInvoices"
import { normalizePurchaseInvoices } from "@/services/purchase-invoices-service"
import { CreatePurchaseInvoiceForm } from "@/view/components/purchase-invoices/create-purchase-invoice-form"
import { PurchaseInvoicesTable } from "@/view/components/purchase-invoices/purchase-invoices-table"
import {
  formatNumber,
  NumberText,
} from "@/view/components/purchase-invoices/purchase-invoice-format"

export function PurchaseInvoicesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { data, isLoading, isError, refetch, isFetching } =
    usePurchaseInvoices()

  const invoices = useMemo(() => normalizePurchaseInvoices(data), [data])

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
            <RefreshCw
              className={cn("size-4", isFetching && "animate-spin")}
            />
            تحديث
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen((currentValue) => !currentValue)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--erp-brand-solid)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
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
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="text-right">
            <h2 className="text-lg font-bold text-[var(--erp-text)]">
              قائمة فواتير الشراء
            </h2>

            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              عدد الفواتير المعروضة:{" "}
              <NumberText value={formatNumber(invoices.length)} />
            </p>
          </div>
        </div>

        <PurchaseInvoicesTable
          invoices={invoices}
          isLoading={isLoading}
          isError={isError}
        />
      </section>
    </main>
  )
}