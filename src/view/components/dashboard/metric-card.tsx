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
  const isHighlight = variant === "highlight"

  return (
    <article
      className={cn(
        "rounded-[20px] border p-5 shadow-[var(--erp-shadow)] transition-colors",
        isHighlight
          ? "border-transparent bg-[var(--erp-accent)] text-slate-950"
          : "border-[var(--erp-border)] bg-[var(--erp-card)] text-[var(--erp-text)]"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className={cn(
              "text-sm font-medium",
              isHighlight ? "text-slate-900/75" : "text-[var(--erp-muted)]"
            )}
          >
            {label}
          </p>

          <p
            className={cn(
              "mt-1 text-3xl leading-none font-bold",
              isHighlight ? "text-slate-950" : "text-[var(--erp-text)]"
            )}
          >
            {value}
            {unit && (
              <span className="ms-1 text-base font-semibold">{unit}</span>
            )}
          </p>
        </div>

        <div
          className={cn(
            "rounded-2xl p-3",
            isHighlight
              ? "bg-white/35 text-slate-950 ring-1 ring-black/10"
              : "bg-[var(--erp-brand)] text-white"
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </article>
  )
}
