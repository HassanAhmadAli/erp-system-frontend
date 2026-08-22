import { useEffect, useMemo, useState } from "react"
import { Plus, ReceiptText, RefreshCw, X } from "lucide-react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import { toApiDateRange } from "@/lib/report-parsers"
import { PERMISSIONS } from "@/auth/permissions"
import { usePermissions } from "@/hooks/usePermissions"
import { useSalesInvoices } from "@/hooks/useSalesInvoices"
import { CreateSalesInvoiceForm } from "@/view/components/sales-invoices/create-sales-invoice-form"
import { SalesInvoicesListToolbar } from "@/view/components/sales-invoices/sales-invoices-list-toolbar"
import { SalesInvoicesTable } from "@/view/components/sales-invoices/sales-invoices-table"
import {
  getCustomerName,
  getSalesInvoiceStatusLabel,
} from "@/view/components/sales-invoices/sales-invoice-format"
import {
  buildSalesInvoicesListCsv,
  buildSalesInvoicesListRows,
  getSalesInvoicesListColumns,
} from "@/view/components/sales-invoices/sales-invoice-io"
import { InvoiceIoButtons } from "@/view/components/invoices/invoice-io-buttons"
import { InvoiceListPrintDocument } from "@/view/components/invoices/invoice-print-document"
import { PaginationControls } from "@/view/components/ui/pagination-controls"
import { isSalesInvoiceStatus } from "@/validation/sales-invoice-schema"
import {
  listAllSalesInvoices,
  type SalesInvoice,
} from "@/services/sales-invoices-service"
import { downloadCsv } from "@/utils/csv"
import { printPage } from "@/utils/print"
import { toEnglishDigits } from "@/utils/number-formatters"

const PAGE_SIZE = 10

function matchesSalesSearch(
  invoice: SalesInvoice,
  search: string,
  customerName: string
) {
  const query = toEnglishDigits(search).trim().toLowerCase()

  if (!query) return true

  const haystack = [
    String(invoice.id),
    invoice.customerId != null ? String(invoice.customerId) : "",
    customerName,
    invoice.customer?.user?.fullName,
    invoice.customer?.user?.email,
    invoice.cashier?.user?.fullName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return haystack.includes(query)
}

export function SalesInvoicesPage() {
  const { t } = useTranslation(["common", "pages"])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const { can } = usePermissions()
  const canCreate = can(PERMISSIONS.SALES_CREATE)
  const range = toApiDateRange(from, to)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [search, status, from, to])

  const { data, isLoading, isError, refetch, isFetching } = useSalesInvoices({
    page,
    limit: PAGE_SIZE,
    status: isSalesInvoiceStatus(status) ? status : undefined,
    from: range.from,
    to: range.to,
  })

  const invoices = data?.data ?? []

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) =>
        matchesSalesSearch(invoice, search, getCustomerName(invoice, t))
      ),
    [invoices, search, t]
  )

  const printSubtitle = [
    status
      ? `${t("common:status")}: ${getSalesInvoiceStatusLabel(status, t)}`
      : `${t("common:status")}: ${t("common:all")}`,
    from ? `${t("common:from")}: ${from}` : null,
    to ? `${t("common:to")}: ${to}` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  function handlePrintList() {
    printPage(t("pages:salesInvoices.title"))
  }

  async function handleExportList() {
    setIsExporting(true)

    try {
      const allInvoices = await listAllSalesInvoices({
        status: isSalesInvoiceStatus(status) ? status : undefined,
        from: range.from,
        to: range.to,
      })
      const rows = allInvoices.filter((invoice) =>
        matchesSalesSearch(invoice, search, getCustomerName(invoice, t))
      )

      if (rows.length === 0) {
        alert(t("common:exportEmpty"))
        return
      }

      downloadCsv("sales-invoices.csv", buildSalesInvoicesListCsv(rows, t))
    } catch {
      alert(t("common:exportFailed"))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <main className="space-y-6">
      <InvoiceListPrintDocument
        title={t("pages:salesInvoices.title")}
        subtitle={printSubtitle}
        columns={getSalesInvoicesListColumns(t)}
        rows={buildSalesInvoicesListRows(filteredInvoices, t)}
        emptyLabel={t("pages:salesInvoices.noInvoices")}
      />

      <section className="flex flex-col gap-4 rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)] md:flex-row md:items-center md:justify-between print:hidden">
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
          <InvoiceIoButtons
            onPrint={handlePrintList}
            onExport={handleExportList}
            printLabel={t("common:printList")}
            exportLabel={t("common:exportCsv")}
            isExporting={isExporting}
            disabled={isLoading}
          />

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
        <div className="print:hidden">
          <CreateSalesInvoiceForm onCreated={() => setIsCreateOpen(false)} />
        </div>
      )}

      <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)] print:hidden">
        <SalesInvoicesListToolbar
          search={search}
          status={status}
          from={from}
          to={to}
          totalCount={invoices.length}
          filteredCount={filteredInvoices.length}
          listTotal={data?.total}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onFromChange={setFrom}
          onToChange={setTo}
        />

        <SalesInvoicesTable
          invoices={filteredInvoices}
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
