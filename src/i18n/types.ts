export const APP_LANGUAGES = ["ar", "en"] as const

export type AppLanguage = (typeof APP_LANGUAGES)[number]

export const DEFAULT_LANGUAGE: AppLanguage = "ar"
export const LANGUAGE_STORAGE_KEY = "erp-language"

export function isAppLanguage(
  value: string | null | undefined
): value is AppLanguage {
  return value === "ar" || value === "en"
}

export function languageDirection(language: AppLanguage): "rtl" | "ltr" {
  return language === "ar" ? "rtl" : "ltr"
}
