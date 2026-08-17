import { Link } from "react-router-dom"
import { Menu, Settings } from "lucide-react"
import { useTranslation } from "react-i18next"

import { ThemeToggle } from "@/view/components/layout/theme-toggle"
import { cn } from "@/lib/utils"

type TopBarProps = {
  title: string
  className?: string
  onMenuClick?: () => void
}

export function TopBar({ title, className, onMenuClick }: TopBarProps) {
  const { t } = useTranslation("common")

  return (
    <header
      className={cn(
        "flex h-[60px] w-full shrink-0 items-center justify-between px-6 sm:px-10",
        "bg-[var(--erp-top-bar)] text-white shadow-[var(--erp-top-shadow)]",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={t("openMenu")}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white transition-colors hover:bg-white/25 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        )}
        <span className="truncate text-base font-semibold tracking-tight">
          {title}
        </span>
        <div
          className="size-[38px] shrink-0 rounded-full bg-white/20 ring-[3px] ring-white/35"
          aria-hidden
        />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          to="/settings"
          aria-label={t("settings")}
          title={t("settings")}
          className="inline-flex size-9 items-center justify-center rounded-xl bg-white/15 text-white transition-colors hover:bg-white/25"
        >
          <Settings className="size-4" />
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
