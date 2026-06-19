import { cn } from "@/lib/utils"

type Status = "متوفر" | "منخفض" | "نافد"

const styles: Record<Status, string> = {
  متوفر:
    "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  منخفض:
    "border border-amber-500/20 bg-amber-500/15 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  نافد: "border border-red-500/20 bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300",
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-16 items-center justify-center rounded-full px-3 py-1 text-xs font-semibold",
        styles[status]
      )}
    >
      {status}
    </span>
  )
}
