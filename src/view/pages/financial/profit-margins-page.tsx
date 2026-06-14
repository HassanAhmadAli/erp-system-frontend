import { useProfitMargins } from "@/hooks/Financial/useFinancial"
import { extractProfitMarginSeries } from "@/lib/report-chart-data"
import { extractTableRows } from "@/lib/report-parsers"
import { HorizontalBarChart } from "@/view/components/charts/horizontal-bar-chart"
import { ReportLayout } from "@/view/components/reports/report-layout"
import { ReportTable } from "@/view/components/reports/report-table"

export function ProfitMarginsPage() {
  const { data, isLoading, isError } = useProfitMargins()

  const margins = extractProfitMarginSeries(data)
  const rows = extractTableRows(data)

  const average =
    margins.length > 0
      ? margins.reduce((sum, m) => sum + m.value, 0) / margins.length
      : 0

  return (
    <ReportLayout
      title="هوامش الربح"
      description="نسب الهامش الفعلية لكل منتج — لا تُجمع كنسب مئوية لتوزيع دائري"
      backTo="/financial"
      backLabel="التحليل المالي"
      loading={isLoading}
      error={isError}
    >
      {margins.length > 0 && (
        <p className="rounded-xl bg-[var(--erp-nav-active-bg)] px-4 py-3 text-sm">
          متوسط الهامش: <strong>{average.toFixed(1)}%</strong>
        </p>
      )}

      <HorizontalBarChart
        title="هامش الربح لكل منتج"
        data={margins}
        unit="%"
        maxItems={15}
      />

      <ReportTable title="جدول المنتجات" rows={rows} />
    </ReportLayout>
  )
}
