import { formatNumber, inferTableColumns, toNumber } from "@/lib/report-parsers"

type ReportTableProps = {
  title?: string
  rows: Record<string, unknown>[]
}

export function ReportTable({ title, rows }: ReportTableProps) {
  const columns = inferTableColumns(rows)

  if (rows.length === 0) {
    return (
      <section className="rounded-[20px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
        {title && <h3 className="mb-3 text-lg font-bold">{title}</h3>}
        <p className="text-sm text-[var(--erp-muted)]">لا توجد صفوف لعرضها</p>
      </section>
    )
  }

  function formatCell(value: unknown) {
    const num = toNumber(value)
    if (num !== null) return formatNumber(num)
    if (value == null) return "—"
    if (typeof value === "object") return JSON.stringify(value)
    return String(value)
  }

  return (
    <section className="overflow-hidden rounded-[20px] bg-[var(--erp-card)] shadow-[var(--erp-shadow)]">
      {title && (
        <h3 className="border-b px-5 py-4 text-lg font-bold text-[var(--erp-text)]">
          {title}
        </h3>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-right">
          <thead className="bg-[var(--erp-page)] text-sm text-[var(--erp-muted)]">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-medium">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-[var(--erp-border)]">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-sm text-[var(--erp-text)]"
                  >
                    {formatCell(row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
