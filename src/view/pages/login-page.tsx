import { LoginCard } from "@/view/components/auth/login-card"
import { ThemeToggle } from "@/view/components/layout/theme-toggle"

export function LoginPage() {
  return (
    <main
      className="relative flex min-h-svh items-center justify-center bg-[var(--erp-page)] px-4 py-8"
      dir="rtl"
      lang="ar"
    >
      <div className="absolute end-5 top-5 sm:end-10 sm:top-8">
        <ThemeToggle tone="page" />
      </div>
      <LoginCard />
    </main>
  )
}
