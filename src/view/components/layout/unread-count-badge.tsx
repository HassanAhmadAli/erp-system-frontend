import { cn } from "@/lib/utils"

type UnreadCountBadgeProps = {
  count: number
  className?: string
}

export function formatUnreadBadge(count: number) {
  if (count <= 0) return null
  return count > 99 ? "99+" : String(count)
}

export function UnreadCountBadge({ count, className }: UnreadCountBadgeProps) {
  const display = formatUnreadBadge(count)

  if (!display) return null

  return (
    <span
      className={cn(
        "absolute -end-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] leading-none font-semibold text-white",
        className
      )}
      aria-hidden
    >
      {display}
    </span>
  )
}
