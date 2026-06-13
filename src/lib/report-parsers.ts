export type ChartPoint = {
  label: string
  value: number
}

export type MetricItem = {
  key: string
  label: string
  value: number
}

export type TableColumn = {
  key: string
  label: string
}

const METRIC_LABELS: Record<string, string> = {
  totalSales: "إجمالي المبيعات",
  sales: "المبيعات",
  totalPurchases: "إجمالي المشتريات",
  purchases: "المشتريات",
  totalExpenses: "المصروفات",
  expenses: "المصروفات",
  netProfit: "صافي الربح",
  profit: "الربح",
  revenue: "الإيرادات",
  discountsGiven: "الخصومات الممنوحة",
  grossProfit: "الربح الإجمالي",
  cost: "التكلفة",
  purchasingCosts: "تكاليف الشراء",
  operatingExpenses: "المصروفات التشغيلية",
  margin: "هامش الربح",
  profitMargin: "هامش الربح",
  negativeCount: "هوامش سالبة",
  marginPercent: "نسبة الهامش",
  quantity: "الكمية",
  count: "العدد",
  salesCount: "عدد المبيعات",
  ordersDelivered: "الطلبات المسلمة",
  pendingOrders: "الطلبات المعلقة",
  lowStockProducts: "منتجات منخفضة المخزون",
  totalProducts: "إجمالي المنتجات",
  total: "الإجمالي",
  amount: "المبلغ",
  lowStockCount: "منتجات منخفضة المخزون",
  outOfStockCount: "نفاد المخزون",
  inventoryValue: "قيمة المخزون",
  stockValue: "قيمة المخزون",
  invoiceCount: "عدد الفواتير",
  totalSpent: "إجمالي الإنفاق",
}

const SKIP_KEYS = new Set([
  "id",
  "data",
  "items",
  "rows",
  "products",
  "breakdown",
  "trends",
  "series",
  "period",
  "from",
  "to",
  "limit",
  "offset",
  "total",
  "isFinalPage",
])

export function toNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) return value
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value)
    return Number.isNaN(n) ? null : n
  }
  return null
}

export function formatMetricLabel(key: string): string {
  if (METRIC_LABELS[key]) return METRIC_LABELS[key]
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
}

export function formatNumber(value: number, unit = ""): string {
  const formatted = value.toLocaleString("ar-SY", {
    maximumFractionDigits: 2,
  })
  return unit ? `${formatted} ${unit}` : formatted
}

export function unwrapData(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload
  const obj = payload as Record<string, unknown>
  if (obj.data !== undefined) return unwrapData(obj.data)
  return payload
}

export function extractMetrics(payload: unknown): MetricItem[] {
  const data = unwrapData(payload)
  if (!data || typeof data !== "object") return []

  const metrics: MetricItem[] = []

  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SKIP_KEYS.has(key) || Array.isArray(value)) continue
    const num = toNumber(value)
    if (num !== null) {
      metrics.push({ key, label: formatMetricLabel(key), value: num })
    }
  }

  return metrics
}

function rowLabel(row: Record<string, unknown>): string {
  const candidates = [
    row.name,
    row.label,
    row.title,
    row.category,
    row.productName,
    row.date,
    row.period,
    row.month,
  ]

  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c
  }

  if (row.id != null) return `#${row.id}`
  return "—"
}

function rowValue(row: Record<string, unknown>): number | null {
  const candidates = [
    row.value,
    row.amount,
    row.total,
    row.margin,
    row.marginPercent,
    row.profit,
    row.cost,
    row.quantity,
    row.sales,
    row.revenue,
    row.count,
  ]

  for (const c of candidates) {
    const num = toNumber(c)
    if (num !== null) return num
  }

  return null
}

export function extractSeries(payload: unknown): ChartPoint[] {
  const data = unwrapData(payload)

  if (Array.isArray(data)) {
    return data
      .map((item) => {
        if (!item || typeof item !== "object") return null
        const row = item as Record<string, unknown>
        const value = rowValue(row)
        if (value === null) return null
        return { label: rowLabel(row), value }
      })
      .filter((p): p is ChartPoint => p !== null)
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>

    for (const key of [
      "series",
      "trends",
      "breakdown",
      "items",
      "rows",
      "products",
    ]) {
      if (Array.isArray(obj[key])) {
        return extractSeries(obj[key])
      }
    }

    const points: ChartPoint[] = []
    for (const [key, value] of Object.entries(obj)) {
      if (SKIP_KEYS.has(key) || Array.isArray(value)) continue
      const num = toNumber(value)
      if (num !== null) {
        points.push({ label: formatMetricLabel(key), value: num })
      }
    }
    return points
  }

  return []
}

export function extractTableRows(payload: unknown): Record<string, unknown>[] {
  const data = unwrapData(payload)

  if (Array.isArray(data)) {
    return data.filter((r) => r && typeof r === "object") as Record<
      string,
      unknown
    >[]
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>
    for (const key of [
      "items",
      "rows",
      "products",
      "breakdown",
      "invoices",
      "topProducts",
      "salesByCategory",
      "data",
    ]) {
      if (Array.isArray(obj[key])) {
        return obj[key] as Record<string, unknown>[]
      }
    }
  }

  return []
}

export function inferTableColumns(
  rows: Record<string, unknown>[]
): TableColumn[] {
  if (rows.length === 0) return []

  const keys = Object.keys(rows[0]).filter((k) => !k.startsWith("_"))
  return keys.map((key) => ({
    key,
    label: formatMetricLabel(key),
  }))
}

export function toApiDateRange(from: string, to: string) {
  return {
    from: from ? new Date(`${from}T00:00:00.000Z`).toISOString() : undefined,
    to: to ? new Date(`${to}T23:59:59.999Z`).toISOString() : undefined,
  }
}
