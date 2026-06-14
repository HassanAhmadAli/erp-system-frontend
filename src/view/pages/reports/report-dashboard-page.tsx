import { useReportDashboard } from "@/hooks/Reports/useReports"
import { useReportDateRange } from "@/hooks/Reports/useReportDateRange"
import {
  extractDashboardMetrics,
  extractDashboardKpis,
  extractTimeSeries,
} from "@/lib/report-chart-data"
import { BarChart } from "@/view/components/charts/bar-chart"
import { LineChart } from "@/view/components/charts/line-chart"
import { ReportDateFilter } from "@/view/components/reports/report-date-filter"
import { ReportLayout } from "@/view/components/reports/report-layout"
import { ReportMetrics } from "@/view/components/reports/report-metrics"

export function ReportDashboardPage() {
  const { from, to, setFrom, setTo, range } = useReportDateRange()
  const { data, isLoading, isError } = useReportDashboard(range)

  const metrics = extractDashboardMetrics(data)
  const timeSeries = extractTimeSeries(data)
  const kpiComparison = extractDashboardKpis(data)

  return (
    <ReportLayout
      title="لوحة التحكم"
      description="اتجاه الأداء عبر الزمن ومؤشرات الفترة الحالية"
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
    >
      <ReportMetrics metrics={metrics} />

      {timeSeries.length >= 2 ? (
        <LineChart title="اتجاه الأداء عبر الزمن" data={timeSeries} unit="SP" />
      ) : (
        <BarChart
          title="مؤشرات الفترة"
          data={kpiComparison}
          unit="SP"
          emptyMessage="لا توجد بيانات زمنية أو مؤشرات للعرض"
        />
      )}
    </ReportLayout>
  )
}
