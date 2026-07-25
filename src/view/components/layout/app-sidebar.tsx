import type { ComponentType } from "react"
import {
  Bell,
  Boxes,
  Calculator,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DollarSign,
  FileText,
  Gift,
  Home,
  LogOut,
  Megaphone,
  Package,
  Percent,
  ReceiptText,
  ShoppingCart,
  Tags,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"

import { SIDEBAR_ACCESS } from "@/auth/route-access"
import { usePermissions } from "@/hooks/usePermissions"
import { cn } from "@/lib/utils"
import { clearTokens } from "@/utils/auth-storage"

type NavItem = {
  icon: ComponentType<{ className?: string }>
  label: string
  to: string
  showDot?: boolean
}

type NavItemProps = NavItem & {
  collapsed: boolean
}

type AppSidebarProps = {
  collapsed: boolean
  onToggle: () => void
}

const sidebarItems: NavItem[] = [
  {
    icon: Home,
    label: "نظرة عامة",
    to: "/overview",
  },
  {
    icon: Home,
    label: "لوحة المحاسب",
    to: "/accountant/overview",
  },
  {
    icon: Calculator,
    label: "نقطة البيع",
    to: "/pos",
  },
  {
    icon: Users,
    label: "العملاء",
    to: "/customers",
  },
  {
    icon: ShoppingCart,
    label: "الطلبات",
    to: "/orders",
  },
  {
    icon: ReceiptText,
    label: "فواتير المبيعات",
    to: "/sales-invoices",
  },
  {
    icon: ReceiptText,
    label: "فواتير الشراء",
    to: "/purchase-invoices",
  },
  {
    icon: Bell,
    label: "الإشعارات",
    to: "/notifications",
  },
  {
    icon: Megaphone,
    label: "الإعلانات",
    to: "/ads",
  },
  {
    icon: ClipboardList,
    label: "سجل النشاطات",
    to: "/audit-logs",
  },
  {
    icon: Boxes,
    label: "المخزون",
    to: "/inventory",
  },
  {
    icon: Tags,
    label: "التصنيفات",
    to: "/categories",
  },
  {
    icon: Package,
    label: "المنتجات",
    to: "/products",
  },
  {
    icon: Truck,
    label: "الموردون",
    to: "/suppliers",
  },
  {
    icon: Percent,
    label: "الخصومات",
    to: "/discounts",
  },
  {
    icon: DollarSign,
    label: "المصروفات",
    to: "/expenses",
  },
  {
    icon: FileText,
    label: "التقارير",
    to: "/reports",
  },
  {
    icon: TrendingUp,
    label: "التحليل المالي",
    to: "/financial",
  },
  {
    icon: Gift,
    label: "مكافآت الولاء",
    to: "/loyalty-rewards",
  },
]

function SidebarNavItem({
  icon: Icon,
  label,
  to,
  showDot,
  collapsed,
}: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={to === "/overview" || to === "/accountant/overview"}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          "flex items-center rounded-2xl text-sm font-medium transition-colors",
          collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
          "text-[var(--erp-muted)] hover:bg-[var(--erp-nav-active-bg)] hover:text-[var(--erp-brand-solid)]",
          isActive &&
            "bg-[var(--erp-nav-active-bg)] text-[var(--erp-brand-solid)] [&_svg]:text-[var(--erp-brand-solid)]"
        )
      }
    >
      {!collapsed && <span className="min-w-0 flex-1 text-right">{label}</span>}

      <span className="relative inline-flex shrink-0">
        <Icon className="size-[18px]" />
        {showDot && (
          <span className="absolute -start-1 -top-1 size-2 rounded-full bg-red-500" />
        )}
      </span>
    </NavLink>
  )
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const navigate = useNavigate()
  const { canSeeSidebarItem } = usePermissions()

  const visibleItems = sidebarItems.filter((item) => {
  const access = SIDEBAR_ACCESS.find((entry) => entry.to === item.to)

  /**
   * Fail closed:
   * if a sidebar item has no matching permission rule,
   * hide it instead of accidentally showing it to everyone.
   */
  if (!access) {
    return false
  }

  return canSeeSidebarItem(access)
})

  function handleLogout() {
    clearTokens()
    navigate("/login")
  }

  return (
    <aside
      className={cn(
        "erp-scrollbar flex shrink-0 flex-col overflow-y-auto border-l border-[var(--erp-border)] bg-[var(--erp-sidebar)] py-6 transition-[width,padding] duration-200 ease-in-out",
        collapsed ? "w-[76px] px-3" : "w-[280px] px-5"
      )}
    >
      <div
        className={cn(
          "mb-4 flex items-center",
          collapsed ? "justify-center" : "justify-start"
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-label={
            collapsed ? "توسيع القائمة الجانبية" : "طي القائمة الجانبية"
          }
          title={collapsed ? "توسيع القائمة" : "طي القائمة"}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-[var(--erp-border)] bg-[var(--erp-card)] text-[var(--erp-muted)] transition-colors hover:bg-[var(--erp-nav-active-bg)] hover:text-[var(--erp-brand-solid)]"
        >
          {collapsed ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {visibleItems.map((item) => (
          <SidebarNavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="mt-8 border-t border-[var(--erp-border)] pt-4">
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "تسجيل الخروج" : undefined}
          className={cn(
            "flex w-full items-center rounded-2xl text-sm font-medium text-[var(--erp-logout)] transition-colors hover:bg-red-500/10",
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
          )}
        >
          {!collapsed && (
            <span className="min-w-0 flex-1 text-right">تسجيل الخروج</span>
          )}
          <LogOut className="size-[18px]" />
        </button>
      </div>
    </aside>
  )
}
