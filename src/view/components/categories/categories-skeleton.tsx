export function CategoriesSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)]"
        />
      ))}
    </div>
  )
}