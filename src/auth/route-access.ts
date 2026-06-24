import type { Permission } from "@/auth/permissions"
import { PERMISSIONS } from "@/auth/permissions"
import type { UserRole } from "@/services/user-service"

export type RouteAccessRule = {
  test: (pathname: string) => boolean
  permissions?: readonly Permission[]
  rolesOnly?: readonly Exclude<UserRole, "CUSTOMER">[]
}

const ROUTE_ACCESS_RULES: RouteAccessRule[] = [
  {
    test: (path) => path === "/overview",
    rolesOnly: ["STORE_MANAGER"],
  },
  {
    test: (path) => path === "/accountant/overview",
    permissions: [PERMISSIONS.REPORTS_VIEW],
  },
  { test: (path) => path === "/pos", permissions: [PERMISSIONS.SALES_CREATE] },
  {
    test: (path) => /^\/orders\/\d+$/.test(path),
    permissions: [PERMISSIONS.ORDERS_VIEW],
  },
  {
    test: (path) => path === "/orders",
    permissions: [PERMISSIONS.ORDERS_VIEW],
  },
  {
    test: (path) => /^\/sales-invoices\/\d+$/.test(path),
    permissions: [PERMISSIONS.SALES_VIEW],
  },
  {
    test: (path) => path === "/sales-invoices",
    permissions: [PERMISSIONS.SALES_VIEW],
  },
  {
    test: (path) => /^\/purchase-invoices\/\d+$/.test(path),
    permissions: [PERMISSIONS.PURCHASES_VIEW],
  },
  {
    test: (path) => path === "/purchase-invoices",
    permissions: [PERMISSIONS.PURCHASES_VIEW],
  },
  {
    test: (path) => path === "/customers" || /^\/customers\/\d+$/.test(path),
    permissions: [PERMISSIONS.CUSTOMERS_VIEW],
  },
  {
    test: (path) => path === "/ads/create",
    permissions: [PERMISSIONS.ADS_MANAGE],
  },
  {
    test: (path) => /^\/ads\/\d+$/.test(path),
    permissions: [PERMISSIONS.ADS_MANAGE],
  },
  {
    test: (path) => path === "/inventory",
    permissions: [PERMISSIONS.PRODUCT_MANAGE],
  },
  {
    test: (path) => path === "/categories/create",
    permissions: [PERMISSIONS.CATEGORY_MANAGE],
  },
  {
    test: (path) => /^\/categories\/\d+\/edit$/.test(path),
    permissions: [PERMISSIONS.CATEGORY_MANAGE],
  },
  {
    test: (path) => path === "/suppliers/create",
    permissions: [PERMISSIONS.SUPPLIER_MANAGE],
  },
  {
    test: (path) => /^\/suppliers\/\d+\/edit$/.test(path),
    permissions: [PERMISSIONS.SUPPLIER_MANAGE],
  },
  {
    test: (path) => path === "/products/import" || path === "/products/create",
    permissions: [PERMISSIONS.PRODUCT_CREATE],
  },
  {
    test: (path) => /^\/products\/\d+\/edit$/.test(path),
    permissions: [PERMISSIONS.PRODUCT_MANAGE],
  },
  {
    test: (path) => /^\/products\/\d+\/photos$/.test(path),
    permissions: [PERMISSIONS.PRODUCT_MANAGE],
  },
  {
    test: (path) => path === "/discounts/create",
    permissions: [PERMISSIONS.DISCOUNT_MANAGE],
  },
  {
    test: (path) => /^\/discounts\/\d+(\/edit)?$/.test(path),
    permissions: [PERMISSIONS.DISCOUNT_MANAGE],
  },
  {
    test: (path) => path === "/discounts",
    permissions: [PERMISSIONS.DISCOUNT_MANAGE],
  },
  {
    test: (path) => path === "/expenses/create",
    permissions: [PERMISSIONS.EXPENSES_MANAGE],
  },
  {
    test: (path) => /^\/expenses\/\d+\/edit$/.test(path),
    permissions: [PERMISSIONS.EXPENSES_MANAGE],
  },
  {
    test: (path) => /^\/expenses\/\d+$/.test(path) || path === "/expenses",
    permissions: [PERMISSIONS.EXPENSES_VIEW],
  },
  {
    test: (path) => path.startsWith("/reports"),
    permissions: [PERMISSIONS.REPORTS_VIEW],
  },
  {
    test: (path) => path === "/financial/recalculate",
    permissions: [PERMISSIONS.FINANCIALS_MANAGE],
  },
  {
    test: (path) => path.startsWith("/financial"),
    permissions: [PERMISSIONS.FINANCIALS_VIEW],
  },
  {
    test: (path) => path === "/loyalty-rewards",
    permissions: [
      PERMISSIONS.LOYALTY_REWARDS_MANAGE,
      PERMISSIONS.LOYALTY_POLICY_MANAGE,
    ],
  },
  {
    test: (path) => path.startsWith("/audit-logs"),
    permissions: [PERMISSIONS.AUDIT_LOGS_VIEW],
  },
]

export type SidebarAccess = {
  to: string
  permissions?: readonly Permission[]
  rolesOnly?: readonly Exclude<UserRole, "CUSTOMER">[]
}

export const SIDEBAR_ACCESS: SidebarAccess[] = [
  { to: "/overview", rolesOnly: ["STORE_MANAGER"] },
  { to: "/accountant/overview", permissions: [PERMISSIONS.REPORTS_VIEW] },
  { to: "/pos", permissions: [PERMISSIONS.SALES_CREATE] },
  { to: "/customers", permissions: [PERMISSIONS.CUSTOMERS_VIEW] },
  { to: "/orders", permissions: [PERMISSIONS.ORDERS_VIEW] },
  { to: "/sales-invoices", permissions: [PERMISSIONS.SALES_VIEW] },
  { to: "/purchase-invoices", permissions: [PERMISSIONS.PURCHASES_VIEW] },
  { to: "/notifications" },
  { to: "/ads" },
  { to: "/audit-logs", permissions: [PERMISSIONS.AUDIT_LOGS_VIEW] },
  { to: "/inventory", permissions: [PERMISSIONS.PRODUCT_MANAGE] },
  { to: "/categories" },
  { to: "/products" },
  { to: "/suppliers" },
  { to: "/discounts", permissions: [PERMISSIONS.DISCOUNT_MANAGE] },
  { to: "/expenses", permissions: [PERMISSIONS.EXPENSES_VIEW] },
  { to: "/reports", permissions: [PERMISSIONS.REPORTS_VIEW] },
  { to: "/financial", permissions: [PERMISSIONS.FINANCIALS_VIEW] },
  { to: "/loyalty-rewards", permissions: [PERMISSIONS.LOYALTY_REWARDS_MANAGE] },
]

export function getRouteAccessRule(pathname: string): RouteAccessRule | null {
  return ROUTE_ACCESS_RULES.find((rule) => rule.test(pathname)) ?? null
}

export function canAccessRoute(
  pathname: string,
  role: UserRole | undefined,
  hasAll: (permissions: readonly Permission[]) => boolean
): boolean {
  const rule = getRouteAccessRule(pathname)
  if (!rule) return true

  if (rule.rolesOnly && role) {
    if (!rule.rolesOnly.includes(role as Exclude<UserRole, "CUSTOMER">)) {
      return false
    }
  }

  if (rule.permissions && rule.permissions.length > 0) {
    return hasAll(rule.permissions)
  }

  return true
}

export function canAccessSidebarItem(
  item: SidebarAccess,
  role: UserRole | undefined,
  hasAll: (permissions: readonly Permission[]) => boolean
): boolean {
  if (item.rolesOnly && role) {
    if (!item.rolesOnly.includes(role as Exclude<UserRole, "CUSTOMER">)) {
      return false
    }
  }

  if (item.permissions && item.permissions.length > 0) {
    return hasAll(item.permissions)
  }

  return true
}
