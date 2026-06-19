import type { ReactNode } from "react"

export function CustomerInfoCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <h2 className="mb-5 text-xl font-semibold text-[var(--erp-text)]">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}