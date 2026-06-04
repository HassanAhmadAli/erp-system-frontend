import { Outlet, useLocation } from "react-router-dom"

import { AppSidebar } from "@/view/components/layout/app-sidebar"
import { TopBar } from "@/view/components/layout/top-bar"

export function AppShell() {
  const location = useLocation()

  const headerTitle = location.pathname.startsWith("/inventory")
    ? "مدير المخزون"
    : "مدير المتجر"

  return (
    <div
      className="flex min-h-svh flex-col bg-[var(--erp-page)] text-[var(--erp-text)]"
      dir="rtl"
      lang="ar"
    >
      <TopBar title={headerTitle} />

      <div className="flex min-h-0 flex-1">
        <AppSidebar />

        <main className="erp-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-8 sm:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
