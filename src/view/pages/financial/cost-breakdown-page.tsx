import { useReportDateRange } from "@/hooks/Reports/useReportDateRange"
import { useCostBreakdown } from "@/hooks/Financial/useFinancial"
import {
  extractCostBreakdownSeries,
  isCompositionData,
} from "@/lib/report-chart-data"
import { extractMetrics, extractTableRows } from "@/lib/report-parsers"
import { BarChart } from "@/view/components/charts/bar-chart"
import { DonutChart } from "@/view/components/charts/donut-chart"
import { ReportDateFilter } from "@/view/components/reports/report-date-filter"
import { ReportLayout } from "@/view/components/reports/report-layout"
import { ReportMetrics } from "@/view/components/reports/report-metrics"
import { ReportTable } from "@/view/components/reports/report-table"

export function CostBreakdownPage() {
  const { from, to, setFrom, setTo, range } = useReportDateRange()
  const { data, isLoading, isError } = useCostBreakdown(range)

  const series = extractCostBreakdownSeries(data)
  const rows = extractTableRows(data)
  const metrics = extractMetrics(data).filter((m) =>
    [
      "revenue",
      "purchasingCosts",
      "operatingExpenses",
      "discountsGiven",
      "grossProfit",
      "netProfit",
    ].includes(m.key)
  )

  return (
    <ReportLayout
      title="تفصيل التكاليف"
      description="توزيع التكاليف بين الفئات — المخطط الدائري يعرض نسبة كل فئة من الإجمالي"
      backTo="/financial"
      backLabel="التحليل المالي"
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
    >
      <ReportMetrics metrics={metrics} />

      <div className="grid gap-4 lg:grid-cols-2">
        {isCompositionData(series) && (
          <DonutChart
            title="نسبة كل فئة من إجمالي التكلفة"
            data={series}
            unit="SP"
          />
        )}
        <BarChart title="مقارنة التكاليف بالقيمة" data={series} unit="SP" />
      </div>

      <ReportTable title="تفاصيل التكاليف" rows={rows} />
    </ReportLayout>
  )
}
