import { z } from "zod"

import i18n from "@/i18n"
import { normalizeText, optionalText } from "./helpers"
import { optionalTrimmedText, requiredText } from "./zod-helpers"

const PHONE_PATTERN = /^[0-9+\-()\s]+$/

export const STAFF_ROLE_VALUES = [
  "CASHIER",
  "ACCOUNTANT",
  "WAREHOUSE_WORKER",
] as const

export type StaffRoleValue = (typeof STAFF_ROLE_VALUES)[number]

const staffRoleSchema = z.enum(STAFF_ROLE_VALUES, {
  error: () => i18n.t("validation:staff.roleRequired"),
})

function phoneField(requiredMessage: () => string) {
  return requiredText({
    max: 30,
    requiredMessage,
    maxMessage: () => i18n.t("validation:shared.phoneMax30"),
  }).superRefine((value, ctx) => {
    const phone = normalizeText(value)

    if (phone && !PHONE_PATTERN.test(phone)) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:shared.phoneInvalid"),
      })
    }
  })
}

function emailField(requiredMessage: () => string) {
  return requiredText({
    max: 120,
    requiredMessage,
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
        message: i18n.t("validation:staff.nationalIdRequired"),
      })
      return
    }

    if (nationalId.length < 5) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:staff.nationalIdMin"),
      })
    }

    if (nationalId.length > 50) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:staff.nationalIdMax"),
      })
    }
  })
}

export const createStaffSchema = z.object({
  fullName: requiredText({
    min: 2,
    max: 100,
    requiredMessage: () => i18n.t("validation:staff.nameRequired"),
    minMessage: () => i18n.t("validation:staff.nameMin"),
    maxMessage: () => i18n.t("validation:staff.nameMax"),
  }),

  fullNameAr: optionalTrimmedText({
    max: 100,
    maxMessage: () => i18n.t("validation:shared.nameArMax100"),
  }),

  email: emailField(() => i18n.t("validation:emailRequired")),

  phoneNumber: phoneField(() => i18n.t("validation:staff.phoneRequired")),

  password: requiredText({
    min: 8,
    max: 72,
    requiredMessage: () => i18n.t("validation:staff.passwordRequired"),
    minMessage: () => i18n.t("validation:staff.passwordMin"),
    maxMessage: () => i18n.t("validation:staff.passwordMax"),
  }),

  nationalId: nationalIdField(),

  role: staffRoleSchema,

  jobTitle: z.string().superRefine((value, ctx) => {
    const jobTitle = normalizeText(value)

    if (jobTitle.length > 100) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:staff.jobTitleMax"),
      })
    }
  }),

  jobTitleAr: optionalTrimmedText({
    max: 100,
    maxMessage: () => i18n.t("validation:staff.jobTitleArMax"),
  }),
})

export const updateStaffSchema = z.object({
  fullName: requiredText({
    min: 2,
    max: 100,
    requiredMessage: () => i18n.t("validation:staff.nameRequired"),
    minMessage: () => i18n.t("validation:staff.nameMin"),
    maxMessage: () => i18n.t("validation:staff.nameMax"),
  }),

  fullNameAr: optionalTrimmedText({
    max: 100,
    maxMessage: () => i18n.t("validation:shared.nameArMax100"),
  }),

  email: emailField(() => i18n.t("validation:emailRequired")),

  phoneNumber: phoneField(() => i18n.t("validation:staff.phoneRequired")),

  nationalId: nationalIdField(),
})

export type CreateStaffFormValues = z.input<typeof createStaffSchema>
export type UpdateStaffFormValues = z.input<typeof updateStaffSchema>

export type CreateStaffFormErrors = Partial<
  Record<keyof CreateStaffFormValues, string>
>
export type UpdateStaffFormErrors = Partial<
  Record<keyof UpdateStaffFormValues, string>
>

export type CreateStaffPayload = {
  fullName: string
  fullNameAr?: string
  email: string
  phoneNumber: string
  password: string
  nationalId: string
  role: StaffRoleValue
  jobTitle?: string
  jobTitleAr?: string
}

export type UpdateStaffProfilePayload = {
  fullName: string
  fullNameAr?: string
  email: string
  phoneNumber: string
  nationalId: string
}

export function createStaffZodErrorToFormErrors(error: z.ZodError) {
  const errors: CreateStaffFormErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (
      field !== "fullName" &&
      field !== "fullNameAr" &&
      field !== "email" &&
      field !== "phoneNumber" &&
      field !== "password" &&
      field !== "nationalId" &&
      field !== "role" &&
      field !== "jobTitle" &&
      field !== "jobTitleAr"
    ) {
      continue
    }

    errors[field] ??= issue.message
  }

  return errors
}

export function updateStaffZodErrorToFormErrors(error: z.ZodError) {
  const errors: UpdateStaffFormErrors = {}

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

export function createStaffFormValuesToPayload(
  values: CreateStaffFormValues
): CreateStaffPayload {
  const jobTitle = optionalText(values.jobTitle)
  const fullNameAr = optionalText(values.fullNameAr)
  const jobTitleAr = optionalText(values.jobTitleAr)

  return {
    fullName: normalizeText(values.fullName),
    ...(fullNameAr ? { fullNameAr } : {}),
    email: normalizeText(values.email).toLowerCase(),
    phoneNumber: normalizeText(values.phoneNumber),
    password: values.password,
    nationalId: normalizeText(values.nationalId),
    role: values.role,
    ...(jobTitle ? { jobTitle } : { jobTitle: "" }),
    ...(jobTitleAr ? { jobTitleAr } : {}),
  }
}

export function updateStaffFormValuesToPayload(
  values: UpdateStaffFormValues
): UpdateStaffProfilePayload {
  const fullNameAr = optionalText(values.fullNameAr)

  return {
    fullName: normalizeText(values.fullName),
    ...(fullNameAr ? { fullNameAr } : {}),
    email: normalizeText(values.email).toLowerCase(),
    phoneNumber: normalizeText(values.phoneNumber),
    nationalId: normalizeText(values.nationalId),
  }
}
