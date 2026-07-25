import { useReportDashboard } from "@/hooks/Reports/useReports"
import { useReportDateRange } from "@/hooks/Reports/useReportDateRange"
import {
  extractDashboardCountKpis,
  extractDashboardMetrics,
  extractDashboardMoneyKpis,
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
  const moneyKpis = extractDashboardMoneyKpis(data)
  const countKpis = extractDashboardCountKpis(data)

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
        <div className="grid gap-4 lg:grid-cols-2">
          <BarChart
            title="المؤشرات المالية"
            data={moneyKpis}
            unit="SP"
            emptyMessage="لا توجد بيانات مالية للعرض"
          />
          <BarChart
            title="المؤشرات العددية"
            data={countKpis}
            emptyMessage="لا توجد مؤشرات عددية للعرض"
          />
        </div>
      )}
    </ReportLayout>
  )
}
