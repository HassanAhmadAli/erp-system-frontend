import { Link } from "react-router-dom"
import { FileText, TrendingUp } from "lucide-react"

import { useReportDashboard } from "@/hooks/Reports/useReports"
import {
  extractDashboardKpis,
  extractSummaryMetrics,
  extractTimeSeries,
} from "@/lib/report-chart-data"
import { BarChart } from "@/view/components/charts/bar-chart"
import { LineChart } from "@/view/components/charts/line-chart"
import { ReportHubCard } from "@/view/components/reports/report-layout"
import { ReportMetrics } from "@/view/components/reports/report-metrics"
import { Button } from "@/view/components/ui/button"

export function AccountantOverviewPage() {
  const { data, isLoading, isError } = useReportDashboard()

  const metrics = extractSummaryMetrics(data)
  const timeSeries = extractTimeSeries(data)
  const kpiComparison = extractDashboardKpis(data)

  return (
    <div className="space-y-6" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-right">
          <h1 className="text-3xl font-bold">نظرة عامة — المحاسب</h1>
          <p className="text-[var(--erp-muted)]">
            ملخص مالي سريع مع مخططات دقيقة
          </p>
        </div>
        <Link to="/reports">
          <Button variant="outline" className="gap-2">
            <FileText className="size-4" />
            كل التقارير
          </Button>
        </Link>
      </header>

      {isLoading ? (
        <p className="text-[var(--erp-muted)]">جاري تحميل البيانات...</p>
      ) : isError ? (
        <p className="text-red-500">تعذر تحميل لوحة التقارير</p>
      ) : (
        <>
          {metrics.length > 0 && <ReportMetrics metrics={metrics} />}

          {timeSeries.length >= 2 ? (
            <LineChart title="اتجاه الأداء" data={timeSeries} unit="SP" />
          ) : (
            <BarChart title="مؤشرات الفترة" data={kpiComparison} unit="SP" />
          )}
        </>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">تقارير سريعة</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ReportHubCard
            title="ملخص مالي"
            description="المبيعات والمشتريات والربح"
            to="/reports/summary"
            icon={FileText}
          />
          <ReportHubCard
            title="التحليل المالي"
            description="هوامش الربح وتفصيل التكاليف"
            to="/financial"
            icon={TrendingUp}
          />
        </div>
      </section>
    </div>
  )
}
