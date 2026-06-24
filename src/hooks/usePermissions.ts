import {
  canManageSalesInvoiceStatus,
  getDefaultRouteForRole,
  getPermissionsForRole,
  hasAllPermissions,
  hasPermission,
  ROLE_HEADER_TITLES,
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

  function canManageSalesInvoice(cashierId: number | undefined): boolean {
    return canManageSalesInvoiceStatus(role, user?.id, cashierId)
  }

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
    headerTitle:
      role && role !== "CUSTOMER" ? ROLE_HEADER_TITLES[role] : "مدير المتجر",
  }
}

export type { Permission, UserRole }
