type ReportDateFilterProps = {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
}

const inputClass =
  "rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-3 py-2 text-sm text-[var(--erp-text)] outline-none transition focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

export function ReportDateFilter({
  from,
  to,
  onFromChange,
  onToChange,
}: ReportDateFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-4 shadow-[var(--erp-shadow)]">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-[var(--erp-muted)]">من تاريخ</span>
        <input
          type="date"
          className={inputClass}
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-[var(--erp-muted)]">إلى تاريخ</span>
        <input
          type="date"
          className={inputClass}
          value={to}
          onChange={(e) => onToChange(e.target.value)}
        />
      </label>
    </div>
  )
}
