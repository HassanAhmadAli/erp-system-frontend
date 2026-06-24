import { Loader2 } from "lucide-react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

import { usePermissions } from "@/hooks/usePermissions"

export function PermissionGuard() {
  const location = useLocation()
  const { canAccessPath, defaultRoute, isLoading } = usePermissions()

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[var(--erp-muted)]">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  if (!canAccessPath(location.pathname)) {
    return <Navigate to={defaultRoute} replace />
  }

  return <Outlet />
}

export function DefaultRouteRedirect() {
  const { defaultRoute, isLoading } = usePermissions()

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[var(--erp-muted)]">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  return <Navigate to={defaultRoute} replace />
}
