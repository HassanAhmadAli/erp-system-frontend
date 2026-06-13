import { formatNumber } from "@/lib/report-parsers"
import type { ChartPoint } from "@/lib/report-parsers"

type HorizontalBarChartProps = {
  title?: string
  data: ChartPoint[]
  unit?: string
  maxItems?: number
  /** When set, bar width is value / maxScale (e.g. 50% margin → half bar at maxScale=100). */
  maxScale?: number
  getBarColor?: (value: number) => string
  emptyMessage?: string
}

export function HorizontalBarChart({
  title,
  data,
  unit = "",
  maxItems = 10,
  maxScale,
  getBarColor,
  emptyMessage = "لا توجد بيانات للعرض",
}: HorizontalBarChartProps) {
  const items = data.slice(0, maxItems)

  if (items.length === 0) {
    return (
      <section className="rounded-[20px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
        {title && <h3 className="mb-4 text-lg font-bold">{title}</h3>}
        <p className="text-sm text-[var(--erp-muted)]">{emptyMessage}</p>
      </section>
    )
  }

  const relativeMax = Math.max(...items.map((d) => Math.abs(d.value)), 1)

  function barWidth(value: number): number {
    const absValue = Math.abs(value)

    if (maxScale != null && maxScale > 0) {
      return Math.max(2, Math.min(100, Math.round((absValue / maxScale) * 100)))
    }

    return Math.max(4, Math.round((absValue / relativeMax) * 100))
  }

  return (
    <section className="rounded-[20px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
      {title && (
        <h3 className="mb-4 text-lg font-bold text-[var(--erp-text)]">
          {title}
        </h3>
      )}

      {maxScale != null && (
        <div className="mb-3 flex justify-between px-1 text-xs text-[var(--erp-muted)]">
          <span>٠{unit}</span>
          <span>{formatNumber(maxScale, unit)}</span>
        </div>
      )}

      <ul className="space-y-3">
        {items.map((point, index) => {
          const width = barWidth(point.value)
          const barColor = getBarColor?.(point.value) ?? "var(--erp-brand)"

          return (
            <li key={`${point.label}-${index}`}>
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-[var(--erp-text)]">
                  {point.label}
                </span>
                <span
                  className="shrink-0 font-semibold"
                  style={{ color: barColor }}
                >
                  {formatNumber(point.value, unit)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[var(--erp-page)]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${width}%`, backgroundColor: barColor }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
