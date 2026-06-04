export function CustomerInfoRow({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b pb-3 last:border-b-0">
      <span className="text-sm text-[var(--erp-muted)]">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
