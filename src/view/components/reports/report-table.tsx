import { useTranslation } from "react-i18next"

import { formatNumber, inferTableColumns, toNumber } from "@/lib/report-parsers"
import { formatDate, formatDateTime } from "@/utils/number-formatters"

type ReportTableProps = {
  title?: string
  rows: Record<string, unknown>[]
}

const DATE_COLUMN_KEYS = new Set([
  "createdAt",
  "updatedAt",
  "deletedAt",
  "invoiceDate",
  "sentAt",
  "date",
  "timestamp",
])

const ISO_DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function formatCell(value: unknown, columnKey: string) {
  if (value == null || value === "") return "—"

  if (typeof value === "string") {
    const trimmed = value.trim()

    if (DATE_ONLY_PATTERN.test(trimmed)) {
      return formatDate(trimmed)
    }

    if (
      ISO_DATE_TIME_PATTERN.test(trimmed) ||
      DATE_COLUMN_KEYS.has(columnKey)
    ) {
      const formatted = formatDateTime(trimmed)
      if (formatted !== "—") return formatted
    }
  }

  if (value instanceof Date) {
    return formatDateTime(value)
  }

  const num = toNumber(value)
  if (num !== null) return formatNumber(num)

  if (typeof value === "object") return JSON.stringify(value)

  return String(value)
}

export function ReportTable({ title, rows }: ReportTableProps) {
  const { t } = useTranslation("common")
  const columns = inferTableColumns(rows)

  if (rows.length === 0) {
    return (
      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-start text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        {title && (
          <h3 className="mb-4 text-xl font-semibold text-[var(--erp-text)]">
            {title}
          </h3>
        )}

        <div className="rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)] p-8 text-center">
          <p className="text-sm text-[var(--erp-muted)]">{t("noRows")}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-start text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      {title && (
        <h3 className="mb-5 text-xl font-semibold text-[var(--erp-text)]">
          {title}
        </h3>
      )}

      <div className="overflow-hidden rounded-2xl border border-[var(--erp-border)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-start text-sm">
            <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-3 py-3 font-medium">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-[var(--erp-border)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)]"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-3 py-3 text-[var(--erp-text)]"
                    >
                      <span className="block truncate">
                        {formatCell(row[col.key], col.key)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
