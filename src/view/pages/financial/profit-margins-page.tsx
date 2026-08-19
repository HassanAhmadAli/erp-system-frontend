import { useTranslation } from "react-i18next"

import { useProfitMargins } from "@/hooks/Financial/useFinancial"
import {
  extractProfitMarginSeries,
  profitMarginBarColor,
} from "@/lib/report-chart-data"
import { extractTableRows } from "@/lib/report-parsers"
import { HorizontalBarChart } from "@/view/components/charts/horizontal-bar-chart"
import { ReportLayout } from "@/view/components/reports/report-layout"
import { ReportTable } from "@/view/components/reports/report-table"

export function ProfitMarginsPage() {
  const { t } = useTranslation(["common", "pages"])
  const { data, isLoading, isError } = useProfitMargins()

  const margins = extractProfitMarginSeries(data)
  const rows = extractTableRows(data)

  const average =
    margins.length > 0
      ? margins.reduce((sum, m) => sum + m.value, 0) / margins.length
      : 0

  return (
    <ReportLayout
      title={t("financial.profitMargins", { ns: "pages" })}
      description={t("financial.profitMarginsReportDesc", { ns: "pages" })}
      backTo="/financial"
      backLabel={t("financial.title", { ns: "pages" })}
      loading={isLoading}
      error={isError}
    >
      {margins.length > 0 && (
        <p className="rounded-xl bg-[var(--erp-nav-active-bg)] px-4 py-3 text-sm">
          {t("financial.averageMargin", { ns: "pages" })}{" "}
          <strong>{average.toFixed(1)}%</strong>
        </p>
      )}

      <HorizontalBarChart
        title={t("financial.marginPerProduct", { ns: "pages" })}
        data={margins}
        unit="%"
        maxScale={100}
        maxItems={15}
        getBarColor={profitMarginBarColor}
      />

      <ReportTable
        title={t("financial.productsTable", { ns: "pages" })}
        rows={rows}
      />
    </ReportLayout>
  )
}
