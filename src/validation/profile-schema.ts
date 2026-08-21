import { z } from "zod"

import i18n from "@/i18n"
import { normalizeText, optionalText } from "./helpers"
import { optionalTrimmedText, requiredText } from "./zod-helpers"
import type { UpdateCurrentUserProfilePayload } from "@/services/user-service"

const PHONE_PATTERN = /^[0-9+\-()\s]+$/

function phoneField() {
  return z.string().superRefine((value, ctx) => {
    const phone = normalizeText(value)

    if (!phone) return

    if (phone.length > 30) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:shared.phoneMax30"),
      })
    }

    if (!PHONE_PATTERN.test(phone)) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:shared.phoneInvalid"),
      })
    }
  })
}

function emailField() {
  return requiredText({
    max: 120,
    requiredMessage: () => i18n.t("validation:emailRequired"),
    maxMessage: () => i18n.t("validation:shared.emailMax120"),
  }).superRefine((value, ctx) => {
    const email = normalizeText(value)

    if (!email) return

    const validation = z.email().safeParse(email)
    if (!validation.success) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:shared.emailInvalid"),
      })
    }
  })
}

function nationalIdField() {
  return z.string().superRefine((value, ctx) => {
    const nationalId = normalizeText(value)

    if (!nationalId) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:profile.nationalIdRequired"),
      })
      return
    }

    if (nationalId.length < 5) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:profile.nationalIdMin"),
      })
    }

    if (nationalId.length > 50) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:profile.nationalIdMax"),
      })
    }
  })
}

export const updateProfileSchema = z.object({
  fullName: requiredText({
    min: 2,
    max: 100,
    requiredMessage: () => i18n.t("validation:profile.nameRequired"),
    minMessage: () => i18n.t("validation:profile.nameMin"),
    maxMessage: () => i18n.t("validation:profile.nameMax"),
  }),

  fullNameAr: optionalTrimmedText({
    max: 100,
    maxMessage: () => i18n.t("validation:shared.nameArMax100"),
  }),

  email: emailField(),
  phoneNumber: phoneField(),
  nationalId: nationalIdField(),
})

export type UpdateProfileFormValues = z.input<typeof updateProfileSchema>
export type UpdateProfileFormErrors = Partial<
  Record<keyof UpdateProfileFormValues, string>
>

export function updateProfileZodErrorToFormErrors(error: z.ZodError) {
  const errors: UpdateProfileFormErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (
      field !== "fullName" &&
      field !== "fullNameAr" &&
      field !== "email" &&
      field !== "phoneNumber" &&
      field !== "nationalId"
    ) {
      continue
    }

    errors[field] ??= issue.message
  }

  return errors
}

export function updateProfileFormValuesToPayload(
  values: UpdateProfileFormValues
): UpdateCurrentUserProfilePayload {
  const fullNameAr = optionalText(values.fullNameAr)
  const phoneNumber = optionalText(values.phoneNumber)

  return {
    fullName: normalizeText(values.fullName),
    ...(fullNameAr ? { fullNameAr } : {}),
    email: normalizeText(values.email).toLowerCase(),
    ...(phoneNumber ? { phoneNumber } : {}),
    nationalId: normalizeText(values.nationalId),
  }
}
