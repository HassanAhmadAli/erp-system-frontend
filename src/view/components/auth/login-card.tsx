import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { getDefaultRouteForRole } from "@/auth/permissions"
import {
  AUTH_USER_TYPES,
  type AuthUserType,
  loginUser,
} from "@/services/auth-service"
import { getCurrentUser } from "@/services/user-service"
import { saveTokens } from "@/utils/auth-storage"
import { loginSchema } from "@/validation/auth-schema"
import { useLocale } from "@/i18n/locale-provider"
import { isAppLanguage } from "@/i18n/types"

export function LoginCard() {
  const { t } = useTranslation(["auth", "common"])
  const { setLanguage } = useLocale()
  const [userType, setUserType] = useState<AuthUserType>("warehouse-worker")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginMessage, setLoginMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handleLogin = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setLoginMessage("")

    try {
      const validationResult = loginSchema.safeParse({
        userType,
        email,
        password,
      })

      if (!validationResult.success) {
        setLoginMessage(
          validationResult.error.issues[0]?.message ||
            t("common:validationFailed")
        )
        return
      }

      const result = await loginUser(
        userType,
        validationResult.data.email,
        validationResult.data.password
      )
      saveTokens(result.access_token, result.refresh_token)
      const user = await getCurrentUser()
      if (isAppLanguage(user.language)) {
        setLanguage(user.language)
      }
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      setLoginMessage(t("auth:loginSuccess"))
      navigate(getDefaultRouteForRole(user.role), { replace: true })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("auth:loginFailed")
      setLoginMessage(message || t("auth:loginFailed"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="w-full max-w-md rounded-[24px] bg-[var(--erp-card)] p-8 shadow-[var(--erp-shadow)]">
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("auth:welcomeBack")}</h1>
          <p className="text-sm text-[var(--erp-muted)]">
            {t("auth:signInSubtitle")}
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
          <span className="mb-2 block text-start text-sm">
            {t("auth:userType")}
          </span>
          <select
            className="h-11 w-full rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[color-mix(in_srgb,var(--erp-sidebar)_82%,white)] px-3 dark:bg-[color-mix(in_srgb,var(--erp-card)_70%,#000)]"
            value={userType}
            onChange={(e) => setUserType(e.target.value as AuthUserType)}
            disabled={isSubmitting}
          >
            {AUTH_USER_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`auth:userTypes.${type}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-start text-sm">
            {t("auth:email")}
          </span>
          <div className="flex items-center rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[color-mix(in_srgb,var(--erp-sidebar)_82%,white)] px-3 dark:bg-[color-mix(in_srgb,var(--erp-card)_70%,#000)]">
            <input
              type="email"
              autoComplete="email"
              className="h-11 w-full bg-transparent text-start outline-none placeholder:text-[var(--erp-muted)]"
              placeholder={t("auth:emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-start text-sm">
            {t("auth:password")}
          </span>
          <div className="flex items-center rounded-2xl border border-[var(--erp-sidebar-divider)] bg-[color-mix(in_srgb,var(--erp-sidebar)_82%,white)] px-3 dark:bg-[color-mix(in_srgb,var(--erp-card)_70%,#000)]">
            <input
              type="password"
              autoComplete="current-password"
              className="h-11 w-full bg-transparent text-start outline-none placeholder:text-[var(--erp-muted)]"
              placeholder={t("auth:passwordPlaceholder")}
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
          {isSubmitting ? t("auth:signingIn") : t("auth:signIn")}
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
    </section>
  )
}
