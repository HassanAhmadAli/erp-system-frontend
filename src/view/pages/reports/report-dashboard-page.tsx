import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation(["common", "pages"])
  const { from, to, setFrom, setTo, range } = useReportDateRange()
  const { data, isLoading, isError } = useReportDashboard(range)

  const metrics = extractDashboardMetrics(data)
  const timeSeries = extractTimeSeries(data)
  const moneyKpis = extractDashboardMoneyKpis(data)
  const countKpis = extractDashboardCountKpis(data)

  return (
    <ReportLayout
      title={t("reports.dashboard", { ns: "pages" })}
      description={t("reports.dashboardReportDesc", { ns: "pages" })}
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
    >
      <ReportMetrics metrics={metrics} />

      {timeSeries.length >= 2 ? (
        <LineChart
          title={t("reports.performanceTrend", { ns: "pages" })}
          data={timeSeries}
          unit="SP"
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <BarChart
            title={t("reports.financialMetrics", { ns: "pages" })}
            data={moneyKpis}
            unit="SP"
            emptyMessage={t("reports.noFinancialMetrics", { ns: "pages" })}
          />
          <BarChart
            title={t("reports.numericMetrics", { ns: "pages" })}
            data={countKpis}
            emptyMessage={t("reports.noNumericMetrics", { ns: "pages" })}
          />
        </div>
      )}
    </ReportLayout>
  )
}
