import { useTranslation } from "react-i18next"

import {
  canManageSalesInvoiceStatus,
  getDefaultRouteForRole,
  getPermissionsForRole,
  hasAllPermissions,
  hasPermission,
  type Permission,
} from "@/auth/permissions"
import {
  canAccessRoute,
  canAccessSidebarItem,
  type SidebarAccess,
} from "@/auth/route-access"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import type { UserRole } from "@/services/user-service"

export function usePermissions() {
  const { t } = useTranslation("nav")
  const { data: user, isLoading, isError } = useCurrentUser()
  const role = user?.role

  function can(permission: Permission): boolean {
    return hasPermission(role, permission)
  }

  function canAll(permissions: readonly Permission[]): boolean {
    return hasAllPermissions(role, permissions)
  }

  function canAccessPath(pathname: string): boolean {
    return canAccessRoute(pathname, role, canAll)
  }

  function canSeeSidebarItem(item: SidebarAccess): boolean {
    return canAccessSidebarItem(item, role, canAll)
  }

  function canManageSalesInvoice(invoice: {
    cashierId?: number
    cashier?: { user?: { id?: number } | null } | null
  }): boolean {
    const cashierUserId = invoice.cashier?.user?.id
    return canManageSalesInvoiceStatus(role, user?.id, cashierUserId)
  }

  const headerTitle =
    role && role !== "CUSTOMER" ? t(`roles.${role}`) : t("roles.STORE_MANAGER")

  return {
    user,
    role,
    isLoading,
    isError,
    permissions: getPermissionsForRole(role),
    can,
    canAll,
    canAccessPath,
    canSeeSidebarItem,
    canManageSalesInvoice,
    defaultRoute: getDefaultRouteForRole(role),
    headerTitle,
  }
}

export type { Permission, UserRole }
