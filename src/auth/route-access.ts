import type { Permission } from "@/auth/permissions"
import { PERMISSIONS } from "@/auth/permissions"
import type { UserRole } from "@/services/user-service"

export type RouteAccessRule = {
  test: (pathname: string) => boolean
  permissions?: readonly Permission[]
  rolesOnly?: readonly Exclude<UserRole, "CUSTOMER">[]
}

export type SidebarAccess = {
  to: string
  permissions?: readonly Permission[]
  rolesOnly?: readonly Exclude<UserRole, "CUSTOMER">[]
}

function isExact(pathname: string, target: string) {
  return pathname === target
}

function isNumericDetailsRoute(pathname: string, basePath: string) {
  return new RegExp(`^${basePath}/\\d+$`).test(pathname)
}

function isNumericEditRoute(pathname: string, basePath: string) {
  return new RegExp(`^${basePath}/\\d+/edit$`).test(pathname)
}

const ROUTE_ACCESS_RULES: RouteAccessRule[] = [
  /**
   * Overview
   */
  {
    test: (path) => isExact(path, "/overview"),
    rolesOnly: ["STORE_MANAGER"],
  },
  {
    test: (path) => isExact(path, "/accountant/overview"),
    permissions: [PERMISSIONS.REPORTS_VIEW],
  },

  /**
   * POS
   */
  {
    test: (path) => isExact(path, "/pos"),
    permissions: [PERMISSIONS.SALES_CREATE],
  },

  /**
   * Customers
   */
  {
    test: (path) =>
      isExact(path, "/customers") || isNumericDetailsRoute(path, "/customers"),
    permissions: [PERMISSIONS.CUSTOMERS_VIEW],
  },

  /**
   * Orders
   */
  {
    test: (path) =>
      isExact(path, "/orders") || isNumericDetailsRoute(path, "/orders"),
    permissions: [PERMISSIONS.ORDERS_VIEW],
  },

  /**
   * Sales invoices
   */
  {
    test: (path) =>
      isExact(path, "/sales-invoices") ||
      isNumericDetailsRoute(path, "/sales-invoices"),
    permissions: [PERMISSIONS.SALES_VIEW],
  },

  /**
   * Purchase invoices
   */
  {
    test: (path) =>
      isExact(path, "/purchase-invoices") ||
      isNumericDetailsRoute(path, "/purchase-invoices"),
    permissions: [PERMISSIONS.PURCHASES_VIEW],
  },

  /**
   * Notifications
   *
   * Everyone with NOTIFICATIONS_VIEW can access their inbox.
   * Only STORE_MANAGER currently has NOTIFICATIONS_VIEW_HISTORY.
   * Sending is guarded inside the page by NOTIFICATIONS_SEND.
   */
  {
    test: (path) =>
      isExact(path, "/notifications") ||
      /^\/notifications\/details\/inbox\/\d+$/.test(path),
    permissions: [PERMISSIONS.NOTIFICATIONS_VIEW],
  },
  {
    test: (path) => /^\/notifications\/details\/history\/\d+$/.test(path),
    permissions: [PERMISSIONS.NOTIFICATIONS_VIEW_HISTORY],
  },

  /**
   * Ads
   */
  {
    test: (path) =>
      isExact(path, "/ads") ||
      isExact(path, "/ads/create") ||
      isNumericDetailsRoute(path, "/ads"),
    permissions: [PERMISSIONS.ADS_MANAGE],
  },

  /**
   * Audit logs
   */
  {
    test: (path) =>
      isExact(path, "/audit-logs") ||
      isNumericDetailsRoute(path, "/audit-logs"),
    permissions: [PERMISSIONS.AUDIT_LOGS_VIEW],
  },

  /**
   * Inventory
   */
  {
    test: (path) => isExact(path, "/inventory"),
    permissions: [PERMISSIONS.PRODUCT_MANAGE],
  },

  /**
   * Categories
   */
  {
    test: (path) =>
      isExact(path, "/categories") ||
      isExact(path, "/categories/create") ||
      isNumericDetailsRoute(path, "/categories") ||
      isNumericEditRoute(path, "/categories"),
    permissions: [PERMISSIONS.CATEGORY_MANAGE],
  },

  /**
   * Suppliers
   */
  {
    test: (path) =>
      isExact(path, "/suppliers") ||
      isExact(path, "/suppliers/create") ||
      isNumericDetailsRoute(path, "/suppliers") ||
      isNumericEditRoute(path, "/suppliers"),
    permissions: [PERMISSIONS.SUPPLIER_MANAGE],
  },

  /**
   * Products
   */
  {
    test: (path) => isExact(path, "/products/create"),
    permissions: [PERMISSIONS.PRODUCT_CREATE],
  },
  {
    test: (path) =>
      isExact(path, "/products") ||
      isExact(path, "/products/import") ||
      isNumericDetailsRoute(path, "/products") ||
      isNumericEditRoute(path, "/products") ||
      /^\/products\/\d+\/photos$/.test(path),
    permissions: [PERMISSIONS.PRODUCT_MANAGE],
  },

  /**
   * Discounts
   */
  {
    test: (path) =>
      isExact(path, "/discounts") ||
      isExact(path, "/discounts/active") ||
      isExact(path, "/discounts/best") ||
      isExact(path, "/discounts/calculate") ||
      isExact(path, "/discounts/create") ||
      isNumericDetailsRoute(path, "/discounts") ||
      isNumericEditRoute(path, "/discounts"),
    permissions: [PERMISSIONS.DISCOUNT_MANAGE],
  },

  /**
   * Expenses
   */
  {
    test: (path) =>
      isExact(path, "/expenses/create") || isNumericEditRoute(path, "/expenses"),
    permissions: [PERMISSIONS.EXPENSES_MANAGE],
  },
  {
    test: (path) =>
      isExact(path, "/expenses") || isNumericDetailsRoute(path, "/expenses"),
    permissions: [PERMISSIONS.EXPENSES_VIEW],
  },

  /**
   * Reports
   */
  {
    test: (path) => path === "/reports" || path.startsWith("/reports/"),
    permissions: [PERMISSIONS.REPORTS_VIEW],
  },

  /**
   * Financial
   */
  {
    test: (path) => isExact(path, "/financial/recalculate"),
    permissions: [PERMISSIONS.FINANCIALS_MANAGE],
  },
  {
    test: (path) => path === "/financial" || path.startsWith("/financial/"),
    permissions: [PERMISSIONS.FINANCIALS_VIEW],
  },

  /**
   * Loyalty
   */
  {
    test: (path) => isExact(path, "/loyalty-rewards"),
    permissions: [PERMISSIONS.LOYALTY_REWARDS_MANAGE],
  },
]

export const SIDEBAR_ACCESS: SidebarAccess[] = [
  {
    to: "/overview",
    rolesOnly: ["STORE_MANAGER"],
  },
  {
    to: "/accountant/overview",
    permissions: [PERMISSIONS.REPORTS_VIEW],
  },
  {
    to: "/pos",
    permissions: [PERMISSIONS.SALES_CREATE],
  },
  {
    to: "/customers",
    permissions: [PERMISSIONS.CUSTOMERS_VIEW],
  },
  {
    to: "/orders",
    permissions: [PERMISSIONS.ORDERS_VIEW],
  },
  {
    to: "/sales-invoices",
    permissions: [PERMISSIONS.SALES_VIEW],
  },
  {
    to: "/purchase-invoices",
    permissions: [PERMISSIONS.PURCHASES_VIEW],
  },
  {
    to: "/notifications",
    permissions: [PERMISSIONS.NOTIFICATIONS_VIEW],
  },
  {
    to: "/ads",
    permissions: [PERMISSIONS.ADS_MANAGE],
  },
  {
    to: "/audit-logs",
    permissions: [PERMISSIONS.AUDIT_LOGS_VIEW],
  },
  {
    to: "/inventory",
    permissions: [PERMISSIONS.PRODUCT_MANAGE],
  },
  {
    to: "/categories",
    permissions: [PERMISSIONS.CATEGORY_MANAGE],
  },
  {
    to: "/products",
    permissions: [PERMISSIONS.PRODUCT_MANAGE],
  },
  {
    to: "/suppliers",
    permissions: [PERMISSIONS.SUPPLIER_MANAGE],
  },
  {
    to: "/discounts",
    permissions: [PERMISSIONS.DISCOUNT_MANAGE],
  },
  {
    to: "/expenses",
    permissions: [PERMISSIONS.EXPENSES_VIEW],
  },
  {
    to: "/reports",
    permissions: [PERMISSIONS.REPORTS_VIEW],
  },
  {
    to: "/financial",
    permissions: [PERMISSIONS.FINANCIALS_VIEW],
  },
  {
    to: "/loyalty-rewards",
    permissions: [PERMISSIONS.LOYALTY_REWARDS_MANAGE],
  },
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

  /**
   * Fail closed:
   * If a protected route has no access rule, block it.
   * This prevents accidentally exposing new pages when someone forgets
   * to add them to ROUTE_ACCESS_RULES.
   */
  if (!rule) {
    return false
  }

  if (rule.rolesOnly) {
    if (!role || role === "CUSTOMER") {
      return false
    }

    if (!rule.rolesOnly.includes(role)) {
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
  if (item.rolesOnly) {
    if (!role || role === "CUSTOMER") {
      return false
    }

    if (!item.rolesOnly.includes(role)) {
      return false
    }
  }

  if (item.permissions && item.permissions.length > 0) {
    return hasAll(item.permissions)
  }

  return true
}