import { useReportSummary } from "@/hooks/Reports/useReports"

import { useReportDateRange } from "@/hooks/Reports/useReportDateRange"

import {
  extractProfitComparison,
  extractRevenueCostComparison,
  extractSummaryCostComposition,
  extractSummaryFinancialMetrics,
  extractSummaryPeriodLabel,
  extractTimeSeries,
  isCompositionData,
} from "@/lib/report-chart-data"

import { extractTableRows } from "@/lib/report-parsers"

import { BarChart } from "@/view/components/charts/bar-chart"

import { DonutChart } from "@/view/components/charts/donut-chart"

import { LineChart } from "@/view/components/charts/line-chart"

import { ExportReportButton } from "@/view/components/reports/export-report-button"

import { ReportDateFilter } from "@/view/components/reports/report-date-filter"

import { ReportLayout } from "@/view/components/reports/report-layout"

import { ReportMetrics } from "@/view/components/reports/report-metrics"

import { ReportTable } from "@/view/components/reports/report-table"

export function ReportSummaryPage() {
  const { from, to, setFrom, setTo, range } = useReportDateRange()

  const { data, isLoading, isError } = useReportSummary(range)

  const metrics = extractSummaryFinancialMetrics(data)

  const revenueCostComparison = extractRevenueCostComparison(data)

  const profitComparison = extractProfitComparison(data)

  const costComposition = extractSummaryCostComposition(data)

  const timeSeries = extractTimeSeries(data)

  const breakdownRows = extractTableRows(data)

  const periodLabel = extractSummaryPeriodLabel(data)

  return (
    <ReportLayout
      title="ملخص مالي"
      description="إيرادات، تكاليف، مصروفات، وربحية الفترة المحددة"
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
        <ExportReportButton type="summary" label="تصدير CSV" params={range} />
      }
    >
      {periodLabel && (
        <p className="text-sm text-[var(--erp-muted)]">
          الفترة المعروضة: {periodLabel}
        </p>
      )}

      <ReportMetrics metrics={metrics} />

      <FinancialFlowNote metrics={metrics} />

      <div className="grid gap-4 lg:grid-cols-2">
        <BarChart
          title="الإيرادات مقابل التكاليف المباشرة"
          data={revenueCostComparison}
          unit="SP"
          emptyMessage="لا توجد بيانات للمبيعات أو المشتريات أو المصروفات"
        />

        <BarChart
          title="الربح الإجمالي وصافي الربح"
          data={profitComparison}
          unit="SP"
          emptyMessage="لا توجد بيانات ربحية للفترة"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {isCompositionData(costComposition) && (
          <DonutChart
            title="توزيع التكاليف والمصروفات"
            data={costComposition}
            unit="SP"
          />
        )}

        {timeSeries.length >= 2 && (
          <LineChart
            title="الاتجاه المالي عبر الفترة"
            data={timeSeries}
            unit="SP"
          />
        )}
      </div>

      {breakdownRows.length > 0 && (
        <ReportTable title="تفاصيل الفترة" rows={breakdownRows} />
      )}
    </ReportLayout>
  )
}

function FinancialFlowNote({
  metrics,
}: {
  metrics: ReturnType<typeof extractSummaryFinancialMetrics>
}) {
  const sales = metrics.find((m) => m.key === "totalSales")?.value

  const purchases = metrics.find((m) => m.key === "totalPurchases")?.value ?? 0

  const expenses = metrics.find((m) => m.key === "totalExpenses")?.value ?? 0

  const discounts = metrics.find((m) => m.key === "discountsGiven")?.value ?? 0

  const netProfit = metrics.find((m) => m.key === "netProfit")?.value

  if (sales == null || netProfit == null) return null

  return (
    <section className="rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] p-4 text-right text-sm leading-7 text-[var(--erp-muted)]">
      <p>
        <span className="font-medium text-[var(--erp-text)]">
          ملخص الحساب:{" "}
        </span>
        إجمالي المبيعات ({sales.toLocaleString("ar-SY")} SP) ناقص تكاليف الشراء
        ({purchases.toLocaleString("ar-SY")} SP) والمصروفات (
        {expenses.toLocaleString("ar-SY")} SP)
        {discounts > 0 &&
          ` والخصومات (${discounts.toLocaleString("ar-SY")} SP)`}{" "}
        يعطي صافي ربح تقريبي{" "}
        <span className="font-medium text-[var(--erp-text)]">
          {(sales - purchases - expenses - discounts).toLocaleString("ar-SY")}{" "}
          SP
        </span>
        {Math.abs(sales - purchases - expenses - discounts - netProfit) > 1 && (
          <>
            {" "}
            — القيمة المُبلّغة من النظام:{" "}
            <span className="font-medium text-[var(--erp-text)]">
              {netProfit.toLocaleString("ar-SY")} SP
            </span>
          </>
        )}
      </p>
    </section>
  )
}
