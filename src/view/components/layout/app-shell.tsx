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
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed))
    } catch {
      // ignore storage errors
    }
  }, [sidebarCollapsed])

  useEffect(() => {
    if (!mobileNavOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileNavOpen(false)
      }
    }

    function handleResize() {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setMobileNavOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    window.addEventListener("resize", handleResize)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("resize", handleResize)
      document.body.style.overflow = previousOverflow
    }
  }, [mobileNavOpen])

  function toggleSidebar() {
    setSidebarCollapsed((current) => !current)
  }

  function closeMobileNav() {
    setMobileNavOpen(false)
  }

  return (
    <div
      className="flex h-svh flex-col overflow-hidden bg-[var(--erp-page)] text-[var(--erp-text)]"
      dir="rtl"
      lang="ar"
    >
      <TopBar title={headerTitle} onMenuClick={() => setMobileNavOpen(true)} />

      <div className="flex min-h-0 flex-1">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          className="hidden lg:flex"
        />

        <main className="erp-scrollbar min-h-0 flex-1 overflow-y-auto bg-[var(--erp-bg)] px-5 py-8 sm:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal>
          <button
            type="button"
            aria-label="إغلاق القائمة"
            className="absolute inset-0 bg-black/50"
            onClick={closeMobileNav}
          />
          <AppSidebar
            collapsed={false}
            showCollapseToggle={false}
            onNavigate={closeMobileNav}
            className="absolute inset-y-0 start-0 z-10 h-full shadow-[var(--erp-shadow)]"
          />
        </div>
      )}
    </div>
  )
}
