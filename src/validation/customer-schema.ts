import { z } from "zod"

import {
  normalizeText,
  optionalText,
  parseNonNegativeInteger,
} from "./helpers"
import { optionalTrimmedText } from "./zod-helpers"

const PHONE_PATTERN = /^[0-9+\-()\s]+$/

export const CUSTOMER_STATUS_OPTIONS = ["active", "inactive"] as const

export type CustomerStatus = (typeof CUSTOMER_STATUS_OPTIONS)[number]

export const customerSchema = z.object({
  fullName: optionalTrimmedText({
    min: 2,
    max: 100,
    minMessage: "اسم العميل يجب أن يكون حرفين على الأقل",
    maxMessage: "اسم العميل يجب ألا يتجاوز 100 حرف",
  }),
  phoneNumber: optionalTrimmedText({
    max: 30,
    maxMessage: "رقم الهاتف يجب ألا يتجاوز 30 حرف",
  }).superRefine((value, ctx) => {
    const phone = normalizeText(value ?? "")

    if (phone && !PHONE_PATTERN.test(phone)) {
      ctx.addIssue({
        code: "custom",
        message:
          "رقم الهاتف يجب أن يحتوي على أرقام ومسافات والرموز + - ( ) فقط",
      })
    }
  }),
  email: optionalTrimmedText({
    max: 120,
    maxMessage: "البريد الإلكتروني يجب ألا يتجاوز 120 حرف",
  }).superRefine((value, ctx) => {
    const email = normalizeText(value ?? "")

    if (!email) return

    const validation = z.email().safeParse(email)
    if (!validation.success) {
      ctx.addIssue({
        code: "custom",
        message: "أدخل بريدًا إلكترونيًا صالحًا",
      })
    }
  }),
  address: optionalTrimmedText({
    max: 255,
    maxMessage: "العنوان يجب ألا يتجاوز 255 حرف",
  }),
  loyaltyPoints: z.union([z.string(), z.number()]).optional().superRefine(
    (value, ctx) => {
      if (value == null || String(value).trim() === "") return

      if (parseNonNegativeInteger(value) == null) {
        ctx.addIssue({
          code: "custom",
          message: "نقاط الولاء يجب أن تكون رقمًا صحيحًا لا يقل عن الصفر",
        })
      }
    }
  ),
})

export type CustomerFormValues = z.input<typeof customerSchema>

export type CustomerRequestPayload = {
  fullName?: string
  phoneNumber?: string
  email?: string
  address?: string
  loyaltyPoints?: number
}

export type CustomerFormErrors = Partial<
  Record<keyof CustomerFormValues, string>
>

export function isCustomerStatus(status: unknown): status is CustomerStatus {
  return CUSTOMER_STATUS_OPTIONS.includes(status as CustomerStatus)
}

export function customerZodErrorToFormErrors(error: z.ZodError) {
  const errors: CustomerFormErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (
      field !== "fullName" &&
      field !== "phoneNumber" &&
      field !== "email" &&
      field !== "address" &&
      field !== "loyaltyPoints"
    ) {
      continue
    }

    errors[field] ??= issue.message
  }

  return errors
}

export function customerFormValuesToPayload(
  values: CustomerFormValues
): CustomerRequestPayload {
  const fullName = optionalText(values.fullName)
  const phoneNumber = optionalText(values.phoneNumber)
  const email = optionalText(values.email)?.toLowerCase()
  const address = optionalText(values.address)
  const loyaltyPoints =
    values.loyaltyPoints == null || String(values.loyaltyPoints).trim() === ""
      ? undefined
      : parseNonNegativeInteger(values.loyaltyPoints)

  if (
    values.loyaltyPoints != null &&
    String(values.loyaltyPoints).trim() !== "" &&
    loyaltyPoints == null
  ) {
    throw new Error("Invalid customer loyaltyPoints")
  }

  return {
    ...(fullName ? { fullName } : {}),
    ...(phoneNumber ? { phoneNumber } : {}),
    ...(email ? { email } : {}),
    ...(address ? { address } : {}),
    ...(loyaltyPoints != null ? { loyaltyPoints } : {}),
  }
}
