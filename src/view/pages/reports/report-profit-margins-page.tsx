import { useTranslation } from "react-i18next"

import { useProfitMargins } from "@/hooks/Financial/useFinancial"
import {
  extractLowProfitMargins,
  extractProfitMarginHistogram,
  extractProfitMarginMetrics,
  extractProfitMarginSeries,
  extractProfitMarginTierComposition,
  extractTopProfitMargins,
  profitMarginBarColor,
} from "@/lib/report-chart-data"
import { extractTableRows } from "@/lib/report-parsers"
import { BarChart } from "@/view/components/charts/bar-chart"
import { DonutChart } from "@/view/components/charts/donut-chart"
import { HorizontalBarChart } from "@/view/components/charts/horizontal-bar-chart"
import { ExportReportButton } from "@/view/components/reports/export-report-button"
import { ReportLayout } from "@/view/components/reports/report-layout"
import { ReportMetrics } from "@/view/components/reports/report-metrics"
import { ReportTable } from "@/view/components/reports/report-table"

export function ReportProfitMarginsPage() {
  const { t } = useTranslation(["common", "pages"])
  const { data, isLoading, isError } = useProfitMargins()

  const margins = extractProfitMarginSeries(data)
  const metrics = extractProfitMarginMetrics(margins)
  const topMargins = extractTopProfitMargins(margins, 10)
  const lowMargins = extractLowProfitMargins(margins, 10)
  const tierComposition = extractProfitMarginTierComposition(margins)
  const histogram = extractProfitMarginHistogram(margins)
  const rows = extractTableRows(data)

  return (
    <ReportLayout
      title={t("reports.profitMargins", { ns: "pages" })}
      description={t("reports.profitMarginsReportDesc", { ns: "pages" })}
      backTo="/reports"
      backLabel={t("reports.allReports", { ns: "pages" })}
      loading={isLoading}
      error={isError}
      actions={
        <ExportReportButton type="profit-margins" label={t("exportCsv")} />
      }
    >
      <ReportMetrics metrics={metrics} />

      <MarginLegend />

      <div className="grid gap-4 lg:grid-cols-2">
        <HorizontalBarChart
          title={t("reports.top10Margin", { ns: "pages" })}
          data={topMargins}
          unit="%"
          maxScale={100}
          maxItems={10}
          getBarColor={profitMarginBarColor}
          emptyMessage={t("reports.noMarginData", { ns: "pages" })}
        />

        <HorizontalBarChart
          title={t("reports.bottom10Margin", { ns: "pages" })}
          data={lowMargins}
          unit="%"
          maxScale={100}
          maxItems={10}
          getBarColor={profitMarginBarColor}
          emptyMessage={t("reports.noMarginData", { ns: "pages" })}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {tierComposition.length > 0 && (
          <DonutChart
            title={t("reports.marginDistribution", { ns: "pages" })}
            data={tierComposition}
            unit={t("reports.productUnit", { ns: "pages" })}
          />
        )}

        <BarChart
          title={t("reports.productsPerMarginRange", { ns: "pages" })}
          data={histogram}
          unit=""
          emptyMessage={t("reports.noMarginDistribution", { ns: "pages" })}
        />
      </div>

      <HorizontalBarChart
        title={t("reports.allProductsByMargin", { ns: "pages" })}
        data={margins}
        unit="%"
        maxScale={100}
        maxItems={20}
        getBarColor={profitMarginBarColor}
        emptyMessage={t("reports.noMarginData", { ns: "pages" })}
      />

      <ReportTable
        title={t("reports.productDetails", { ns: "pages" })}
        rows={rows}
      />
    </ReportLayout>
  )
}

function MarginLegend() {
  const { t } = useTranslation(["common", "pages"])

  const items = [
    { color: "#22a06b", label: t("reports.marginHigh", { ns: "pages" }) },
    { color: "#4b22b5", label: t("reports.marginMedium", { ns: "pages" }) },
    { color: "#f0ad34", label: t("reports.marginLow", { ns: "pages" }) },
    { color: "#d52b45", label: t("reports.marginNegative", { ns: "pages" }) },
  ]

  return (
    <section className="flex flex-wrap justify-end gap-4 rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] px-4 py-3 text-sm">
      <span className="text-[var(--erp-muted)]">
        {t("reports.colorLegend", { ns: "pages" })}
      </span>

      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-2">
          <span
            className="size-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />

          {item.label}
        </span>
      ))}
    </section>
  )
}
