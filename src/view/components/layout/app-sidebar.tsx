import type { ComponentType } from "react"
import {
  Bell,
  Boxes,
  Calculator,
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

import { cn } from "@/lib/utils"
import { clearTokens } from "@/utils/auth-storage"

type NavItem = {
  icon: ComponentType<{ className?: string }>
  label: string
  to: string
  showDot?: boolean
}

type NavItemProps = NavItem

const sidebarItems: NavItem[] = [
  {
    icon: Home,
    label: "نظرة عامة",
    to: "/overview",
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
    <aside className="erp-scrollbar flex w-[280px] shrink-0 flex-col overflow-y-auto border-l border-[var(--erp-border)] bg-[var(--erp-sidebar)] px-5 py-6">
      <nav className="flex flex-1 flex-col gap-2">
        {sidebarItems.map((item) => (
          <SidebarNavItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="mt-8 border-t border-[var(--erp-border)] pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-[var(--erp-logout)] transition-colors hover:bg-red-500/10"
        >
          <span className="min-w-0 flex-1 text-right">تسجيل الخروج</span>
          <LogOut className="size-[18px]" />
        </button>
      </div>
    </aside>
  )
}
