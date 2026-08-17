import { useState } from "react"
import { useTranslation } from "react-i18next"

import { useCostTrends } from "@/hooks/Financial/useFinancial"
import { extractTimeSeries } from "@/lib/report-chart-data"
import { extractTableRows } from "@/lib/report-parsers"
import { LineChart } from "@/view/components/charts/line-chart"
import { ReportLayout } from "@/view/components/reports/report-layout"
import { ReportTable } from "@/view/components/reports/report-table"

export function CostTrendsPage() {
  const { t } = useTranslation(["common", "pages"])
  const [productId, setProductId] = useState("")

  const params = productId ? { productId: Number(productId) } : undefined
  const { data, isLoading, isError } = useCostTrends(params)

  const timeSeries = extractTimeSeries(data)
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
        <div className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-4 shadow-[var(--erp-shadow)]">
          <label className="flex max-w-xs flex-col gap-1.5 text-sm">
            <span className="font-medium text-[var(--erp-muted)]">
              {t("financial.productIdOptional", { ns: "pages" })}
            </span>
            <input
              type="number"
              className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-3 py-2 text-start text-sm text-[var(--erp-text)] transition outline-none focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"
              placeholder={t("financial.productIdPlaceholder", { ns: "pages" })}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </label>
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
