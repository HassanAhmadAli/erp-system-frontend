import type { ComponentType } from "react"

import { Bell, Boxes, Home, LogOut, Settings, Truck, Users } from "lucide-react"
import { NavLink } from "react-router-dom"

import { cn } from "@/lib/utils"

type NavItemProps = {
  icon: ComponentType<{ className?: string }>
  label: string
  to: string
  showDot?: boolean
}

function SidebarNavItem({ icon: Icon, label, to, showDot }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={to === "/dashboard"}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
          "text-[var(--erp-muted)]",
          isActive &&
            "bg-[var(--erp-nav-active-bg)] text-[var(--erp-brand-solid)] [&_svg]:text-[var(--erp-brand-solid)]"
        )
      }
    >
      <span className="min-w-0 flex-1 text-right">{label}</span>
      <span className="relative inline-flex shrink-0">
        <Icon className="size-[18px] text-current" aria-hidden />
        {showDot && (
          <span className="absolute -start-1 -top-1 size-2 rounded-full bg-[#e54545]" />
        )}
      </span>
    </NavLink>
  )
}

/** Fixed visual-right rail (RTL): lavender background, pills for active route */
export function AppSidebar() {
  return (
    <aside
      className={cn(
        "flex w-[min(288px,100%)] shrink-0 flex-col border-e border-[var(--erp-sidebar-divider)] bg-[var(--erp-sidebar)] px-5 py-6 sm:w-[276px]",
        "min-h-[calc(100svh-60px)]"
      )}
    >
      <nav className="flex flex-1 flex-col gap-1.5 pt-2">
        <SidebarNavItem icon={Home} label="الصفحة الرئيسية" to="/dashboard" />
        <SidebarNavItem icon={Boxes} label="إدارة المخزون" to="/inventory" />
        <SidebarNavItem
          icon={Truck}
          label="الاستلام والتوريد"
          to="/inventory"
        />
        <SidebarNavItem icon={Users} label="إدارة الموظفين" to="/dashboard" />
        <SidebarNavItem icon={Bell} label="الإشعارات" to="/dashboard" showDot />
      </nav>

      <div className="mt-8 border-t border-[var(--erp-sidebar-divider)] pt-4">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-[var(--erp-muted)] transition-colors hover:bg-[var(--erp-nav-hover)]"
        >
          <span className="min-w-0 flex-1 text-right">الإعدادات</span>
          <Settings className="size-[18px] shrink-0" aria-hidden />
        </button>
        <button
          type="button"
          className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-[var(--erp-logout)] transition-colors hover:bg-[var(--erp-nav-hover)]"
        >
          <span className="min-w-0 flex-1 text-right">تسجيل الخروج</span>
          <LogOut className="size-[18px] shrink-0" aria-hidden />
        </button>
      </div>
    </aside>
  )
}
