import { getCurrentLanguage } from "@/i18n"
import type { AppLanguage } from "@/i18n/types"

/**
 * Pick bilingual content for the active UI language.
 * Falls back to the other language when the preferred value is empty.
 */
export function localized(
  en?: string | null,
  ar?: string | null,
  language: AppLanguage = getCurrentLanguage()
): string {
  const english = en?.trim() ?? ""
  const arabic = ar?.trim() ?? ""

  if (language === "ar") {
    return arabic || english
  }

  return english || arabic
}

export function localizedName(
  entity: { name?: string | null; nameAr?: string | null },
  language?: AppLanguage
) {
  return localized(entity.name, entity.nameAr, language)
}

export function localizedFullName(
  entity: { fullName?: string | null; fullNameAr?: string | null },
  language?: AppLanguage
) {
  return localized(entity.fullName, entity.fullNameAr, language)
}

export function localizedTitle(
  entity: { title?: string | null; titleAr?: string | null },
  language?: AppLanguage
) {
  return localized(entity.title, entity.titleAr, language)
}

export function localizedDescription(
  entity: { description?: string | null; descriptionAr?: string | null },
  language?: AppLanguage
) {
  return localized(entity.description, entity.descriptionAr, language)
}
