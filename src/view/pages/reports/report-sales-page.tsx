import { useMemo } from "react"

import { useSalesInvoices } from "@/hooks/useSalesInvoices"
import { useReportDateRange } from "@/hooks/Reports/useReportDateRange"
import { buildInvoiceCharts } from "@/lib/report-chart-data"
import { toNumber } from "@/lib/report-parsers"
import {
  normalizeSalesInvoices,
  type SalesInvoice,
} from "@/services/sales-invoices-service"
import { BarChart } from "@/view/components/charts/bar-chart"
import { DonutChart } from "@/view/components/charts/donut-chart"
import { LineChart } from "@/view/components/charts/line-chart"
import { ExportReportButton } from "@/view/components/reports/export-report-button"
import { ReportDateFilter } from "@/view/components/reports/report-date-filter"
import { ReportLayout } from "@/view/components/reports/report-layout"
import { ReportMetrics } from "@/view/components/reports/report-metrics"
import { ReportTable } from "@/view/components/reports/report-table"

type NormalizedSalesInvoice = {
  id: number
  status: string
  invoiceDate?: string
  totalAmount?: string | number
  customer: string
}

export function ReportSalesPage() {
  const { from, to, setFrom, setTo, range } = useReportDateRange()
  const { data, isLoading, isError } = useSalesInvoices()

  const invoices = useMemo<SalesInvoice[]>(
    () => normalizeSalesInvoices(data),
    [data]
  )

  const normalized = useMemo<NormalizedSalesInvoice[]>(
    () =>
      invoices.map((inv) => ({
        id: inv.id,
        status: String(inv.status ?? "UNKNOWN"),
        invoiceDate: inv.createdAt,
        totalAmount:
          inv.finalAmount ?? inv.totalAmount ?? inv.subtotal ?? inv.amountPaid,
        customer: inv.customer?.user?.fullName ?? "زبون نقدي",
      })),
    [invoices]
  )

  const filtered = useMemo<NormalizedSalesInvoice[]>(() => {
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

  const totalSales = filtered.reduce(
    (sum, inv) => sum + (toNumber(inv.totalAmount) ?? 0),
    0
  )

  const { timeSeries, topByAmount, statusByAmount } =
    buildInvoiceCharts(filtered)

  const tableRows = filtered.map((inv) => ({
    id: inv.id,
    status: inv.status,
    customer: inv.customer,
    totalAmount: inv.totalAmount,
    invoiceDate: inv.invoiceDate,
  }))

  return (
    <ReportLayout
      title="تقرير المبيعات"
      description="اتجاه الإيرادات وأعلى الفواتير وتوزيعها حسب الحالة"
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
        <ExportReportButton type="sales" label="تصدير CSV" params={range} />
      }
    >
      <ReportMetrics
        metrics={[
          { key: "count", label: "عدد الفواتير", value: filtered.length },
          { key: "totalSales", label: "إجمالي المبيعات", value: totalSales },
        ]}
      />

      <LineChart title="اتجاه المبيعات عبر الزمن" data={timeSeries} unit="SP" />

      <div className="grid gap-4 lg:grid-cols-2">
        <BarChart title="أعلى الفواتير قيمةً" data={topByAmount} unit="SP" />
        <DonutChart
          title="توزيع المبيعات حسب الحالة"
          data={statusByAmount}
          unit="SP"
        />
      </div>

      <ReportTable title="فواتير المبيعات" rows={tableRows} />
    </ReportLayout>
  )
}
