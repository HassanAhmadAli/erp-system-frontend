import { cn } from "@/lib/utils"

type Status = "متوفر" | "منخفض" | "نافد"

const styles: Record<Status, string> = {
  متوفر: "bg-[#33c16c] text-white",
  منخفض: "bg-[#f7d861] text-[#5f4b0b]",
  نافد: "bg-[#ef4f4f] text-white",
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
