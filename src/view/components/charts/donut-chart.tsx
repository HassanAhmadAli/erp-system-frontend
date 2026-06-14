import { formatNumber } from "@/lib/report-parsers"
import type { ChartPoint } from "@/lib/report-parsers"
import { isCompositionData } from "@/lib/report-chart-data"

type DonutChartProps = {
  title?: string
  data: ChartPoint[]
  unit?: string
  /** When true, values are already percentages (0–100) — show as labels only, no slice %. */
  valuesArePercentages?: boolean
}

const COLORS = [
  "#4b22b5",
  "#f0ad34",
  "#7c5ce0",
  "#cdc9f7",
  "#9480f8",
  "#d52b45",
]

function buildSlices(data: ChartPoint[]) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  let cumulative = 0

  return data.map((point, i) => {
    const fraction = total > 0 ? point.value / total : 0
    const start = cumulative
    cumulative += fraction
    return {
      ...point,
      fraction,
      start,
      end: cumulative,
      color: COLORS[i % COLORS.length],
    }
  })
}

function slicePath(
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number
) {
  if (end - start >= 1) {
    end = start + 0.9999
  }

  const startAngle = start * 2 * Math.PI - Math.PI / 2
  const endAngle = end * 2 * Math.PI - Math.PI / 2
  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy + r * Math.sin(endAngle)
  const largeArc = end - start > 0.5 ? 1 : 0

  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
}

function formatPercent(fraction: number) {
  return `${(fraction * 100).toFixed(1)}%`
}

export function DonutChart({
  title,
  data,
  unit = "",
  valuesArePercentages = false,
}: DonutChartProps) {
  if (data.length === 0) {
    return (
      <section className="rounded-[20px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
        {title && <h3 className="mb-4 text-lg font-bold">{title}</h3>}
        <p className="text-sm text-[var(--erp-muted)]">لا توجد بيانات للعرض</p>
      </section>
    )
  }

  if (!valuesArePercentages && !isCompositionData(data)) {
    return (
      <section className="rounded-[20px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
        {title && <h3 className="mb-4 text-lg font-bold">{title}</h3>}
        <p className="text-sm text-[var(--erp-muted)]">
          المخطط الدائري يُستخدم فقط عندما تمثل القيم أجزاءً من إجمالي واحد (مثل
          توزيع التكاليف أو الحالات). استخدم المخطط الشريطي للمقارنة بين قيم
          مستقلة.
        </p>
      </section>
    )
  }

  const slices = buildSlices(data)
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <section className="rounded-[20px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
      {title && (
        <h3 className="mb-4 text-lg font-bold text-[var(--erp-text)]">
          {title}
        </h3>
      )}

      <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-center">
        <div className="relative">
          <svg width={200} height={200} viewBox="0 0 200 200">
            {slices.map((slice, i) => (
              <path
                key={i}
                d={slicePath(100, 100, 90, slice.start, slice.end)}
                fill={slice.color}
              />
            ))}
            <circle cx={100} cy={100} r={52} fill="var(--erp-card)" />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-[var(--erp-muted)]">الإجمالي</span>
            <span className="text-lg font-bold text-[var(--erp-text)]">
              {formatNumber(total, unit)}
            </span>
          </div>
        </div>

        <ul className="w-full max-w-sm space-y-2">
          {slices.map((slice, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-[var(--erp-text)]">{slice.label}</span>
              </div>
              <span className="font-medium text-[var(--erp-muted)]">
                {formatNumber(slice.value, unit)}
                {!valuesArePercentages && ` (${formatPercent(slice.fraction)})`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
