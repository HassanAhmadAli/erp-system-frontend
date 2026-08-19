import { useEffect } from "react"

import { useCurrentUser } from "@/hooks/useCurrentUser"
import { useLocale } from "@/i18n/locale-provider"
import { isAppLanguage } from "@/i18n/types"

/**
 * When authenticated, sync UI locale from the backend user preference.
 */
export function useSyncLanguageFromUser() {
  const { data: user } = useCurrentUser()
  const { language, setLanguage } = useLocale()

  useEffect(() => {
    if (!user?.language) return
    if (!isAppLanguage(user.language)) return
    if (user.language === language) return

    setLanguage(user.language)
  }, [user?.language, language, setLanguage])
}
