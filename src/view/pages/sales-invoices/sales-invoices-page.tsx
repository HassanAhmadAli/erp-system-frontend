import { useState } from "react"
import { Plus, ReceiptText, RefreshCw, X } from "lucide-react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import { PERMISSIONS } from "@/auth/permissions"
import { usePermissions } from "@/hooks/usePermissions"
import { useSalesInvoices } from "@/hooks/useSalesInvoices"
import { CreateSalesInvoiceForm } from "@/view/components/sales-invoices/create-sales-invoice-form"
import { SalesInvoicesTable } from "@/view/components/sales-invoices/sales-invoices-table"
import {
  formatNumber,
  NumberText,
} from "@/view/components/sales-invoices/sales-invoice-format"
import { PaginationControls } from "@/view/components/ui/pagination-controls"

const PAGE_SIZE = 10

export function SalesInvoicesPage() {
  const { t } = useTranslation(["common", "pages"])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [page, setPage] = useState(1)
  const { can } = usePermissions()
  const canCreate = can(PERMISSIONS.SALES_CREATE)

  const { data, isLoading, isError, refetch, isFetching } = useSalesInvoices({
    page,
    limit: PAGE_SIZE,
  })

  const invoices = data?.data ?? []

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)] md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 text-start">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-6 text-[var(--erp-brand-solid)]" />
            <h1 className="text-2xl font-bold text-[var(--erp-text)]">
              {t("pages:salesInvoices.title")}
            </h1>
          </div>

          <p className="text-sm text-[var(--erp-muted)]">
            {t("pages:salesInvoices.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
            {t("common:refresh")}
          </button>

          {canCreate && (
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
              {isCreateOpen ? t("common:closeForm") : t("common:createInvoice")}
            </button>
          )}
        </div>
      </section>

      {canCreate && isCreateOpen && (
        <CreateSalesInvoiceForm onCreated={() => setIsCreateOpen(false)} />
      )}

      <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="text-start">
            <h2 className="text-lg font-bold text-[var(--erp-text)]">
              {t("pages:salesInvoices.list")}
            </h2>

            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              {t("common:shownInvoices")}:{" "}
              <NumberText value={formatNumber(invoices.length)} />
              {data?.total != null ? (
                <>
                  {" "}
                  {t("common:grandTotalSuffix", {
                    count: formatNumber(data.total),
                  })}
                </>
              ) : null}
            </p>
          </div>
        </div>

        <SalesInvoicesTable
          invoices={invoices}
          isLoading={isLoading}
          isError={isError}
        />

        {!isLoading && !isError && (
          <div className="mt-4">
            <PaginationControls
              page={page}
              isFinalPage={data?.isFinalPage ?? true}
              isLoading={isFetching}
              total={data?.total}
              onPrevious={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() => setPage((current) => current + 1)}
            />
          </div>
        )}
      </section>
    </main>
  )
}
