import { formatNumber } from "@/lib/report-parsers"
import type { ChartPoint } from "@/lib/report-parsers"

type BarChartProps = {
  title?: string
  data: ChartPoint[]
  unit?: string
  emptyMessage?: string
}

const COLORS = ["#4b22b5", "#7c5ce0", "#cdc9f7", "#f0ad34", "#9480f8"]
const PLOT_HEIGHT = 180

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

  // Keep a full plot height even when max is 0 so bars stay on the baseline.
  const positiveSpace = hasNegative
    ? (Math.max(max, 0) / range) * PLOT_HEIGHT
    : PLOT_HEIGHT
  const negativeSpace = hasNegative
    ? (Math.abs(Math.min(min, 0)) / range) * PLOT_HEIGHT
    : 0
  const plotHeight = positiveSpace + negativeSpace
  const zeroOffset = negativeSpace

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

      <div className="relative flex items-end justify-center gap-2 overflow-x-auto pb-2 sm:gap-4">
        {hasNegative && (
          <div
            className="pointer-events-none absolute right-0 left-0 border-t border-dashed border-[var(--erp-muted)]"
            style={{ bottom: `${zeroOffset}px` }}
          />
        )}

        {data.map((point, index) => {
          const color = COLORS[index % COLORS.length]
          const isNegative = point.value < 0
          const barHeight =
            point.value === 0
              ? 0
              : Math.max(
                  4,
                  Math.round((Math.abs(point.value) / range) * PLOT_HEIGHT)
                )

          return (
            <div
              key={`${point.label}-${index}`}
              className="flex max-w-[80px] min-w-[52px] flex-1 flex-col items-center gap-2"
            >
              <span className="text-xs font-medium text-[var(--erp-text)]">
                {formatNumber(point.value, unit)}
              </span>

              <div className="relative w-full" style={{ height: plotHeight }}>
                {!isNegative && barHeight > 0 && (
                  <div
                    className="absolute left-1/2 w-full max-w-[48px] -translate-x-1/2 rounded-t-xl transition-all"
                    style={{
                      height: barHeight,
                      bottom: zeroOffset,
                      backgroundColor: color,
                    }}
                    title={`${point.label}: ${formatNumber(point.value, unit)}`}
                  />
                )}

                {isNegative && barHeight > 0 && (
                  <div
                    className="absolute left-1/2 w-full max-w-[48px] -translate-x-1/2 rounded-b-xl transition-all"
                    style={{
                      height: barHeight,
                      top: positiveSpace,
                      backgroundColor: "#d52b45",
                    }}
                    title={`${point.label}: ${formatNumber(point.value, unit)}`}
                  />
                )}
              </div>

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
