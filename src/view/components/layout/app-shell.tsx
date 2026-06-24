import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"

import { usePermissions } from "@/hooks/usePermissions"
import { AppSidebar } from "@/view/components/layout/app-sidebar"
import { TopBar } from "@/view/components/layout/top-bar"

const SIDEBAR_COLLAPSED_KEY = "erp-sidebar-collapsed"

function readSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"
  } catch {
    return false
  }
}

export function AppShell() {
  const { headerTitle } = usePermissions()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed)

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed))
    } catch {
      // ignore storage errors
    }
  }, [sidebarCollapsed])

  function toggleSidebar() {
    setSidebarCollapsed((current) => !current)
  }

  return (
    <div
      className="flex h-svh flex-col overflow-hidden bg-[var(--erp-page)] text-[var(--erp-text)]"
      dir="rtl"
      lang="ar"
    >
      <TopBar title={headerTitle} />

      <div className="flex min-h-0 flex-1">
        <AppSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

        <main className="erp-scrollbar min-h-0 flex-1 overflow-y-auto bg-[var(--erp-bg)] px-5 py-8 sm:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
