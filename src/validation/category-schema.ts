import { z } from "zod"

import { normalizeText, optionalText } from "./helpers"
import { optionalTrimmedText, requiredText } from "./zod-helpers"

export const categorySchema = z.object({
  name: requiredText({
    min: 2,
    max: 100,
    requiredMessage: "اسم التصنيف مطلوب",
    minMessage: "اسم التصنيف يجب أن يكون حرفين على الأقل",
    maxMessage: "اسم التصنيف يجب ألا يتجاوز 100 حرف",
  }),

  description: optionalTrimmedText({
    max: 500,
    maxMessage: "الوصف يجب ألا يتجاوز 500 حرف",
  }),
})

export type CategoryFormValues = z.input<typeof categorySchema>

export type CategoryFormErrors = Partial<
  Record<keyof CategoryFormValues, string>
>

export type CategoryRequestPayload = {
  name: string
  description?: string
}

export function categoryZodErrorToFormErrors(error: z.ZodError) {
  const errors: CategoryFormErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (field !== "name" && field !== "description") continue

    errors[field] ??= issue.message
  }

  return errors
}

export function categoryFormValuesToPayload(
  values: CategoryFormValues
): CategoryRequestPayload {
  const description = optionalText(values.description)

  return {
    name: normalizeText(values.name),
    ...(description ? { description } : {}),
  }
}
