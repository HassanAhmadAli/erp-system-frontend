import { ThemeToggle } from "@/view/components/layout/theme-toggle"
import { cn } from "@/lib/utils"

type TopBarProps = {
  title: string
  className?: string
}

export function TopBar({ title, className }: TopBarProps) {
  return (
    <header
      className={cn(
        "flex h-[60px] w-full shrink-0 items-center justify-between px-6 sm:px-10",
        "bg-[var(--erp-top-bar)] text-white shadow-[var(--erp-top-shadow)]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-base font-semibold tracking-tight">{title}</span>
        <div
          className="size-[38px] shrink-0 rounded-full bg-white/20 ring-[3px] ring-white/35"
          aria-hidden
        />
      </div>

      <div className="shrink-0">
        <ThemeToggle />
      </div>
    </header>
  )
}