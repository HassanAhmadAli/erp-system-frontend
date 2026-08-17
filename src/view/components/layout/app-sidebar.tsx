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
  Settings,
  ShoppingCart,
  Tags,
  TrendingUp,
  Truck,
  UserCog,
  Users,
} from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { SIDEBAR_ACCESS } from "@/auth/route-access"
import { usePermissions } from "@/hooks/usePermissions"
import { cn } from "@/lib/utils"
import { clearTokens } from "@/utils/auth-storage"

type NavItem = {
  icon: ComponentType<{ className?: string }>
  labelKey: string
  to: string
  showDot?: boolean
}

type NavItemProps = {
  icon: ComponentType<{ className?: string }>
  label: string
  to: string
  showDot?: boolean
  collapsed: boolean
  onNavigate?: () => void
}

type AppSidebarProps = {
  collapsed: boolean
  onToggle?: () => void
  onNavigate?: () => void
  className?: string
  showCollapseToggle?: boolean
}

const sidebarItems: NavItem[] = [
  { icon: Home, labelKey: "overview", to: "/overview" },
  { icon: Home, labelKey: "accountantOverview", to: "/accountant/overview" },
  { icon: Calculator, labelKey: "pos", to: "/pos" },
  { icon: Users, labelKey: "customers", to: "/customers" },
  { icon: UserCog, labelKey: "staff", to: "/staff" },
  { icon: ShoppingCart, labelKey: "orders", to: "/orders" },
  { icon: ReceiptText, labelKey: "salesInvoices", to: "/sales-invoices" },
  { icon: ReceiptText, labelKey: "purchaseInvoices", to: "/purchase-invoices" },
  { icon: Bell, labelKey: "notifications", to: "/notifications" },
  { icon: Megaphone, labelKey: "ads", to: "/ads" },
  { icon: ClipboardList, labelKey: "auditLogs", to: "/audit-logs" },
  { icon: Boxes, labelKey: "inventory", to: "/inventory" },
  { icon: Tags, labelKey: "categories", to: "/categories" },
  { icon: Package, labelKey: "products", to: "/products" },
  { icon: Truck, labelKey: "suppliers", to: "/suppliers" },
  { icon: Percent, labelKey: "discounts", to: "/discounts" },
  { icon: DollarSign, labelKey: "expenses", to: "/expenses" },
  { icon: FileText, labelKey: "reports", to: "/reports" },
  { icon: TrendingUp, labelKey: "financial", to: "/financial" },
  { icon: Gift, labelKey: "loyaltyRewards", to: "/loyalty-rewards" },
  { icon: Settings, labelKey: "settings", to: "/settings" },
]

function SidebarNavItem({
  icon: Icon,
  label,
  to,
  showDot,
  collapsed,
  onNavigate,
}: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={to === "/overview" || to === "/accountant/overview"}
      title={collapsed ? label : undefined}
      onClick={onNavigate}
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
      {!collapsed && <span className="min-w-0 flex-1 text-start">{label}</span>}

      <span className="relative inline-flex shrink-0">
        <Icon className="size-[18px]" />
        {showDot && (
          <span className="absolute -start-1 -top-1 size-2 rounded-full bg-red-500" />
        )}
      </span>
    </NavLink>
  )
}

export function AppSidebar({
  collapsed,
  onToggle,
  onNavigate,
  className,
  showCollapseToggle = true,
}: AppSidebarProps) {
  const { t } = useTranslation(["nav", "common"])
  const navigate = useNavigate()
  const { canSeeSidebarItem } = usePermissions()

  const visibleItems = sidebarItems.filter((item) => {
    const access = SIDEBAR_ACCESS.find((entry) => entry.to === item.to)

    if (!access) {
      return false
    }

    return canSeeSidebarItem(access)
  })

  function handleLogout() {
    onNavigate?.()
    clearTokens()
    navigate("/login")
  }

  return (
    <aside
      className={cn(
        "erp-scrollbar flex shrink-0 flex-col overflow-y-auto border-e border-[var(--erp-border)] bg-[var(--erp-sidebar)] py-6 transition-[width,padding] duration-200 ease-in-out",
        collapsed ? "w-[76px] px-3" : "w-[280px] px-5",
        className
      )}
    >
      {showCollapseToggle && onToggle && (
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
              collapsed
                ? t("common:expandSidebar")
                : t("common:collapseSidebar")
            }
            title={
              collapsed
                ? t("common:expandSidebar")
                : t("common:collapseSidebar")
            }
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-[var(--erp-border)] bg-[var(--erp-card)] text-[var(--erp-muted)] transition-colors hover:bg-[var(--erp-nav-active-bg)] hover:text-[var(--erp-brand-solid)]"
          >
            {collapsed ? (
              <ChevronLeft className="size-4 rtl:rotate-180" />
            ) : (
              <ChevronRight className="size-4 rtl:rotate-180" />
            )}
          </button>
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-2">
        {visibleItems.map((item) => (
          <SidebarNavItem
            key={item.to}
            icon={item.icon}
            label={t(`nav:${item.labelKey}`)}
            to={item.to}
            showDot={item.showDot}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="mt-8 border-t border-[var(--erp-border)] pt-4">
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? t("common:logout") : undefined}
          className={cn(
            "flex w-full items-center rounded-2xl text-sm font-medium text-[var(--erp-logout)] transition-colors hover:bg-red-500/10",
            collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"
          )}
        >
          {!collapsed && (
            <span className="min-w-0 flex-1 text-start">
              {t("common:logout")}
            </span>
          )}
          <LogOut className="size-[18px]" />
        </button>
      </div>
    </aside>
  )
}
