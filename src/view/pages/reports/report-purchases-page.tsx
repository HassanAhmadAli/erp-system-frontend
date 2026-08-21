import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { usePurchaseInvoices } from "@/hooks/usePurchaseInvoices"
import { useReportDateRange } from "@/hooks/Reports/useReportDateRange"
import { buildInvoiceCharts } from "@/lib/report-chart-data"
import { toNumber } from "@/lib/report-parsers"
import { type PurchaseInvoice } from "@/services/purchase-invoices-service"
import { getInvoiceTotal } from "@/view/components/purchase-invoices/purchase-invoice-format"
import { BarChart } from "@/view/components/charts/bar-chart"
import { DonutChart } from "@/view/components/charts/donut-chart"
import { LineChart } from "@/view/components/charts/line-chart"
import { ExportReportButton } from "@/view/components/reports/export-report-button"
import { ReportDateFilter } from "@/view/components/reports/report-date-filter"
import { ReportLayout } from "@/view/components/reports/report-layout"
import { ReportMetrics } from "@/view/components/reports/report-metrics"
import { ReportTable } from "@/view/components/reports/report-table"

type NormalizedPurchaseInvoice = {
  id: number
  status: string
  invoiceDate?: string
  totalAmount?: string | number
  supplier: string
}

export function ReportPurchasesPage() {
  const { t } = useTranslation(["common", "pages"])
  const { from, to, setFrom, setTo, range } = useReportDateRange()
  const { data, isLoading, isError } = usePurchaseInvoices({ limit: 100 })

  const invoices = useMemo<PurchaseInvoice[]>(() => data?.data ?? [], [data])

  const normalized = useMemo<NormalizedPurchaseInvoice[]>(
    () =>
      invoices.map((inv) => ({
        id: inv.id,
        status: String(inv.status ?? "UNKNOWN"),
        invoiceDate: inv.invoiceDate ?? inv.createdAt,
        totalAmount: getInvoiceTotal(inv) ?? undefined,
        supplier:
          inv.supplier?.companyName ??
          inv.supplier?.name ??
          inv.supplier?.fullName ??
          inv.supplier?.user?.fullName ??
          String(inv.supplierId ?? t("reports.unspecified", { ns: "pages" })),
      })),
    [invoices, t]
  )

  const filtered = useMemo<NormalizedPurchaseInvoice[]>(() => {
    if (!from && !to) return normalized

    return normalized.filter((inv) => {
      if (!inv.invoiceDate) return true

      const date = new Date(inv.invoiceDate).getTime()

      if (Number.isNaN(date)) return true
      if (from && date < new Date(`${from}T00:00:00`).getTime()) return false
      if (to && date > new Date(`${to}T23:59:59`).getTime()) return false

      return true
    })
  }, [normalized, from, to])

  const totalPurchases = filtered.reduce(
    (sum, inv) => sum + (toNumber(inv.totalAmount) ?? 0),
    0
  )

  const { timeSeries, topByAmount, statusByCount } =
    buildInvoiceCharts(filtered)

  const tableRows = filtered.map((inv) => ({
    id: inv.id,
    supplier: inv.supplier,
    status: inv.status,
    totalAmount: inv.totalAmount,
    invoiceDate: inv.invoiceDate,
  }))

  return (
    <ReportLayout
      title={t("reports.purchases", { ns: "pages" })}
      description={t("reports.purchasesReportDesc", { ns: "pages" })}
      backTo="/reports"
      backLabel={t("reports.allReports", { ns: "pages" })}
      loading={isLoading}
      error={isError}
      filters={
        <ReportDateFilter
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
        />
      }
      actions={
        <ExportReportButton
          type="purchases"
          label={t("exportCsv")}
          params={range}
        />
      }
    >
      <ReportMetrics
        metrics={[
          {
            key: "count",
            label: t("reports.invoiceCount", { ns: "pages" }),
            value: filtered.length,
          },
          {
            key: "totalPurchases",
            label: t("reports.totalPurchases", { ns: "pages" }),
            value: totalPurchases,
          },
        ]}
      />

      <LineChart
        title={t("reports.purchasesTrend", { ns: "pages" })}
        data={timeSeries}
        unit="SP"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <BarChart
          title={t("reports.topPurchaseInvoices", { ns: "pages" })}
          data={topByAmount}
          unit="SP"
        />
        <DonutChart
          title={t("reports.invoicesByStatus", { ns: "pages" })}
          data={statusByCount}
        />
      </div>

      <ReportTable
        title={t("reports.purchaseInvoices", { ns: "pages" })}
        rows={tableRows}
      />
    </ReportLayout>
  )
}
