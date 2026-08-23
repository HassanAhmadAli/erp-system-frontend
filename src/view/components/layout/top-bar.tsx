import { Link } from "react-router-dom"
import { Bell, Menu, Settings, UserRound } from "lucide-react"
import { useTranslation } from "react-i18next"

import { PERMISSIONS } from "@/auth/permissions"
import { useUnreadNotificationCount } from "@/hooks/Notifications/useNotifications"
import { usePermissions } from "@/hooks/usePermissions"
import { ThemeToggle } from "@/view/components/layout/theme-toggle"
import { UnreadCountBadge } from "@/view/components/layout/unread-count-badge"
import { AppLogo } from "@/view/components/layout/app-logo"
import { cn } from "@/lib/utils"

type TopBarProps = {
  title: string
  className?: string
  onMenuClick?: () => void
}

export function TopBar({ title, className, onMenuClick }: TopBarProps) {
  const { t } = useTranslation(["common", "nav"])
  const { can } = usePermissions()
  const { data: unreadCount = 0 } = useUnreadNotificationCount()
  const showNotifications = can(PERMISSIONS.NOTIFICATIONS_VIEW)

  return (
    <header
      className={cn(
        "flex h-[60px] w-full shrink-0 items-center justify-between px-6 sm:px-10",
        "bg-[var(--erp-top-bar)] text-white shadow-[var(--erp-top-shadow)] print:hidden",
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
        <AppLogo
          size={38}
          className="rounded-[10px] ring-[3px] ring-white/35"
        />
        <span className="truncate text-base font-semibold tracking-tight">
          {title}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {showNotifications && (
          <Link
            to="/notifications"
            aria-label={
              unreadCount > 0
                ? t("unreadNotificationsCount", {
                    ns: "common",
                    count: unreadCount,
                  })
                : t("nav:notifications")
            }
            title={t("nav:notifications")}
            className="relative inline-flex size-9 items-center justify-center rounded-xl bg-white/15 text-white transition-colors hover:bg-white/25"
          >
            <Bell className="size-4" />
            <UnreadCountBadge count={unreadCount} />
          </Link>
        )}
        <Link
          to="/profile"
          aria-label={t("profile")}
          title={t("profile")}
          className="inline-flex size-9 items-center justify-center rounded-xl bg-white/15 text-white transition-colors hover:bg-white/25"
        >
          <UserRound className="size-4" />
        </Link>
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
