import * as React from "react"
import { useTranslation } from "react-i18next"

import i18n, { getCurrentLanguage } from "@/i18n"
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  isAppLanguage,
  languageDirection,
  type AppLanguage,
} from "@/i18n/types"

type LocaleProviderState = {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
  dir: "rtl" | "ltr"
}

const LocaleProviderContext = React.createContext<
  LocaleProviderState | undefined
>(undefined)

function applyDocumentLanguage(language: AppLanguage) {
  const root = document.documentElement
  root.lang = language
  root.dir = languageDirection(language)
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { i18n: i18nInstance } = useTranslation()
  const [language, setLanguageState] = React.useState<AppLanguage>(() =>
    getCurrentLanguage()
  )

  const setLanguage = React.useCallback((next: AppLanguage) => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next)
    } catch {
      // ignore storage errors
    }
    void i18n.changeLanguage(next)
    applyDocumentLanguage(next)
    setLanguageState(next)
  }, [])

  React.useEffect(() => {
    applyDocumentLanguage(language)
  }, [language])

  React.useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      const next = lng.split("-")[0]
      if (isAppLanguage(next) && next !== language) {
        setLanguageState(next)
        applyDocumentLanguage(next)
      }
    }

    i18nInstance.on("languageChanged", handleLanguageChanged)
    return () => {
      i18nInstance.off("languageChanged", handleLanguageChanged)
    }
  }, [i18nInstance, language])

  React.useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return
      if (event.key !== LANGUAGE_STORAGE_KEY) return

      if (isAppLanguage(event.newValue)) {
        void i18n.changeLanguage(event.newValue)
        applyDocumentLanguage(event.newValue)
        setLanguageState(event.newValue)
        return
      }

      void i18n.changeLanguage(DEFAULT_LANGUAGE)
      applyDocumentLanguage(DEFAULT_LANGUAGE)
      setLanguageState(DEFAULT_LANGUAGE)
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const value = React.useMemo(
    () => ({
      language,
      setLanguage,
      dir: languageDirection(language),
    }),
    [language, setLanguage]
  )

  return (
    <LocaleProviderContext.Provider value={value}>
      {children}
    </LocaleProviderContext.Provider>
  )
}

export function useLocale() {
  const context = React.useContext(LocaleProviderContext)

  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }

  return context
}
