import type { ReactNode } from "react"

type CustomerSummaryCardProps = {
  label: string
  value: string | number
  icon: ReactNode
  tone: "green" | "red" | "blue" | "yellow"
}

export function CustomerSummaryCard({
  label,
  value,
  icon,
  tone,
}: CustomerSummaryCardProps) {
  const cardStyles = {
    green: "bg-green-500 text-white",
    red: "bg-red-500 text-white",
    blue: "bg-blue-500 text-white",
    yellow: "bg-yellow-400 text-slate-900",
  }

  return (
    <div className={`rounded-3xl p-5 shadow-sm ${cardStyles[tone]}`}>
      <div className="mb-4 flex justify-end">
        <div className="rounded-2xl bg-white/20 p-3">{icon}</div>
      </div>

      <p className="text-sm opacity-90">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}
