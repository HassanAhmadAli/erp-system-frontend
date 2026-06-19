import type { ReactNode } from "react"

type CustomerSummaryCardProps = {
  label: string
  value: string | number
  icon: ReactNode
  tone: "green" | "red" | "blue" | "yellow"
}

const cardStyles: Record<CustomerSummaryCardProps["tone"], string> = {
  green:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  red: "border-red-500/20 bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  blue: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  yellow:
    "border-amber-500/20 bg-amber-500/15 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
}

export function CustomerSummaryCard({
  label,
  value,
  icon,
  tone,
}: CustomerSummaryCardProps) {
  return (
    <div
      className={`rounded-3xl border p-5 shadow-[var(--erp-shadow)] ${cardStyles[tone]}`}
    >
      <div className="mb-4 flex justify-end">
        <div className="rounded-2xl bg-current/10 p-3">{icon}</div>
      </div>

      <p className="text-sm font-medium opacity-85">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}