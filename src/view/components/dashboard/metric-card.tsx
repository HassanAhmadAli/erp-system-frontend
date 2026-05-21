import type { ComponentType } from "react"

import { cn } from "@/lib/utils"

type MetricCardProps = {
  label: string
  value: string
  unit?: string
  icon: ComponentType<{ className?: string }>
  variant?: "default" | "highlight"
}

export function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  variant = "default",
}: MetricCardProps) {
  return (
    <article
      className={cn(
        "rounded-[20px] p-5 shadow-[var(--erp-shadow)]",
        variant === "highlight"
          ? "bg-[var(--erp-accent)]"
          : "bg-[var(--erp-card)]"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--erp-muted)]">{label}</p>
          <p className="mt-1 text-3xl leading-none font-bold text-[var(--erp-text)]">
            {value}
            {unit && (
              <span className="ms-1 text-base font-semibold">{unit}</span>
            )}
          </p>
        </div>
        <div className="rounded-2xl bg-[var(--erp-brand)] p-3 text-white">
          <Icon className="size-5" />
        </div>
      </div>
    </article>
  )
}
