type ReportDateFilterProps = {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
}

export function ReportDateFilter({
  from,
  to,
  onFromChange,
  onToChange,
}: ReportDateFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-[var(--erp-muted)]">من تاريخ</span>
        <input
          type="date"
          className="rounded-xl border px-3 py-2"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-[var(--erp-muted)]">إلى تاريخ</span>
        <input
          type="date"
          className="rounded-xl border px-3 py-2"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
        />
      </label>
    </div>
  )
}
