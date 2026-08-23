import { useTranslation } from "react-i18next"

import { useReportSummary } from "@/hooks/Reports/useReports"
import { useReportDateRange } from "@/hooks/Reports/useReportDateRange"
import {
  extractProfitComparison,
  extractRevenueCostComparison,
  extractSummaryCostComposition,
  extractSummaryFinancialMetrics,
  extractSummaryPeriodLabel,
  extractTimeSeries,
} from "@/lib/report-chart-data"
import { extractTableRows } from "@/lib/report-parsers"
import { formatNumber } from "@/utils/number-formatters"
import { BarChart } from "@/view/components/charts/bar-chart"
import { LineChart } from "@/view/components/charts/line-chart"
import { ExportReportButton } from "@/view/components/reports/export-report-button"
import { ReportDateFilter } from "@/view/components/reports/report-date-filter"
import { ReportLayout } from "@/view/components/reports/report-layout"
import { ReportMetrics } from "@/view/components/reports/report-metrics"
import { ReportTable } from "@/view/components/reports/report-table"

export function ReportSummaryPage() {
  const { t } = useTranslation(["common", "pages"])
  const { from, to, setFrom, setTo, range } = useReportDateRange()
  const { data, isLoading, isError } = useReportSummary(range)

  const metrics = extractSummaryFinancialMetrics(data)
  const revenueCostComparison = extractRevenueCostComparison(data)
  const profitComparison = extractProfitComparison(data)
  const costComposition = extractSummaryCostComposition(data)
  const costCompositionRows = costComposition.map((point) => ({
    item: point.label,
    amount: point.value,
  }))
  const timeSeries = extractTimeSeries(data)
  const breakdownRows = extractTableRows(data)
  const periodLabel = extractSummaryPeriodLabel(data)

  return (
    <ReportLayout
      title={t("reports.summary", { ns: "pages" })}
      description={t("reports.summaryReportDesc", { ns: "pages" })}
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
          type="summary"
          label={t("exportCsv")}
          params={range}
        />
      }
    >
      {periodLabel && (
        <p className="text-sm text-[var(--erp-muted)]">
          {t("reports.displayPeriod", { ns: "pages", period: periodLabel })}
        </p>
      )}

      <ReportMetrics metrics={metrics} />

      <FinancialFlowNote metrics={metrics} />

      <div className="grid gap-4 lg:grid-cols-2">
        <BarChart
          title={t("reports.revenueVsDirectCosts", { ns: "pages" })}
          data={revenueCostComparison}
          unit="SP"
          emptyMessage={t("reports.noSalesPurchasesExpenses", { ns: "pages" })}
        />

        <BarChart
          title={t("reports.grossAndNetProfit", { ns: "pages" })}
          data={profitComparison}
          unit="SP"
          emptyMessage={t("reports.noProfitabilityData", { ns: "pages" })}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {costCompositionRows.length > 0 && (
          <ReportTable
            title={t("reports.costExpenseDistribution", { ns: "pages" })}
            rows={costCompositionRows}
          />
        )}

        {timeSeries.length >= 2 && (
          <LineChart
            title={t("reports.financialTrend", { ns: "pages" })}
            data={timeSeries}
            unit="SP"
          />
        )}
      </div>

      {breakdownRows.length > 0 && (
        <ReportTable
          title={t("reports.periodDetails", { ns: "pages" })}
          rows={breakdownRows}
        />
      )}
    </ReportLayout>
  )
}

function FinancialFlowNote({
  metrics,
}: {
  metrics: ReturnType<typeof extractSummaryFinancialMetrics>
}) {
  const { t } = useTranslation(["common", "pages"])

  const sales = metrics.find((m) => m.key === "totalSales")?.value
  const purchases = metrics.find((m) => m.key === "totalPurchases")?.value ?? 0
  const expenses = metrics.find((m) => m.key === "totalExpenses")?.value ?? 0
  const discounts = metrics.find((m) => m.key === "discountsGiven")?.value ?? 0
  const netProfit = metrics.find((m) => m.key === "netProfit")?.value

  if (sales == null || netProfit == null) return null

  const approximateProfit = sales - purchases - expenses - discounts

  return (
    <section className="rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] p-4 text-start text-sm leading-7 text-[var(--erp-muted)]">
      <p>
        <span className="font-medium text-[var(--erp-text)]">
          {t("reports.calculationSummary", { ns: "pages" })}{" "}
        </span>
        {t("reports.totalSales", { ns: "pages" })} ({formatNumber(sales)} SP) −{" "}
        {t("reports.totalPurchases", { ns: "pages" })} (
        {formatNumber(purchases)} SP) & {t("expenses.title", { ns: "pages" })} (
        {formatNumber(expenses)} SP)
        {discounts > 0 &&
          ` & ${t("discountLabel")} (${formatNumber(discounts)} SP)`}{" "}
        {t("reports.netProfitApprox", { ns: "pages" })}{" "}
        <span className="font-medium text-[var(--erp-text)]">
          {formatNumber(approximateProfit)} SP
        </span>
        {Math.abs(approximateProfit - netProfit) > 1 && (
          <>
            {" "}
            {t("reports.reportedValue", { ns: "pages" })}{" "}
            <span className="font-medium text-[var(--erp-text)]">
              {formatNumber(netProfit)} SP
            </span>
          </>
        )}
      </p>
    </section>
  )
}
