import { useMemo } from "react"

import { usePurchaseInvoices } from "@/hooks/Purchases/usePurchases"
import { useReportDateRange } from "@/hooks/Reports/useReportDateRange"
import { buildInvoiceCharts } from "@/lib/report-chart-data"
import { toNumber } from "@/lib/report-parsers"
import { BarChart } from "@/view/components/charts/bar-chart"
import { DonutChart } from "@/view/components/charts/donut-chart"
import { LineChart } from "@/view/components/charts/line-chart"
import { ExportReportButton } from "@/view/components/reports/export-report-button"
import { ReportDateFilter } from "@/view/components/reports/report-date-filter"
import { ReportLayout } from "@/view/components/reports/report-layout"
import { ReportMetrics } from "@/view/components/reports/report-metrics"
import { ReportTable } from "@/view/components/reports/report-table"

export function ReportPurchasesPage() {
  const { from, to, setFrom, setTo, range } = useReportDateRange()
  const { data: invoices = [], isLoading, isError } = usePurchaseInvoices()

  const normalized = useMemo(
    () =>
      invoices.map((inv) => ({
        id: inv.id,
        status: inv.status,
        invoiceDate: inv.invoiceDate,
        totalAmount: inv.total,
        supplier: inv.supplier?.fullName ?? String(inv.supplierId),
      })),
    [invoices]
  )

  const filtered = useMemo(() => {
    if (!from && !to) return normalized

    return normalized.filter((inv) => {
      if (!inv.invoiceDate) return true
      const date = new Date(inv.invoiceDate).getTime()
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
      title="تقرير المشتريات"
      description="اتجاه التوريد وأعلى فواتير الشراء وعددها حسب الحالة"
      backTo="/reports"
      backLabel="كل التقارير"
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
        <ExportReportButton type="purchases" label="تصدير CSV" params={range} />
      }
    >
      <ReportMetrics
        metrics={[
          { key: "count", label: "عدد الفواتير", value: filtered.length },
          {
            key: "totalPurchases",
            label: "إجمالي المشتريات",
            value: totalPurchases,
          },
        ]}
      />

      <LineChart
        title="اتجاه المشتريات عبر الزمن"
        data={timeSeries}
        unit="SP"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <BarChart title="أعلى فواتير الشراء" data={topByAmount} unit="SP" />
        <DonutChart title="عدد الفواتير حسب الحالة" data={statusByCount} />
      </div>

      <ReportTable title="فواتير الشراء" rows={tableRows} />
    </ReportLayout>
  )
}
