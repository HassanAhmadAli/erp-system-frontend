import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { useCostTrends } from "@/hooks/Financial/useFinancial"
import { useReportDateRange } from "@/hooks/Reports/useReportDateRange"
import { extractCostTrendSeries } from "@/lib/report-chart-data"
import { extractTableRows } from "@/lib/report-parsers"
import type { CostTrendsParams } from "@/services/financial-service"
import { LineChart } from "@/view/components/charts/line-chart"
import { ProductSearchSelect } from "@/view/components/financial/product-search-select"
import { ReportDateFilter } from "@/view/components/reports/report-date-filter"
import { ReportLayout } from "@/view/components/reports/report-layout"
import { ReportTable } from "@/view/components/reports/report-table"

function toCostTrendsParams(
  productId: string,
  range: { from?: string; to?: string }
): CostTrendsParams {
  return {
    ...(productId ? { productId: Number(productId) } : {}),
    // Always send ISO dates so backends that filter `createdAt >= from AND <= to`
    // still return rows when the user has not picked a range.
    from: range.from ?? "2000-01-01T00:00:00.000Z",
    to: range.to ?? new Date().toISOString(),
  }
}

export function CostTrendsPage() {
  const { t } = useTranslation(["common", "pages"])
  const [productId, setProductId] = useState("")
  const { from, to, setFrom, setTo, range } = useReportDateRange()

  const params = useMemo(
    () => toCostTrendsParams(productId, range),
    [productId, range]
  )
  const { data, isLoading, isError } = useCostTrends(params)

  const timeSeries = extractCostTrendSeries(data)
  const rows = extractTableRows(data)

  return (
    <ReportLayout
      title={t("financial.costTrends", { ns: "pages" })}
      description={t("financial.costTrendsReportDesc", { ns: "pages" })}
      backTo="/financial"
      backLabel={t("financial.title", { ns: "pages" })}
      loading={isLoading}
      error={isError}
      filters={
        <div className="space-y-3">
          <ReportDateFilter
            from={from}
            to={to}
            onFromChange={setFrom}
            onToChange={setTo}
          />
          <div className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-4 shadow-[var(--erp-shadow)]">
            <ProductSearchSelect value={productId} onChange={setProductId} />
          </div>
        </div>
      }
    >
      <LineChart
        title={t("financial.costTrend", { ns: "pages" })}
        data={timeSeries}
        unit="SP"
      />
      <ReportTable
        title={t("financial.costLog", { ns: "pages" })}
        rows={rows}
      />
    </ReportLayout>
  )
}
