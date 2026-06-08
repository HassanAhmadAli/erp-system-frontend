import type { ComponentType } from "react"
import {
  Bell,
  Boxes,
  Home,
  LogOut,
  Package,
  Settings,
  Truck,
  Users,
  Tags,
  Megaphone,
  ClipboardList,
  DatabaseBackup,
  Percent,
} from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"

import { cn } from "@/lib/utils"
import { clearTokens } from "@/utils/auth-storage"

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
      end={to === "/overview"}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
          "text-[var(--erp-muted)] hover:bg-[var(--erp-nav-active-bg)] hover:text-[var(--erp-brand-solid)]",
          isActive &&
            "bg-[var(--erp-nav-active-bg)] text-[var(--erp-brand-solid)] [&_svg]:text-[var(--erp-brand-solid)]"
        )
      }
    >
      <span className="min-w-0 flex-1 text-right">{label}</span>

      <span className="relative inline-flex shrink-0">
        <Icon className="size-[18px]" />
        {showDot && (
          <span className="absolute -start-1 -top-1 size-2 rounded-full bg-red-500" />
        )}
      </span>
    </NavLink>
  )
}

export function AppSidebar() {
  const navigate = useNavigate()

  function handleLogout() {
    clearTokens()
    navigate("/login")
  }

  return (
    <aside className="erp-scrollbar flex w-[280px] shrink-0 flex-col overflow-y-auto bg-[var(--erp-sidebar)] px-5 py-6">
      <nav className="flex flex-1 flex-col gap-2">
        <SidebarNavItem icon={Home} label="نظرة عامة" to="/overview" />

        <SidebarNavItem icon={Users} label="إدارة الموظفين" to="/staff" />

        <SidebarNavItem icon={Users} label="العملاء" to="/customers" />

        <SidebarNavItem icon={Bell} label="الإشعارات" to="/notifications" />

        <SidebarNavItem icon={Megaphone} label="الإعلانات والعروض" to="/ads" />

        <SidebarNavItem
          icon={ClipboardList}
          label="سجل النشاطات"
          to="/audit-logs"
        />

        <SidebarNavItem
          icon={DatabaseBackup}
          label="النسخ الاحتياطي"
          to="/backup"
        />

        {/* Keep these if you still want warehouse/testing pages visible for now */}
        <SidebarNavItem icon={Boxes} label="المخزون" to="/inventory" />

        <SidebarNavItem icon={Tags} label="التصنيفات" to="/categories" />

        <SidebarNavItem icon={Package} label="المنتجات" to="/products" />

        <SidebarNavItem
          icon={Truck}
          label="الاستلام والتوريد"
          to="/inventory"
        />

        <SidebarNavItem icon={Users} label="الموظفين" to="/dashboard" />

        <SidebarNavItem icon={Bell} label="الإشعارات" to="/dashboard" />
        <SidebarNavItem icon={Truck} label="الموردون" to="/suppliers" />

        <SidebarNavItem icon={Percent} label="الخصومات" to="/discounts" />
      </nav>

      <div className="mt-8 border-t pt-4">
        <button
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm"
          onClick={() => navigate("/profile")}
        >
          <Settings className="size-[18px]" />
          <span className="flex-1 text-right">الملف الشخصي</span>
        </button>

        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-red-500"
        >
          <LogOut className="size-[18px]" />
          <span className="flex-1 text-right">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  )
}
