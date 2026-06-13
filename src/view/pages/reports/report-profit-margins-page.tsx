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
      title="هوامش الربح"
      description="تحليل هامش الربح لكل منتج — أعلى وأدنى المنتجات وتوزيع مستويات الهامش"
      backTo="/reports"
      backLabel="كل التقارير"
      loading={isLoading}
      error={isError}
      actions={<ExportReportButton type="profit-margins" label="تصدير CSV" />}
    >
      <ReportMetrics metrics={metrics} />

      <MarginLegend />

      <div className="grid gap-4 lg:grid-cols-2">
        <HorizontalBarChart
          title="أعلى ١٠ منتجات بالهامش"
          data={topMargins}
          unit="%"
          maxScale={100}
          maxItems={10}
          getBarColor={profitMarginBarColor}
          emptyMessage="لا توجد بيانات هوامش للمنتجات"
        />

        <HorizontalBarChart
          title="أدنى ١٠ منتجات بالهامش"
          data={lowMargins}
          unit="%"
          maxScale={100}
          maxItems={10}
          getBarColor={profitMarginBarColor}
          emptyMessage="لا توجد بيانات هوامش للمنتجات"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {tierComposition.length > 0 && (
          <DonutChart
            title="توزيع المنتجات حسب مستوى الهامش"
            data={tierComposition}
            unit="منتج"
          />
        )}

        <BarChart
          title="عدد المنتجات في كل نطاق هامش"
          data={histogram}
          unit=""
          emptyMessage="لا توجد بيانات لتوزيع الهوامش"
        />
      </div>

      <HorizontalBarChart
        title="جميع المنتجات مرتبة حسب الهامش"
        data={margins}
        unit="%"
        maxScale={100}
        maxItems={20}
        getBarColor={profitMarginBarColor}
        emptyMessage="لا توجد بيانات هوامش للمنتجات"
      />

      <ReportTable title="تفاصيل المنتجات" rows={rows} />
    </ReportLayout>
  )
}

function MarginLegend() {
  const items = [
    { color: "#22a06b", label: "مرتفع (٣٠٪+)" },

    { color: "#4b22b5", label: "متوسط (١٠–٣٠٪)" },

    { color: "#f0ad34", label: "منخفض (٠–١٠٪)" },

    { color: "#d52b45", label: "سالب" },
  ]

  return (
    <section className="flex flex-wrap justify-end gap-4 rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] px-4 py-3 text-sm">
      <span className="text-[var(--erp-muted)]">دليل الألوان:</span>

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
