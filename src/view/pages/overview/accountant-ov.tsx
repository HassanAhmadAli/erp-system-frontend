import { Link } from "react-router-dom"
import { FileText, TrendingUp } from "lucide-react"
import { useTranslation } from "react-i18next"

import { useReportDashboard } from "@/hooks/Reports/useReports"
import {
  extractDashboardCountKpis,
  extractDashboardMoneyKpis,
  extractSummaryMetrics,
  extractTimeSeries,
} from "@/lib/report-chart-data"
import { BarChart } from "@/view/components/charts/bar-chart"
import { LineChart } from "@/view/components/charts/line-chart"
import { ReportHubCard } from "@/view/components/reports/report-layout"
import { ReportMetrics } from "@/view/components/reports/report-metrics"
import { Button } from "@/view/components/ui/button"

export function AccountantOverviewPage() {
  const { t } = useTranslation(["common", "pages"])
  const { data, isLoading, isError } = useReportDashboard()

  const metrics = extractSummaryMetrics(data)
  const timeSeries = extractTimeSeries(data)
  const moneyKpis = extractDashboardMoneyKpis(data)
  const countKpis = extractDashboardCountKpis(data)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-start">
          <h1 className="text-3xl font-bold">
            {t("overview.accountantTitle", { ns: "pages" })}
          </h1>
          <p className="text-[var(--erp-muted)]">
            {t("overview.accountantSubtitle", { ns: "pages" })}
          </p>
        </div>
        <Link to="/reports">
          <Button variant="outline" className="gap-2">
            <FileText className="size-4" />
            {t("reports.allReports", { ns: "pages" })}
          </Button>
        </Link>
      </header>

      {isLoading ? (
        <p className="text-[var(--erp-muted)]">{t("loading")}</p>
      ) : isError ? (
        <p className="text-red-500">
          {t("overview.loadDashboardFailed", { ns: "pages" })}
        </p>
      ) : (
        <>
          {metrics.length > 0 && <ReportMetrics metrics={metrics} />}

          {timeSeries.length >= 2 ? (
            <LineChart
              title={t("overview.performanceTrend", { ns: "pages" })}
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
        </>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">
          {t("overview.quickReports", { ns: "pages" })}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ReportHubCard
            title={t("reports.summary", { ns: "pages" })}
            description={t("overview.financialSummaryDesc", { ns: "pages" })}
            to="/reports/summary"
            icon={FileText}
          />
          <ReportHubCard
            title={t("financial.title", { ns: "pages" })}
            description={t("overview.financialAnalysisDesc", { ns: "pages" })}
            to="/financial"
            icon={TrendingUp}
          />
        </div>
      </section>
    </div>
  )
}
