import { z } from "zod"

import { normalizeText } from "./helpers"
import { requiredText } from "./zod-helpers"

const PHONE_PATTERN = /^[0-9+\-()\s]+$/

export const supplierSchema = z.object({
  fullName: requiredText({
    min: 2,
    max: 100,
    requiredMessage: "اسم المورد مطلوب",
    minMessage: "اسم المورد يجب أن يكون حرفين على الأقل",
    maxMessage: "اسم المورد يجب ألا يتجاوز 100 حرف",
  }),

  phone: requiredText({
    max: 30,
    requiredMessage: "رقم الهاتف مطلوب",
    maxMessage: "رقم الهاتف يجب ألا يتجاوز 30 حرف",
  }).superRefine((value, ctx) => {
    const phone = normalizeText(value)

    if (phone && !PHONE_PATTERN.test(phone)) {
      ctx.addIssue({
        code: "custom",
        message:
          "رقم الهاتف يجب أن يحتوي على أرقام ومسافات والرموز + - ( ) فقط",
      })
    }
  }),

  email: requiredText({
    max: 120,
    requiredMessage: "البريد الإلكتروني مطلوب",
    maxMessage: "البريد الإلكتروني يجب ألا يتجاوز 120 حرف",
  }).superRefine((value, ctx) => {
    const email = normalizeText(value)

    if (!email) return

    const validation = z.email().safeParse(email)
    if (!validation.success) {
      ctx.addIssue({
        code: "custom",
        message: "أدخل بريدًا إلكترونيًا صالحًا",
      })
    }
  }),

  address: z.string().superRefine((value, ctx) => {
    const address = normalizeText(value)

    if (address.length > 255) {
      ctx.addIssue({
        code: "custom",
        message: "العنوان يجب ألا يتجاوز 255 حرف",
      })
    }
  }),
})

export type SupplierFormValues = z.input<typeof supplierSchema>

export type SupplierFormErrors = Partial<
  Record<keyof SupplierFormValues, string>
>

export type SupplierRequestPayload = {
  fullName: string
  phone: string
  email: string
  address: string
}

export function supplierZodErrorToFormErrors(error: z.ZodError) {
  const errors: SupplierFormErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (
      field !== "fullName" &&
      field !== "phone" &&
      field !== "email" &&
      field !== "address"
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
  return {
    fullName: normalizeText(values.fullName),
    phone: normalizeText(values.phone),
    email: normalizeText(values.email).toLowerCase(),
    address: normalizeText(values.address),
  }
}
