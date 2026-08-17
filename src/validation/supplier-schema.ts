import { z } from "zod"

import i18n from "@/i18n"
import { normalizeText, optionalText } from "./helpers"
import { optionalTrimmedText, requiredText } from "./zod-helpers"

const PHONE_PATTERN = /^[0-9+\-()\s]+$/

export const supplierSchema = z.object({
  fullName: requiredText({
    min: 2,
    max: 100,
    requiredMessage: () => i18n.t("validation:supplier.nameRequired"),
    minMessage: () => i18n.t("validation:supplier.nameMin"),
    maxMessage: () => i18n.t("validation:supplier.nameMax"),
  }),

  fullNameAr: optionalTrimmedText({
    max: 100,
    maxMessage: () => i18n.t("validation:shared.nameArMax100"),
  }),

  phone: requiredText({
    max: 30,
    requiredMessage: () => i18n.t("validation:supplier.phoneRequired"),
    maxMessage: () => i18n.t("validation:shared.phoneMax30"),
  }).superRefine((value, ctx) => {
    const phone = normalizeText(value)

    if (phone && !PHONE_PATTERN.test(phone)) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:shared.phoneInvalid"),
      })
    }
  }),

  email: requiredText({
    max: 120,
    requiredMessage: () => i18n.t("validation:supplier.emailRequired"),
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
  }),

  address: z.string().superRefine((value, ctx) => {
    const address = normalizeText(value)

    if (address.length > 255) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:shared.addressMax255"),
      })
    }
  }),

  addressAr: optionalTrimmedText({
    max: 255,
    maxMessage: () => i18n.t("validation:shared.addressArMax255"),
  }),
})

export type SupplierFormValues = z.input<typeof supplierSchema>

export type SupplierFormErrors = Partial<
  Record<keyof SupplierFormValues, string>
>

export type SupplierRequestPayload = {
  fullName: string
  fullNameAr?: string
  phone: string
  email: string
  address: string
  addressAr?: string
}

export function supplierZodErrorToFormErrors(error: z.ZodError) {
  const errors: SupplierFormErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (
      field !== "fullName" &&
      field !== "fullNameAr" &&
      field !== "phone" &&
      field !== "email" &&
      field !== "address" &&
      field !== "addressAr"
    ) {
      continue
    }

    errors[field] ??= issue.message
  }

  return errors
}

export function supplierFormValuesToPayload(
  values: SupplierFormValues
): SupplierRequestPayload {
  const fullNameAr = optionalText(values.fullNameAr)
  const addressAr = optionalText(values.addressAr)

  return {
    fullName: normalizeText(values.fullName),
    ...(fullNameAr ? { fullNameAr } : {}),
    phone: normalizeText(values.phone),
    email: normalizeText(values.email).toLowerCase(),
    address: normalizeText(values.address),
    ...(addressAr ? { addressAr } : {}),
  }
}
