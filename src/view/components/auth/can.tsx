import type { Permission } from "@/auth/permissions"
import { usePermissions } from "@/hooks/usePermissions"

type CanProps = {
  permission?: Permission
  permissions?: readonly Permission[]
  children: React.ReactNode
}

export function Can({ permission, permissions, children }: CanProps) {
  const { can, canAll } = usePermissions()

  const allowed = permission
    ? can(permission)
    : permissions
      ? canAll(permissions)
      : true

  if (!allowed) return null

  return <>{children}</>
}
