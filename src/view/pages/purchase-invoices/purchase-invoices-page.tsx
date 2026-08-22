import { useEffect, useMemo, useState } from "react"
import { Plus, ReceiptText, RefreshCw, X } from "lucide-react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import { toApiDateRange } from "@/lib/report-parsers"
import { PERMISSIONS } from "@/auth/permissions"
import { usePermissions } from "@/hooks/usePermissions"
import { usePurchaseInvoices } from "@/hooks/usePurchaseInvoices"
import { CreatePurchaseInvoiceForm } from "@/view/components/purchase-invoices/create-purchase-invoice-form"
import { PurchaseInvoicesListToolbar } from "@/view/components/purchase-invoices/purchase-invoices-list-toolbar"
import { PurchaseInvoicesTable } from "@/view/components/purchase-invoices/purchase-invoices-table"
import {
  getPurchaseInvoiceStatusLabel,
  getSupplierName,
} from "@/view/components/purchase-invoices/purchase-invoice-format"
import {
  buildPurchaseInvoicesListCsv,
  buildPurchaseInvoicesListRows,
  getPurchaseInvoicesListColumns,
} from "@/view/components/purchase-invoices/purchase-invoice-io"
import { InvoiceIoButtons } from "@/view/components/invoices/invoice-io-buttons"
import { InvoiceListPrintDocument } from "@/view/components/invoices/invoice-print-document"
import { PaginationControls } from "@/view/components/ui/pagination-controls"
import { isPurchaseInvoiceStatus } from "@/validation/purchase-invoice-schema"
import {
  listAllPurchaseInvoices,
  type PurchaseInvoice,
} from "@/services/purchase-invoices-service"
import { downloadCsv } from "@/utils/csv"
import { printPage } from "@/utils/print"
import { toEnglishDigits } from "@/utils/number-formatters"

const PAGE_SIZE = 10

function matchesPurchaseSearch(
  invoice: PurchaseInvoice,
  search: string,
  supplierName: string
) {
  const query = toEnglishDigits(search).trim().toLowerCase()

  if (!query) return true

  const haystack = [
    String(invoice.id),
    invoice.supplierId != null ? String(invoice.supplierId) : "",
    supplierName,
    invoice.supplier?.fullName,
    invoice.supplier?.fullNameAr,
    invoice.supplier?.name,
    invoice.supplier?.companyName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return haystack.includes(query)
}

export function PurchaseInvoicesPage() {
  const { t } = useTranslation(["common", "pages"])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const { can } = usePermissions()
  const canCreate = can(PERMISSIONS.PURCHASES_CREATE)
  const range = toApiDateRange(from, to)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    setPage(1)
  }, [search, status, from, to])

  const { data, isLoading, isError, refetch, isFetching } = usePurchaseInvoices(
    {
      page,
      limit: PAGE_SIZE,
      status: isPurchaseInvoiceStatus(status) ? status : undefined,
      from: range.from,
      to: range.to,
    }
  )

  const invoices = data?.data ?? []

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) =>
        matchesPurchaseSearch(invoice, search, getSupplierName(invoice, t))
      ),
    [invoices, search, t]
  )

  const printSubtitle = [
    status
      ? `${t("common:status")}: ${getPurchaseInvoiceStatusLabel(status, t)}`
      : `${t("common:status")}: ${t("common:all")}`,
    from ? `${t("common:from")}: ${from}` : null,
    to ? `${t("common:to")}: ${to}` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  function handlePrintList() {
    printPage(t("pages:purchaseInvoices.title"))
  }

  async function handleExportList() {
    setIsExporting(true)

    try {
      const allInvoices = await listAllPurchaseInvoices({
        status: isPurchaseInvoiceStatus(status) ? status : undefined,
        from: range.from,
        to: range.to,
      })
      const rows = allInvoices.filter((invoice) =>
        matchesPurchaseSearch(invoice, search, getSupplierName(invoice, t))
      )

      if (rows.length === 0) {
        alert(t("common:exportEmpty"))
        return
      }

      downloadCsv(
        "purchase-invoices.csv",
        buildPurchaseInvoicesListCsv(rows, t)
      )
    } catch {
      alert(t("common:exportFailed"))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <main className="space-y-6">
      <InvoiceListPrintDocument
        title={t("pages:purchaseInvoices.title")}
        subtitle={printSubtitle}
        columns={getPurchaseInvoicesListColumns(t)}
        rows={buildPurchaseInvoicesListRows(filteredInvoices, t)}
        emptyLabel={t("pages:purchaseInvoices.noInvoices")}
      />

      <section className="flex flex-col gap-4 rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)] md:flex-row md:items-center md:justify-between print:hidden">
        <div className="space-y-2 text-start">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-6 text-[var(--erp-brand-solid)]" />
            <h1 className="text-2xl font-bold text-[var(--erp-text)]">
              {t("pages:purchaseInvoices.title")}
            </h1>
          </div>

          <p className="text-sm text-[var(--erp-muted)]">
            {t("pages:purchaseInvoices.subtitle")}
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
            className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-nav-active-bg)]"
          >
            <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
            {t("common:refresh")}
          </button>

          {canCreate && (
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
              {isCreateOpen ? t("common:closeForm") : t("common:createInvoice")}
            </button>
          )}
        </div>
      </section>

      {canCreate && isCreateOpen && (
        <div className="print:hidden">
          <CreatePurchaseInvoiceForm onCreated={() => setIsCreateOpen(false)} />
        </div>
      )}

      <section className="rounded-[24px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)] print:hidden">
        <PurchaseInvoicesListToolbar
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

        <PurchaseInvoicesTable
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
