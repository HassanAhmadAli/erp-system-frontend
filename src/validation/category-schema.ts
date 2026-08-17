import { z } from "zod"

import i18n from "@/i18n"
import { normalizeText, optionalText } from "./helpers"
import { optionalTrimmedText, requiredText } from "./zod-helpers"

export const categorySchema = z.object({
  name: requiredText({
    min: 2,
    max: 100,
    requiredMessage: () => i18n.t("validation:category.nameRequired"),
    minMessage: () => i18n.t("validation:category.nameMin"),
    maxMessage: () => i18n.t("validation:category.nameMax"),
  }),

  nameAr: optionalTrimmedText({
    max: 100,
    maxMessage: () => i18n.t("validation:shared.nameArMax100"),
  }),

  description: optionalTrimmedText({
    max: 500,
    maxMessage: () => i18n.t("validation:category.descriptionMax"),
  }),

  descriptionAr: optionalTrimmedText({
    max: 500,
    maxMessage: () => i18n.t("validation:shared.descriptionArMax500"),
  }),
})

export type CategoryFormValues = z.input<typeof categorySchema>

export type CategoryFormErrors = Partial<
  Record<keyof CategoryFormValues, string>
>

export type CategoryRequestPayload = {
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
}

export function categoryZodErrorToFormErrors(error: z.ZodError) {
  const errors: CategoryFormErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (
      field !== "name" &&
      field !== "nameAr" &&
      field !== "description" &&
      field !== "descriptionAr"
    ) {
      continue
    }

    errors[field] ??= issue.message
  }

  return errors
}

export function categoryFormValuesToPayload(
  values: CategoryFormValues
): CategoryRequestPayload {
  const nameAr = optionalText(values.nameAr)
  const description = optionalText(values.description)
  const descriptionAr = optionalText(values.descriptionAr)

  return {
    name: normalizeText(values.name),
    ...(nameAr ? { nameAr } : {}),
    ...(description ? { description } : {}),
    ...(descriptionAr ? { descriptionAr } : {}),
  }
}
