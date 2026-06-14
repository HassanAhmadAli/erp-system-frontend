import { useReportInventory } from "@/hooks/Reports/useReports"
import { useReportDateRange } from "@/hooks/Reports/useReportDateRange"
import {
  extractInventoryMetrics,
  extractInventoryQuantityBars,
  extractInventoryStatusComposition,
} from "@/lib/report-chart-data"
import { extractTableRows } from "@/lib/report-parsers"
import { BarChart } from "@/view/components/charts/bar-chart"
import { DonutChart } from "@/view/components/charts/donut-chart"
import { ExportReportButton } from "@/view/components/reports/export-report-button"
import { ReportDateFilter } from "@/view/components/reports/report-date-filter"
import { ReportLayout } from "@/view/components/reports/report-layout"
import { ReportMetrics } from "@/view/components/reports/report-metrics"
import { ReportTable } from "@/view/components/reports/report-table"

export function ReportInventoryPage() {
  const { from, to, setFrom, setTo, range } = useReportDateRange()
  const { data, isLoading, isError } = useReportInventory(range)

  const rows = extractTableRows(data)
  const quantityBars = extractInventoryQuantityBars(data)
  const statusComposition = extractInventoryStatusComposition(data)
  const metrics = extractInventoryMetrics(data)

  return (
    <ReportLayout
      title="تقرير المخزون"
      description="كميات المنتجات وحالة المخزون"
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
        <ExportReportButton type="inventory" label="تصدير CSV" params={range} />
      }
    >
      <ReportMetrics metrics={metrics} />

      <div className="grid gap-4 lg:grid-cols-2">
        <BarChart title="كميات المنتجات" data={quantityBars} />
        <DonutChart title="توزيع حالة المخزون" data={statusComposition} />
      </div>

      <ReportTable title="تفاصيل المنتجات" rows={rows} />
    </ReportLayout>
  )
}
