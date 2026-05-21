import * as React from "react"

import { useTheme } from "@/view/components/theme-provider"
import { Button } from "@/view/components/ui/button"
import { Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"

type Tone = "purpleHeader" | "page"

type ThemeToggleProps = {
  tone?: Tone
  className?: string
}

/**
 * Reads `.dark` on `<html>` so it stays synced with ThemeProvider keyboard shortcut + storage.
 */
export function ThemeToggle({
  tone = "purpleHeader",
  className,
}: ThemeToggleProps) {
  const { setTheme } = useTheme()
  const [isDark, setIsDark] = React.useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  )

  React.useEffect(() => {
    const node = document.documentElement
    const sync = () => setIsDark(node.classList.contains("dark"))
    sync()
    const obs = new MutationObserver(sync)
    obs.observe(node, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  const headerClasses =
    "text-white hover:bg-white/15 focus-visible:ring-white/40"
  const pageClasses =
    "rounded-full border border-[var(--erp-sidebar-divider)] bg-[var(--erp-card)] text-[var(--erp-top-bar)] hover:bg-[var(--erp-nav-hover)]"

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
      className={cn(
        tone === "purpleHeader" ? headerClasses : pageClasses,
        className
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun className="size-5 shrink-0" />
      ) : (
        <Moon className="size-5 shrink-0" />
      )}
    </Button>
  )
}
