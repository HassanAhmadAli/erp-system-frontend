import type { ChartPoint, MetricItem } from "@/lib/report-parsers"
import {
  extractTableRows,
  formatMetricLabel,
  toNumber,
  unwrapData,
} from "@/lib/report-parsers"
import {
  formatDate,
  formatId,
  toEnglishDigits,
} from "@/utils/number-formatters"

function labelText(value: unknown, fallback = "—") {
  if (value === null || value === undefined || value === "") {
    return fallback
  }

  return toEnglishDigits(String(value))
}

export function formatShortDate(value?: string | null): string {
  return formatDate(value)
}

export function getMetricUnit(key: string): string {
  if (
    key.includes("Percent") ||
    key.includes("Margin") ||
    key === "margin" ||
    key === "profitMargin"
  ) {
    return "%"
  }

  if (
    key === "count" ||
    key.includes("Count") ||
    key === "invoiceCount" ||
    key === "ordersDelivered" ||
    key === "pendingOrders" ||
    key === "totalProducts" ||
    key === "lowStockProducts" ||
    key === "negativeCount"
  ) {
    return ""
  }

  return "SYP"
}

/** Parts-of-a-whole only: non-negative values that sum to a positive total. */
export function isCompositionData(data: ChartPoint[]): boolean {
  if (data.length < 2) return false
  if (data.some((item) => item.value < 0)) return false

  const total = data.reduce((sum, item) => sum + item.value, 0)

  return total > 0
}

function pickFirstMetric(
  source: Record<string, unknown>,
  canonicalKey: string,
  aliases: string[]
): MetricItem | null {
  for (const key of aliases) {
    const num = toNumber(source[key])

    if (num !== null) {
      return {
        key: canonicalKey,
        label: formatMetricLabel(canonicalKey),
        value: num,
      }
    }
  }

  return null
}

export function extractSummaryMetrics(payload: unknown): MetricItem[] {
  return extractSummaryFinancialMetrics(payload)
}

/** Core financial KPIs only — no operational counts. */
export function extractSummaryFinancialMetrics(payload: unknown): MetricItem[] {
  const obj = unwrapData(payload)

  if (!obj || typeof obj !== "object") return []

  const source = obj as Record<string, unknown>

  return [
    pickFirstMetric(source, "totalSales", ["totalSales", "sales", "revenue"]),
    pickFirstMetric(source, "totalPurchases", ["totalPurchases", "purchases"]),
    pickFirstMetric(source, "totalExpenses", ["totalExpenses", "expenses"]),
    pickFirstMetric(source, "discountsGiven", ["discountsGiven"]),
    pickFirstMetric(source, "grossProfit", ["grossProfit"]),
    pickFirstMetric(source, "netProfit", ["netProfit", "profit"]),
  ].filter((metric): metric is MetricItem => metric !== null)
}

/** Bar chart: revenue vs direct costs. */
export function extractRevenueCostComparison(payload: unknown): ChartPoint[] {
  return extractSummaryFinancialMetrics(payload)
    .filter(
      (metric) =>
        metric.key === "totalSales" ||
        metric.key === "totalPurchases" ||
        metric.key === "totalExpenses"
    )
    .map((metric) => ({
      label: metric.label,
      value: metric.value,
    }))
}

/** Bar chart: profitability indicators only. */
export function extractProfitComparison(payload: unknown): ChartPoint[] {
  return extractSummaryFinancialMetrics(payload)
    .filter(
      (metric) => metric.key === "grossProfit" || metric.key === "netProfit"
    )
    .map((metric) => ({
      label: metric.label,
      value: metric.value,
    }))
}

export function extractSummaryPeriodLabel(payload: unknown): string | null {
  const obj = unwrapData(payload)

  if (!obj || typeof obj !== "object") return null

  const source = obj as Record<string, unknown>
  const period = source.period

  if (period && typeof period === "object") {
    const p = period as Record<string, unknown>
    const from = p.from ?? p.startDate ?? p.start
    const to = p.to ?? p.endDate ?? p.end

    if (from && to) {
      return `${formatShortDate(String(from))} — ${formatShortDate(String(to))}`
    }
  }

  if (typeof source.from === "string" && typeof source.to === "string") {
    return `${formatShortDate(source.from)} — ${formatShortDate(source.to)}`
  }

  return null
}

/** Bar chart: compare independent monetary totals. */
export function extractSummaryComparison(payload: unknown): ChartPoint[] {
  return extractRevenueCostComparison(payload).concat(
    extractProfitComparison(payload)
  )
}

/** Donut: cost/expense parts that form a whole. */
export function extractSummaryCostComposition(payload: unknown): ChartPoint[] {
  const fromArrays = extractCompositionBreakdown(payload)

  if (fromArrays.length > 0) return fromArrays

  const root = unwrapData(payload)

  if (!root || typeof root !== "object") return []

  const obj = root as Record<string, unknown>
  const expensesByCategory = Array.isArray(obj.expensesByCategory)
    ? obj.expensesByCategory
    : Array.isArray(obj.expenseBreakdown)
      ? obj.expenseBreakdown
      : null

  if (expensesByCategory) {
    const points = expensesByCategory
      .map((row) => {
        if (!row || typeof row !== "object") return null

        const item = row as Record<string, unknown>
        const value =
          toNumber(item.amount) ?? toNumber(item.total) ?? toNumber(item.value)

        if (value === null || value <= 0) return null

        return {
          label: labelText(item.category ?? item.name ?? item.label),
          value,
        }
      })
      .filter((point): point is ChartPoint => point !== null)

    if (isCompositionData(points)) return points
  }

  const mapped: ChartPoint[] = [
    {
      label: "تكاليف الشراء",
      value: toNumber(obj.purchasingCosts) ?? 0,
    },
    {
      label: "المصروفات التشغيلية",
      value: toNumber(obj.operatingExpenses) ?? 0,
    },
    {
      label: "الخصومات الممنوحة",
      value: toNumber(obj.discountsGiven) ?? 0,
    },
  ].filter((point) => point.value > 0)

  return isCompositionData(mapped) ? mapped : []
}

/** Donut: only expense/cost categories that form a breakdown. */
export function extractCompositionBreakdown(payload: unknown): ChartPoint[] {
  const root = unwrapData(payload)

  if (!root || typeof root !== "object") return []

  const obj = root as Record<string, unknown>
  const arrays = [
    obj.breakdown,
    obj.categories,
    obj.byCategory,
    obj.costBreakdown,
    obj.salesByCategory,
  ].filter(Array.isArray) as Record<string, unknown>[][]

  for (const arr of arrays) {
    const points = arr
      .map((row) => {
        const value =
          toNumber(row.amount) ??
          toNumber(row.total) ??
          toNumber(row.cost) ??
          toNumber(row.revenue) ??
          toNumber(row.value)

        if (value === null || value < 0) return null

        const label = labelText(
          row.category ?? row.name ?? row.label ?? row.type ?? row.status
        )

        return { label, value }
      })
      .filter((point): point is ChartPoint => point !== null)

    if (isCompositionData(points)) return points
  }

  return []
}

function parseDateSortKey(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") return null

  const time = new Date(value).getTime()

  return Number.isNaN(time) ? null : time
}

function rowDate(row: Record<string, unknown>): number | null {
  return (
    parseDateSortKey(row.date) ??
    parseDateSortKey(row.period) ??
    parseDateSortKey(row.month) ??
    parseDateSortKey(row.invoiceDate) ??
    parseDateSortKey(row.createdAt)
  )
}

function rowAmount(row: Record<string, unknown>): number | null {
  return (
    toNumber(row.amount) ??
    toNumber(row.total) ??
    toNumber(row.value) ??
    toNumber(row.sales) ??
    toNumber(row.revenue) ??
    toNumber(row.cost) ??
    toNumber(row.totalCost) ??
    toNumber(row.averageUnitCost) ??
    toNumber(row.totalSpent)
  )
}

/** Line chart: values over time, sorted chronologically. */
export function extractTimeSeries(payload: unknown): ChartPoint[] {
  const rows = extractTableRows(payload)
  const candidates =
    rows.length > 0
      ? rows
      : (() => {
        const obj = unwrapData(payload)

        if (!obj || typeof obj !== "object") return []

        const source = obj as Record<string, unknown>

        for (const key of ["trends", "series", "timeline", "history"]) {
          if (Array.isArray(source[key])) {
            return source[key] as Record<string, unknown>[]
          }
        }

        return []
      })()

  const points = candidates
    .map((row) => {
      const sortKey = rowDate(row)
      const value = rowAmount(row)

      if (sortKey === null || value === null) return null

      const rawDate =
        row.date ?? row.period ?? row.month ?? row.invoiceDate ?? row.createdAt

      return {
        label: formatShortDate(String(rawDate)),
        value,
        sortKey,
      }
    })
    .filter(
      (point): point is ChartPoint & { sortKey: number } => point !== null
    )
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ label, value }) => ({ label, value }))

  return points
}

export function extractProfitMarginSeries(payload: unknown): ChartPoint[] {
  const rows = extractTableRows(payload)

  return rows
    .map((row) => {
      let value =
        toNumber(row.marginPercent) ??
        toNumber(row.profitMargin) ??
        toNumber(row.marginPercentage) ??
        toNumber(row.margin)

      if (value === null) {
        const selling = toNumber(row.sellingPrice)
        const purchase = toNumber(row.purchasePrice ?? row.costPrice)

        if (selling !== null && purchase !== null && selling > 0) {
          value = ((selling - purchase) / selling) * 100
        }
      }

      if (value === null) return null

      const label = labelText(
        row.productName ??
        row.name ??
        `منتج #${formatId(String(row.productId ?? row.id ?? "?"))}`
      )

      return { label, value }
    })
    .filter((point): point is ChartPoint => point !== null)
    .sort((a, b) => b.value - a.value)
}

export function extractProfitMarginMetrics(
  margins: ChartPoint[]
): MetricItem[] {
  if (margins.length === 0) return []

  const values = margins.map((margin) => margin.value)
  const average = values.reduce((sum, value) => sum + value, 0) / values.length
  const highest = Math.max(...values)
  const lowest = Math.min(...values)
  const negativeCount = values.filter((value) => value < 0).length

  return [
    { key: "marginPercent", label: "متوسط الهامش", value: average },
    { key: "profitMargin", label: "أعلى هامش", value: highest },
    { key: "margin", label: "أدنى هامش", value: lowest },
    { key: "count", label: "عدد المنتجات", value: margins.length },
    { key: "negativeCount", label: "منتجات بهامش سالب", value: negativeCount },
  ]
}

export function extractTopProfitMargins(
  margins: ChartPoint[],
  count = 10
): ChartPoint[] {
  return margins.slice(0, count)
}

export function extractLowProfitMargins(
  margins: ChartPoint[],
  count = 10
): ChartPoint[] {
  return [...margins].sort((a, b) => a.value - b.value).slice(0, count)
}

/** Donut: how many products fall in each margin tier. */
export function extractProfitMarginTierComposition(
  margins: ChartPoint[]
): ChartPoint[] {
  const tiers = [
    { label: "هامش مرتفع (30%+)", count: 0 },
    { label: "هامش متوسط (10–30%)", count: 0 },
    { label: "هامش منخفض (0–10%)", count: 0 },
    { label: "هامش سالب", count: 0 },
  ]

  for (const margin of margins) {
    if (margin.value < 0) tiers[3].count += 1
    else if (margin.value >= 30) tiers[0].count += 1
    else if (margin.value >= 10) tiers[1].count += 1
    else tiers[2].count += 1
  }

  const points = tiers
    .filter((tier) => tier.count > 0)
    .map((tier) => ({ label: tier.label, value: tier.count }))

  return isCompositionData(points) ? points : []
}

/** Bar chart: product count per margin range. */
export function extractProfitMarginHistogram(
  margins: ChartPoint[]
): ChartPoint[] {
  const buckets = [
    { label: "هامش سالب", count: 0, match: (value: number) => value < 0 },
    {
      label: "0–10%",
      count: 0,
      match: (value: number) => value >= 0 && value < 10,
    },
    {
      label: "10–20%",
      count: 0,
      match: (value: number) => value >= 10 && value < 20,
    },
    {
      label: "20–30%",
      count: 0,
      match: (value: number) => value >= 20 && value < 30,
    },
    {
      label: "30% فأكثر",
      count: 0,
      match: (value: number) => value >= 30,
    },
  ]

  for (const margin of margins) {
    const bucket = buckets.find((item) => item.match(margin.value))

    if (bucket) {
      bucket.count += 1
    }
  }

  return buckets
    .filter((bucket) => bucket.count > 0)
    .map((bucket) => ({ label: bucket.label, value: bucket.count }))
}

export function profitMarginBarColor(value: number): string {
  if (value < 0) return "#d52b45"
  if (value >= 30) return "#22a06b"
  if (value >= 10) return "#4b22b5"

  return "#f0ad34"
}

export function extractCostBreakdownSeries(payload: unknown): ChartPoint[] {
  const rows = extractTableRows(payload)

  if (rows.length === 0) {
    const root = unwrapData(payload)

    if (root && typeof root === "object") {
      const obj = root as Record<string, unknown>
      const mapped: ChartPoint[] = [
        { label: "تكاليف الشراء", value: toNumber(obj.purchasingCosts) ?? 0 },
        {
          label: "المصروفات التشغيلية",
          value: toNumber(obj.operatingExpenses) ?? 0,
        },
        {
          label: "الخصومات الممنوحة",
          value: toNumber(obj.discountsGiven) ?? 0,
        },
      ].filter((point) => point.value > 0)

      if (mapped.length > 0) return mapped
    }

    return extractCompositionBreakdown(payload)
  }

  const points = rows
    .map((row) => {
      const value =
        toNumber(row.amount) ??
        toNumber(row.total) ??
        toNumber(row.cost) ??
        toNumber(row.value)

      if (value === null || value < 0) return null

      const label = labelText(
        row.category ?? row.name ?? row.label ?? row.type ?? row.source
      )

      return { label, value }
    })
    .filter((point): point is ChartPoint => point !== null)

  return points
}

export function extractInventoryQuantityBars(payload: unknown): ChartPoint[] {
  const rows = extractTableRows(payload)

  return rows
    .map((row) => {
      const value =
        toNumber(row.quantityInStock) ??
        toNumber(row.quantity) ??
        toNumber(row.stock) ??
        toNumber(row.value)

      if (value === null) return null

      const label = labelText(
        row.productName ?? row.name ?? `منتج #${formatId(String(row.id ?? "?"))}`
      )

      return { label, value }
    })
    .filter((point): point is ChartPoint => point !== null)
    .sort((a, b) => b.value - a.value)
    .slice(0, 12)
}

export function extractInventoryStatusComposition(
  payload: unknown
): ChartPoint[] {
  const obj = unwrapData(payload) as Record<string, unknown>

  if (!obj || typeof obj !== "object") return []

  const fromMetrics: ChartPoint[] = []
  const low = toNumber(obj.lowStockCount)
  const out = toNumber(obj.outOfStockCount)
  const inStock = toNumber(obj.inStockCount ?? obj.healthyStockCount)

  if (low !== null && low > 0) {
    fromMetrics.push({ label: "مخزون منخفض", value: low })
  }

  if (out !== null && out > 0) {
    fromMetrics.push({ label: "نفاد المخزون", value: out })
  }

  if (inStock !== null && inStock > 0) {
    fromMetrics.push({ label: "مخزون كافٍ", value: inStock })
  }

  if (isCompositionData(fromMetrics)) return fromMetrics

  const rows = extractTableRows(payload)
  const statusMap = new Map<string, number>()

  for (const row of rows) {
    const status = labelText(row.stockStatus ?? row.status, "")
    const qty =
      toNumber(row.quantityInStock) ??
      toNumber(row.quantity) ??
      toNumber(row.count) ??
      1

    if (!status) continue

    statusMap.set(status, (statusMap.get(status) ?? 0) + qty)
  }

  const fromRows = Array.from(statusMap.entries()).map(([label, value]) => ({
    label,
    value,
  }))

  return isCompositionData(fromRows) ? fromRows : []
}

type InvoiceLike = {
  id: string | number
  status?: string
  invoiceDate?: string
  totalAmount?: unknown
}

export function buildInvoiceCharts(invoices: InvoiceLike[]) {
  const timeSeries = [...invoices]
    .filter((invoice) => invoice.invoiceDate)
    .sort(
      (a, b) =>
        new Date(a.invoiceDate!).getTime() - new Date(b.invoiceDate!).getTime()
    )
    .map((invoice) => ({
      label: formatShortDate(invoice.invoiceDate),
      value: toNumber(invoice.totalAmount) ?? 0,
    }))

  const topByAmount = [...invoices]
    .sort(
      (a, b) => (toNumber(b.totalAmount) ?? 0) - (toNumber(a.totalAmount) ?? 0)
    )
    .slice(0, 10)
    .map((invoice) => ({
      label: `#${formatId(invoice.id)}`,
      value: toNumber(invoice.totalAmount) ?? 0,
    }))

  const statusAmounts = new Map<string, number>()
  const statusCounts = new Map<string, number>()

  for (const invoice of invoices) {
    const status = labelText(invoice.status, "غير محدد")
    const amount = toNumber(invoice.totalAmount) ?? 0

    statusAmounts.set(status, (statusAmounts.get(status) ?? 0) + amount)
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1)
  }

  const statusByAmount: ChartPoint[] = Array.from(statusAmounts.entries()).map(
    ([label, value]) => ({ label, value })
  )

  const statusByCount: ChartPoint[] = Array.from(statusCounts.entries()).map(
    ([label, value]) => ({ label, value })
  )

  return { timeSeries, topByAmount, statusByAmount, statusByCount }
}

export function extractDashboardKpis(payload: unknown): ChartPoint[] {
  const root = unwrapData(payload)

  if (!root || typeof root !== "object") return []

  const obj = root as Record<string, unknown>
  const salesToday = (obj.salesToday ?? {}) as Record<string, unknown>

  return [
    { label: "المبيعات اليوم", value: toNumber(salesToday.revenue) ?? 0 },
    { label: "طلبات معلقة", value: toNumber(obj.pendingOrders) ?? 0 },
    { label: "منتجات منخفضة", value: toNumber(obj.lowStockProducts) ?? 0 },
    { label: "عدد مبيعات اليوم", value: toNumber(salesToday.count) ?? 0 },
  ]
}

export function extractDashboardMetrics(payload: unknown): MetricItem[] {
  const root = unwrapData(payload)

  if (!root || typeof root !== "object") return []

  const obj = root as Record<string, unknown>
  const salesToday = (obj.salesToday ?? {}) as Record<string, unknown>

  return [
    {
      key: "totalSales",
      label: formatMetricLabel("totalSales"),
      value: toNumber(salesToday.revenue) ?? 0,
    },
    {
      key: "salesCount",
      label: formatMetricLabel("salesCount"),
      value: toNumber(salesToday.count) ?? 0,
    },
    {
      key: "pendingOrders",
      label: formatMetricLabel("pendingOrders"),
      value: toNumber(obj.pendingOrders) ?? 0,
    },
    {
      key: "lowStockProducts",
      label: formatMetricLabel("lowStockProducts"),
      value: toNumber(obj.lowStockProducts) ?? 0,
    },
  ]
}

export function extractInventoryMetrics(payload: unknown): MetricItem[] {
  const root = unwrapData(payload)

  if (!root || typeof root !== "object") return []

  const obj = root as Record<string, unknown>

  return [
    {
      key: "totalProducts",
      label: formatMetricLabel("totalProducts"),
      value: toNumber(obj.totalProducts) ?? 0,
    },
    {
      key: "lowStockCount",
      label: formatMetricLabel("lowStockCount"),
      value: toNumber(obj.lowStockCount) ?? 0,
    },
    {
      key: "outOfStockCount",
      label: formatMetricLabel("outOfStockCount"),
      value: toNumber(obj.outOfStockCount) ?? 0,
    },
    {
      key: "stockValue",
      label: formatMetricLabel("stockValue"),
      value: toNumber(obj.stockValue) ?? 0,
    },
  ]
}

export function extractSupplierReportMetrics(payload: unknown): MetricItem[] {
  const root = unwrapData(payload)

  if (!root || typeof root !== "object") return []

  const obj = root as Record<string, unknown>

  return [
    {
      key: "invoiceCount",
      label: formatMetricLabel("invoiceCount"),
      value: toNumber(obj.invoiceCount) ?? 0,
    },
    {
      key: "totalSpent",
      label: formatMetricLabel("totalSpent"),
      value: toNumber(obj.totalSpent) ?? 0,
    },
  ]
}