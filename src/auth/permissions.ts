import type { UserRole } from "@/services/user-service"

export const PERMISSIONS = {
  UPDATE_SELF_PROFILE: "any:update-self-profile",
  SALES_CREATE: "sales:create",
  SALES_VIEW: "sales:view",
  SALES_MANAGE: "sales:manage",
  ORDERS_CREATE: "orders:create",
  ORDERS_VIEW: "orders:view",
  ORDERS_MANAGE: "orders:manage",
  PRODUCT_CREATE: "product:create",
  PRODUCT_MANAGE: "product:manage",
  CATEGORY_MANAGE: "category:manage",
  SUPPLIER_MANAGE: "supplier:manage",
  EXPENSES_MANAGE: "expenses:manage",
  EXPENSES_VIEW: "expenses:view",
  REPORTS_VIEW: "reports:view",
  FINANCIALS_VIEW: "financials:view",
  FINANCIALS_MANAGE: "financials:manage",
  AUDIT_LOGS_VIEW: "audit-logs:view",
  NOTIFICATIONS_SEND: "notifications:send",
  DISCOUNT_MANAGE: "discount:manage",
  ADS_MANAGE: "ads:manage",
  LOYALTY_REWARDS_MANAGE: "loyalty-rewards:manage",
  LOYALTY_POLICY_MANAGE: "loyalty-policy:manage",
  CUSTOMERS_VIEW: "customers:view",
  PURCHASES_VIEW: "purchases:view",
  PURCHASES_CREATE: "purchases:create",
  EMPLOYEE_MANAGE: "employee:manage",
  USER_VIEW_PROFILES: "user:view-profiles",
  STORE_MANAGER_UPDATE_PROFILE: "store-manager:update-profile",
  CUSTOMERS_MANAGE_STATUS: "customers:manage-status",
  CUSTOMERS_MANAGE_LOYALTY: "customers:manage-loyalty",
  ACCOUNT_ARCHIVE: "account:archive",
  ACCOUNT_DELETE: "account:delete",
  NOTIFICATIONS_VIEW_HISTORY: "notifications:view-history",
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

const CASHIER_PERMISSIONS: Permission[] = [
  PERMISSIONS.UPDATE_SELF_PROFILE,
  PERMISSIONS.SALES_CREATE,
  PERMISSIONS.SALES_VIEW,
  PERMISSIONS.SALES_MANAGE,
  PERMISSIONS.ORDERS_CREATE,
  PERMISSIONS.ORDERS_VIEW,
  PERMISSIONS.ORDERS_MANAGE,
]

const WAREHOUSE_WORKER_PERMISSIONS: Permission[] = [
  PERMISSIONS.UPDATE_SELF_PROFILE,
  PERMISSIONS.PRODUCT_CREATE,
  PERMISSIONS.PRODUCT_MANAGE,
  PERMISSIONS.CATEGORY_MANAGE,
  PERMISSIONS.SUPPLIER_MANAGE,
]

const ACCOUNTANT_PERMISSIONS: Permission[] = [
  PERMISSIONS.UPDATE_SELF_PROFILE,
  PERMISSIONS.EXPENSES_MANAGE,
  PERMISSIONS.EXPENSES_VIEW,
  PERMISSIONS.REPORTS_VIEW,
  PERMISSIONS.FINANCIALS_VIEW,
  PERMISSIONS.FINANCIALS_MANAGE,
  PERMISSIONS.AUDIT_LOGS_VIEW,
  PERMISSIONS.NOTIFICATIONS_SEND,
  PERMISSIONS.SALES_MANAGE,
  PERMISSIONS.DISCOUNT_MANAGE,
  PERMISSIONS.ADS_MANAGE,
  PERMISSIONS.LOYALTY_REWARDS_MANAGE,
  PERMISSIONS.LOYALTY_POLICY_MANAGE,
  PERMISSIONS.CUSTOMERS_VIEW,
  PERMISSIONS.PURCHASES_VIEW,
  PERMISSIONS.PURCHASES_CREATE,
  PERMISSIONS.SALES_VIEW,
]

const STORE_MANAGER_EXCLUSIVE: Permission[] = [
  PERMISSIONS.EMPLOYEE_MANAGE,
  PERMISSIONS.USER_VIEW_PROFILES,
  PERMISSIONS.STORE_MANAGER_UPDATE_PROFILE,
  PERMISSIONS.CUSTOMERS_MANAGE_STATUS,
  PERMISSIONS.CUSTOMERS_MANAGE_LOYALTY,
  PERMISSIONS.ACCOUNT_ARCHIVE,
  PERMISSIONS.ACCOUNT_DELETE,
  PERMISSIONS.NOTIFICATIONS_VIEW_HISTORY,
]

const STORE_MANAGER_PERMISSIONS: Permission[] = [
  ...new Set([
    ...CASHIER_PERMISSIONS,
    ...WAREHOUSE_WORKER_PERMISSIONS,
    ...ACCOUNTANT_PERMISSIONS,
    ...STORE_MANAGER_EXCLUSIVE,
  ]),
]

export const ROLE_PERMISSIONS: Record<
  Exclude<UserRole, "CUSTOMER">,
  readonly Permission[]
> = {
  CASHIER: CASHIER_PERMISSIONS,
  WAREHOUSE_WORKER: WAREHOUSE_WORKER_PERMISSIONS,
  ACCOUNTANT: ACCOUNTANT_PERMISSIONS,
  STORE_MANAGER: STORE_MANAGER_PERMISSIONS,
}

export function getPermissionsForRole(
  role: UserRole | undefined
): readonly Permission[] {
  if (!role || role === "CUSTOMER") return []
  return ROLE_PERMISSIONS[role]
}

export function hasPermission(
  role: UserRole | undefined,
  permission: Permission
): boolean {
  return getPermissionsForRole(role).includes(permission)
}

export function hasAllPermissions(
  role: UserRole | undefined,
  permissions: readonly Permission[]
): boolean {
  if (permissions.length === 0) return true
  const rolePermissions = getPermissionsForRole(role)
  return permissions.every((permission) => rolePermissions.includes(permission))
}

export function canManageSalesInvoiceStatus(
  role: UserRole | undefined,
  userId: number | undefined,
  cashierId: number | undefined
): boolean {
  if (!hasPermission(role, PERMISSIONS.SALES_MANAGE)) return false
  if (role === "CASHIER") {
    return userId !== undefined && cashierId === userId
  }
  return true
}

export function getDefaultRouteForRole(role: UserRole | undefined): string {
  switch (role) {
    case "STORE_MANAGER":
      return "/overview"
    case "ACCOUNTANT":
      return "/accountant/overview"
    case "CASHIER":
      return "/pos"
    case "WAREHOUSE_WORKER":
      return "/inventory"
    default:
      return "/login"
  }
}

export const ROLE_HEADER_TITLES: Record<
  Exclude<UserRole, "CUSTOMER">,
  string
> = {
  STORE_MANAGER: "مدير المتجر",
  CASHIER: "الكاشير",
  WAREHOUSE_WORKER: "مدير المخزون",
  ACCOUNTANT: "المحاسب",
}
