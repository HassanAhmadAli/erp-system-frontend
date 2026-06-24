import { Loader2 } from "lucide-react"
import { Navigate } from "react-router-dom"

import { useCurrentUser } from "@/hooks/useCurrentUser"
import { clearTokens, getAccessToken } from "@/utils/auth-storage"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getAccessToken()
  const { isLoading, isError } = useCurrentUser()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (isLoading) {
    return (
      <div className="flex h-svh items-center justify-center bg-[var(--erp-page)] text-[var(--erp-muted)]">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  if (isError) {
    clearTokens()
    return <Navigate to="/login" replace />
  }

  return children
}
