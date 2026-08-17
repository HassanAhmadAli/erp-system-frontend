import { useTranslation } from "react-i18next"

import { APP_LANGUAGES, type AppLanguage } from "@/i18n/types"
import { useLocale } from "@/i18n/locale-provider"
import { useUpdateLanguage } from "@/hooks/useUpdateLanguage"
import { useTheme, type Theme } from "@/view/components/theme-provider"

const THEME_OPTIONS: Theme[] = ["light", "dark", "system"]

export function SettingsPage() {
  const { t } = useTranslation(["settings", "common"])
  const { language } = useLocale()
  const { theme, setTheme } = useTheme()
  const updateLanguage = useUpdateLanguage()

  const errorMessage =
    updateLanguage.error instanceof Error
      ? updateLanguage.error.message
      : updateLanguage.isError
        ? t("settings:languageUpdateFailed")
        : ""

  const successMessage =
    updateLanguage.isSuccess && !updateLanguage.isPending
      ? t("settings:languageUpdated")
      : ""

  function handleLanguageChange(next: AppLanguage) {
    if (next === language || updateLanguage.isPending) return
    updateLanguage.mutate(next)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 text-start text-[var(--erp-text)]">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{t("settings:title")}</h1>
        <p className="text-sm text-[var(--erp-muted)]">
          {t("settings:subtitle")}
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            {t("settings:languageSection")}
          </h2>
          <p className="text-sm text-[var(--erp-muted)]">
            {t("settings:languageHint")}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {APP_LANGUAGES.map((option) => {
            const selected = language === option
            return (
              <button
                key={option}
                type="button"
                disabled={updateLanguage.isPending}
                onClick={() => handleLanguageChange(option)}
                className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                  selected
                    ? "border-[var(--erp-brand-solid)] bg-[var(--erp-nav-active-bg)] text-[var(--erp-brand-solid)]"
                    : "border-[var(--erp-border)] bg-[var(--erp-page)] text-[var(--erp-text)] hover:bg-[var(--erp-nav-active-bg)]"
                }`}
              >
                {option === "ar" ? t("common:arabic") : t("common:english")}
              </button>
            )
          })}
        </div>

        {updateLanguage.isPending && (
          <p className="text-sm text-[var(--erp-muted)]">
            {t("settings:savingLanguage")}
          </p>
        )}
        {successMessage && (
          <p className="text-sm text-emerald-600">{successMessage}</p>
        )}
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      </section>

      <section className="space-y-4 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            {t("settings:themeSection")}
          </h2>
          <p className="text-sm text-[var(--erp-muted)]">
            {t("settings:themeHint")}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {THEME_OPTIONS.map((option) => {
            const selected = theme === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => setTheme(option)}
                className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                  selected
                    ? "border-[var(--erp-brand-solid)] bg-[var(--erp-nav-active-bg)] text-[var(--erp-brand-solid)]"
                    : "border-[var(--erp-border)] bg-[var(--erp-page)] text-[var(--erp-text)] hover:bg-[var(--erp-nav-active-bg)]"
                }`}
              >
                {t(`common:${option}`)}
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
