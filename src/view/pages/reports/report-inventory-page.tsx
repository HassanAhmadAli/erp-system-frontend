import { useTranslation } from "react-i18next"

import { useReportInventory } from "@/hooks/Reports/useReports"
import { useReportDateRange } from "@/hooks/Reports/useReportDateRange"
import {
  extractInventoryMetrics,
  extractInventoryQuantityBars,
  extractInventoryStatusComposition,
} from "@/lib/report-chart-data"
import { extractTableRows } from "@/lib/report-parsers"
import { BarChart } from "@/view/components/charts/bar-chart"
import { DonutChart } from "@/view/components/charts/donut-chart"
import { ExportReportButton } from "@/view/components/reports/export-report-button"
import { ReportDateFilter } from "@/view/components/reports/report-date-filter"
import { ReportLayout } from "@/view/components/reports/report-layout"
import { ReportMetrics } from "@/view/components/reports/report-metrics"
import { ReportTable } from "@/view/components/reports/report-table"

export function ReportInventoryPage() {
  const { t } = useTranslation(["common", "pages"])
  const { from, to, setFrom, setTo, range } = useReportDateRange()
  const { data, isLoading, isError } = useReportInventory(range)

  const rows = extractTableRows(data)
  const quantityBars = extractInventoryQuantityBars(data)
  const statusComposition = extractInventoryStatusComposition(data)
  const metrics = extractInventoryMetrics(data)

  return (
    <ReportLayout
      title={t("reports.inventory", { ns: "pages" })}
      description={t("reports.inventoryReportDesc", { ns: "pages" })}
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
          type="inventory"
          label={t("exportCsv")}
          params={range}
        />
      }
    >
      <ReportMetrics metrics={metrics} />

      <div className="grid gap-4 lg:grid-cols-2">
        <BarChart
          title={t("reports.productQuantities", { ns: "pages" })}
          data={quantityBars}
        />
        <DonutChart
          title={t("reports.stockStatusDistribution", { ns: "pages" })}
          data={statusComposition}
        />
      </div>

      <ReportTable
        title={t("reports.productDetails", { ns: "pages" })}
        rows={rows}
      />
    </ReportLayout>
  )
}
