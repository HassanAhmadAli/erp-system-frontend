import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isAppLanguage,
  type AppLanguage,
} from "@/i18n/types"

import arCommon from "@/i18n/locales/ar/common.json"
import arNav from "@/i18n/locales/ar/nav.json"
import arAuth from "@/i18n/locales/ar/auth.json"
import arSettings from "@/i18n/locales/ar/settings.json"
import arValidation from "@/i18n/locales/ar/validation.json"
import arPages from "@/i18n/locales/ar/pages.json"

import enCommon from "@/i18n/locales/en/common.json"
import enNav from "@/i18n/locales/en/nav.json"
import enAuth from "@/i18n/locales/en/auth.json"
import enSettings from "@/i18n/locales/en/settings.json"
import enValidation from "@/i18n/locales/en/validation.json"
import enPages from "@/i18n/locales/en/pages.json"

export const i18nNamespaces = [
  "common",
  "nav",
  "auth",
  "settings",
  "validation",
  "pages",
] as const

function readStoredLanguage(): AppLanguage {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (isAppLanguage(stored)) {
      return stored
    }
  } catch {
    // ignore storage errors
  }

  return DEFAULT_LANGUAGE
}

void i18n.use(initReactI18next).init({
  resources: {
    ar: {
      common: arCommon,
      nav: arNav,
      auth: arAuth,
      settings: arSettings,
      validation: arValidation,
      pages: arPages,
    },
    en: {
      common: enCommon,
      nav: enNav,
      auth: enAuth,
      settings: enSettings,
      validation: enValidation,
      pages: enPages,
    },
  },
  lng: readStoredLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: "common",
  ns: [...i18nNamespaces],
  interpolation: {
    escapeValue: false,
  },
})

export function getCurrentLanguage(): AppLanguage {
  const language = i18n.language?.split("-")[0]
  return isAppLanguage(language) ? language : DEFAULT_LANGUAGE
}

export default i18n
