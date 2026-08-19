import { useTranslation } from "react-i18next"

import { LoginCard } from "@/view/components/auth/login-card"
import { ThemeToggle } from "@/view/components/layout/theme-toggle"
import { useLocale } from "@/i18n/locale-provider"
import { APP_LANGUAGES, type AppLanguage } from "@/i18n/types"

export function LoginPage() {
  const { t } = useTranslation("common")
  const { dir, language, setLanguage } = useLocale()

  return (
    <main
      className="relative flex h-svh items-center justify-center overflow-y-auto bg-[var(--erp-page)] px-4 py-8"
      dir={dir}
      lang={language}
    >
      <div className="absolute end-5 top-5 flex items-center gap-2 sm:end-10 sm:top-8">
        <select
          aria-label={t("language")}
          className="h-9 rounded-xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-2 text-sm text-[var(--erp-text)]"
          value={language}
          onChange={(event) => setLanguage(event.target.value as AppLanguage)}
        >
          {APP_LANGUAGES.map((option) => (
            <option key={option} value={option}>
              {option === "ar" ? t("arabic") : t("english")}
            </option>
          ))}
        </select>
        <ThemeToggle tone="page" />
      </div>
      <LoginCard />
    </main>
  )
}
