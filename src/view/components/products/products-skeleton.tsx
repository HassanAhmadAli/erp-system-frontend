export function ProductsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-2xl bg-[var(--erp-card)]"
        />
      ))}
    </div>
  )
}
