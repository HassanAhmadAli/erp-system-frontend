import { useMutation, useQueryClient } from "@tanstack/react-query"

import { refreshTokens } from "@/services/auth-service"
import {
  updateCurrentUserProfile,
  updateStoreManagerProfile,
  updateUserLanguage,
  type UpdateCurrentUserProfilePayload,
  type UserProfile,
} from "@/services/user-service"
import { getRefreshToken, saveTokens } from "@/utils/auth-storage"
import type { AppLanguage } from "@/i18n/types"
import { useLocale } from "@/i18n/locale-provider"

export type LanguageUpdateResult = {
  language: AppLanguage
}

async function refreshAccessTokenAfterLanguageChange() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return

  try {
    const tokens = await refreshTokens(refreshToken)
    saveTokens(tokens.access_token, tokens.refresh_token)
  } catch {
    // Token refresh is best-effort; the preference is already stored.
  }
}

export function useUpdateLanguage() {
  const queryClient = useQueryClient()
  const { setLanguage } = useLocale()

  return useMutation({
    mutationFn: async (
      language: AppLanguage
    ): Promise<LanguageUpdateResult> => {
      await updateUserLanguage(language)

      queryClient.setQueryData<UserProfile>(["currentUser"], (current) =>
        current ? { ...current, language } : current
      )
      setLanguage(language)
      await refreshAccessTokenAfterLanguageChange()
      void queryClient.invalidateQueries({ queryKey: ["currentUser"] })

      return { language }
    },
  })
}

export function useUpdateCurrentProfile() {
  const queryClient = useQueryClient()
  const { setLanguage } = useLocale()

  return useMutation({
    mutationFn: async (payload: UpdateCurrentUserProfilePayload) => {
      const current = queryClient.getQueryData<UserProfile>(["currentUser"])

      if (current?.role === "STORE_MANAGER") {
        try {
          return await updateStoreManagerProfile(payload)
        } catch {
          return updateCurrentUserProfile(payload)
        }
      }

      return updateCurrentUserProfile(payload)
    },
    onSuccess: async (profile, payload) => {
      if (payload.language) {
        queryClient.setQueryData<UserProfile>(["currentUser"], (current) =>
          current ? { ...current, language: payload.language } : current
        )
        setLanguage(payload.language)
        await refreshAccessTokenAfterLanguageChange()
      }
      void queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      return profile
    },
  })
}
