import type { ReactNode } from "react"

export function CustomerInfoCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}
