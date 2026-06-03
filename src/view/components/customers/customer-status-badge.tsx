export function CustomerStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={
        isActive
          ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
          : "rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
      }
    >
      {isActive ? "نشط" : "غير نشط"}
    </span>
  )
}