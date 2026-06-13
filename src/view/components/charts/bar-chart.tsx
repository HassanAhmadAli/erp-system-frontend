import { formatNumber } from "@/lib/report-parsers"
import type { ChartPoint } from "@/lib/report-parsers"

type BarChartProps = {
  title?: string
  data: ChartPoint[]
  unit?: string
  emptyMessage?: string
}

const COLORS = ["#4b22b5", "#7c5ce0", "#cdc9f7", "#f0ad34", "#9480f8"]

export function BarChart({
  title,
  data,
  unit = "",
  emptyMessage = "لا توجد بيانات للعرض",
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <section className="rounded-[20px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
        {title && (
          <h3 className="mb-4 text-center text-lg font-bold">{title}</h3>
        )}
        <p className="text-center text-sm text-[var(--erp-muted)]">
          {emptyMessage}
        </p>
      </section>
    )
  }

  const values = data.map((d) => d.value)
  const max = Math.max(...values, 0)
  const min = Math.min(...values, 0)
  const hasNegative = min < 0
  const range = Math.max(max - min, 1)

  return (
    <section className="rounded-[20px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
      {title && (
        <h3 className="mb-2 text-center text-lg font-bold text-[var(--erp-text)]">
          {title}
        </h3>
      )}

      <div className="mb-4 flex justify-between px-2 text-xs text-[var(--erp-muted)]">
        <span>{formatNumber(hasNegative ? min : 0, unit)}</span>
        <span>{formatNumber(max, unit)}</span>
      </div>

      <div
        className="relative flex items-end justify-center gap-2 overflow-x-auto pb-2 sm:gap-4"
        style={{ minHeight: 220 }}
      >
        {hasNegative && (
          <div
            className="pointer-events-none absolute right-0 left-0 border-t border-dashed border-[var(--erp-muted)]"
            style={{ bottom: `${(Math.abs(min) / range) * 180 + 20}px` }}
          />
        )}

        {data.map((point, index) => {
          const height = Math.max(
            4,
            Math.round((Math.abs(point.value) / range) * 180)
          )
          const color = COLORS[index % COLORS.length]

          return (
            <div
              key={`${point.label}-${index}`}
              className="flex max-w-[80px] min-w-[52px] flex-1 flex-col items-center gap-2"
            >
              <span className="text-xs font-medium text-[var(--erp-text)]">
                {formatNumber(point.value, unit)}
              </span>
              <div
                className="w-full max-w-[48px] rounded-t-xl transition-all"
                style={{
                  height,
                  backgroundColor: point.value < 0 ? "#d52b45" : color,
                }}
                title={`${point.label}: ${formatNumber(point.value, unit)}`}
              />
              <span className="line-clamp-2 text-center text-[10px] leading-tight text-[var(--erp-muted)]">
                {point.label}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
