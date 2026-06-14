import type { ChartPoint } from "@/lib/report-parsers"
import { formatNumber } from "@/lib/report-parsers"

type LineChartProps = {
  title?: string
  data: ChartPoint[]
  unit?: string
}

export function LineChart({ title, data, unit = "" }: LineChartProps) {
  if (data.length === 0) {
    return (
      <section className="rounded-[20px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
        {title && <h3 className="mb-4 text-lg font-bold">{title}</h3>}
        <p className="text-sm text-[var(--erp-muted)]">
          لا توجد بيانات زمنية للعرض
        </p>
      </section>
    )
  }

  if (data.length === 1) {
    return (
      <section className="rounded-[20px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
        {title && <h3 className="mb-4 text-lg font-bold">{title}</h3>}
        <p className="text-center text-sm text-[var(--erp-muted)]">
          نقطة واحدة فقط: {data[0].label} — {formatNumber(data[0].value, unit)}
        </p>
      </section>
    )
  }

  const width = Math.max(600, data.length * 72)
  const height = 240
  const padding = { top: 24, right: 24, bottom: 48, left: 48 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const values = data.map((d) => d.value)
  const max = Math.max(...values, 0)
  const min = Math.min(...values, 0)
  const yMin = min < 0 ? min : 0
  const yMax = max <= 0 ? 1 : max
  const yRange = yMax - yMin || 1

  const points = data.map((point, i) => {
    const x =
      padding.left +
      (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW)
    const y = padding.top + chartH - ((point.value - yMin) / yRange) * chartH
    return { ...point, x, y }
  })

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ")
  const area = [
    `${points[0].x},${padding.top + chartH}`,
    ...points.map((p) => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${padding.top + chartH}`,
  ].join(" ")

  const zeroY =
    yMin < 0
      ? padding.top + chartH - ((0 - yMin) / yRange) * chartH
      : padding.top + chartH

  return (
    <section className="rounded-[20px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
      {title && (
        <h3 className="mb-4 text-lg font-bold text-[var(--erp-text)]">
          {title}
        </h3>
      )}

      <div className="mb-2 flex justify-between text-xs text-[var(--erp-muted)]">
        <span>الأعلى: {formatNumber(yMax, unit)}</span>
        <span>الأدنى: {formatNumber(yMin, unit)}</span>
      </div>

      <div className="overflow-x-auto">
        <svg width={width} height={height} className="mx-auto">
          <defs>
            <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4b22b5" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4b22b5" stopOpacity="0" />
            </linearGradient>
          </defs>

          <line
            x1={padding.left}
            y1={zeroY}
            x2={width - padding.right}
            y2={zeroY}
            stroke="var(--erp-muted)"
            strokeOpacity={0.3}
            strokeDasharray="4 4"
          />

          <polygon points={area} fill="url(#lineFill)" />
          <polyline
            points={polyline}
            fill="none"
            stroke="#4b22b5"
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={5} fill="#4b22b5" />
              <text
                x={p.x}
                y={height - 12}
                textAnchor="middle"
                className="fill-[var(--erp-muted)] text-[10px]"
              >
                {p.label.length > 12 ? `${p.label.slice(0, 10)}…` : p.label}
              </text>
              <title>
                {p.label}: {formatNumber(p.value, unit)}
              </title>
            </g>
          ))}
        </svg>
      </div>
    </section>
  )
}
