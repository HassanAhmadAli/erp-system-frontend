import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { getDefaultRouteForRole } from "@/auth/permissions"
import {
  AUTH_USER_TYPES,
  type AuthUserType,
  loginUser,
} from "@/services/auth-service"
import { getCurrentUser } from "@/services/user-service"
import { saveTokens } from "@/utils/auth-storage"

const USER_TYPE_LABELS: Record<AuthUserType, string> = {
  "store-manager": "مدير متجر",
  manager: "مدير",
  accountant: "محاسب",
  "warehouse-worker": "عامل مستودع",
  cashier: "كاشير",
}

export function LoginCard() {
  const [userType, setUserType] = useState<AuthUserType>("warehouse-worker")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginMessage, setLoginMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleLogin = async () => {
    const trimmedEmail = email.trim()

    if (!trimmedEmail || !password) {
      setLoginMessage("يرجى إدخال البريد الإلكتروني وكلمة المرور")
      return
    }

    if (isSubmitting) return

    setIsSubmitting(true)
    setLoginMessage("")

    try {
      const result = await loginUser(userType, trimmedEmail, password)
      saveTokens(result.access_token, result.refresh_token)
      const user = await getCurrentUser()
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      setLoginMessage("تم تسجيل الدخول بنجاح")
      navigate(getDefaultRouteForRole(user.role), { replace: true })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "فشل تسجيل الدخول"
      setLoginMessage(message || "فشل تسجيل الدخول")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="w-full max-w-md rounded-[24px] bg-[var(--erp-card)] p-8 shadow-[var(--erp-shadow)]">
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="text-center">
          <h1 className="text-2xl font-bold">مرحبًا بعودتك</h1>
          <p className="text-sm text-[var(--erp-muted)]">
            سجّل دخولك لمتابعة إدارة النظام
          </p>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--erp-top-bar)] text-white">
          ERP
        </div>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          void handleLogin()
        }}
      >
        <label className="block">
          <span className="mb-2 block text-right text-sm">نوع المستخدم</span>
          <select
            className="h-11 w-full rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[color-mix(in_srgb,var(--erp-sidebar)_82%,white)] px-3 dark:bg-[color-mix(in_srgb,var(--erp-card)_70%,#000)]"
            value={userType}
            onChange={(e) => setUserType(e.target.value as AuthUserType)}
            disabled={isSubmitting}
          >
            {AUTH_USER_TYPES.map((type) => (
              <option key={type} value={type}>
                {USER_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-right text-sm">
            البريد الالكتروني
          </span>
          <div className="flex items-center rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[color-mix(in_srgb,var(--erp-sidebar)_82%,white)] px-3 dark:bg-[color-mix(in_srgb,var(--erp-card)_70%,#000)]">
            <input
              type="email"
              autoComplete="email"
              className="h-11 w-full bg-transparent text-right outline-none placeholder:text-[var(--erp-muted)]"
              placeholder="أدخل البريد الالكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-right text-sm">كلمة المرور</span>
          <div className="flex items-center rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[color-mix(in_srgb,var(--erp-sidebar)_82%,white)] px-3 dark:bg-[color-mix(in_srgb,var(--erp-card)_70%,#000)]">
            <input
              type="password"
              autoComplete="current-password"
              className="h-11 w-full bg-transparent text-right outline-none placeholder:text-[var(--erp-muted)]"
              placeholder="•••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-2xl bg-[var(--erp-top-bar)] text-base text-white hover:bg-[color-mix(in_srgb,var(--erp-top-bar)_88%,#000)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
        </button>
      </form>

      {loginMessage && (
        <p
          className="mt-4 text-center text-sm text-[var(--erp-muted)]"
          role="alert"
        >
          {loginMessage}
        </p>
      )}

      <p className="mt-4 text-center text-sm text-[var(--erp-muted)]">
        للدخول السريع للتصميم:{" "}
        <Link
          to="/categories"
          className="font-semibold text-[var(--erp-brand)]"
        >
          متابعة بدون تسجيل
        </Link>
      </p>
    </section>
  )
}
