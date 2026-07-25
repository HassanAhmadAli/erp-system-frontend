import { useState } from "react"

import { useCostTrends } from "@/hooks/Financial/useFinancial"
import { extractTimeSeries } from "@/lib/report-chart-data"
import { extractTableRows } from "@/lib/report-parsers"
import { LineChart } from "@/view/components/charts/line-chart"
import { ReportLayout } from "@/view/components/reports/report-layout"
import { ReportTable } from "@/view/components/reports/report-table"

export function CostTrendsPage() {
  const [productId, setProductId] = useState("")

  const params = productId ? { productId: Number(productId) } : undefined
  const { data, isLoading, isError } = useCostTrends(params)

  const timeSeries = extractTimeSeries(data)
  const rows = extractTableRows(data)

  return (
    <ReportLayout
      title="اتجاهات التكلفة"
      description="تغير التكلفة عبر الزمن — مخطط خطي مرتب زمنياً"
      backTo="/financial"
      backLabel="التحليل المالي"
      loading={isLoading}
      error={isError}
      filters={
        <div className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-4 shadow-[var(--erp-shadow)]">
          <label className="flex max-w-xs flex-col gap-1.5 text-sm">
            <span className="font-medium text-[var(--erp-muted)]">
              معرف المنتج (اختياري)
            </span>
            <input
              type="number"
              className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-3 py-2 text-right text-sm text-[var(--erp-text)] transition outline-none focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"
              placeholder="مثال: 1"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </label>
        </div>
      }
    >
      <LineChart title="اتجاه التكلفة" data={timeSeries} unit="SP" />
      <ReportTable title="سجل التكاليف" rows={rows} />
    </ReportLayout>
  )
}
