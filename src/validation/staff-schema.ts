import { z } from "zod"

import { normalizeText, optionalText } from "./helpers"
import { requiredText } from "./zod-helpers"

const PHONE_PATTERN = /^[0-9+\-()\s]+$/

export const STAFF_ROLE_VALUES = [
  "CASHIER",
  "ACCOUNTANT",
  "WAREHOUSE_WORKER",
] as const

export type StaffRoleValue = (typeof STAFF_ROLE_VALUES)[number]

const staffRoleSchema = z.enum(STAFF_ROLE_VALUES, {
  error: "دور الموظف مطلوب",
})

function phoneField(requiredMessage: string) {
  return requiredText({
    max: 30,
    requiredMessage,
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
  })
}

function emailField(requiredMessage: string) {
  return requiredText({
    max: 120,
    requiredMessage,
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
  })
}

function nationalIdField() {
  return z.string().superRefine((value, ctx) => {
    const nationalId = normalizeText(value)

    if (!nationalId) {
      ctx.addIssue({
        code: "custom",
        message: "الرقم القومي مطلوب",
      })
      return
    }

    if (nationalId.length < 5) {
      ctx.addIssue({
        code: "custom",
        message: "الرقم القومي يجب أن يكون 5 أحرف على الأقل",
      })
    }

    if (nationalId.length > 50) {
      ctx.addIssue({
        code: "custom",
        message: "الرقم القومي يجب ألا يتجاوز 50 حرف",
      })
    }
  })
}

export const createStaffSchema = z.object({
  fullName: requiredText({
    min: 2,
    max: 100,
    requiredMessage: "اسم الموظف مطلوب",
    minMessage: "اسم الموظف يجب أن يكون حرفين على الأقل",
    maxMessage: "اسم الموظف يجب ألا يتجاوز 100 حرف",
  }),

  email: emailField("البريد الإلكتروني مطلوب"),

  phoneNumber: phoneField("رقم الهاتف مطلوب"),

  password: requiredText({
    min: 8,
    max: 72,
    requiredMessage: "كلمة المرور مطلوبة",
    minMessage: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
    maxMessage: "كلمة المرور يجب ألا تتجاوز 72 حرف",
  }),

  nationalId: nationalIdField(),

  role: staffRoleSchema,

  jobTitle: z.string().superRefine((value, ctx) => {
    const jobTitle = normalizeText(value)

    if (jobTitle.length > 100) {
      ctx.addIssue({
        code: "custom",
        message: "المسمى الوظيفي يجب ألا يتجاوز 100 حرف",
      })
    }
  }),
})

export const updateStaffSchema = z.object({
  fullName: requiredText({
    min: 2,
    max: 100,
    requiredMessage: "اسم الموظف مطلوب",
    minMessage: "اسم الموظف يجب أن يكون حرفين على الأقل",
    maxMessage: "اسم الموظف يجب ألا يتجاوز 100 حرف",
  }),

  email: emailField("البريد الإلكتروني مطلوب"),

  phoneNumber: phoneField("رقم الهاتف مطلوب"),

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
  email: string
  phoneNumber: string
  password: string
  nationalId: string
  role: StaffRoleValue
  jobTitle?: string
}

export type UpdateStaffProfilePayload = {
  fullName: string
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
      field !== "email" &&
      field !== "phoneNumber" &&
      field !== "password" &&
      field !== "nationalId" &&
      field !== "role" &&
      field !== "jobTitle"
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

  return {
    fullName: normalizeText(values.fullName),
    email: normalizeText(values.email).toLowerCase(),
    phoneNumber: normalizeText(values.phoneNumber),
    password: values.password,
    nationalId: normalizeText(values.nationalId),
    role: values.role,
    ...(jobTitle ? { jobTitle } : { jobTitle: "" }),
  }
}

export function updateStaffFormValuesToPayload(
  values: UpdateStaffFormValues
): UpdateStaffProfilePayload {
  return {
    fullName: normalizeText(values.fullName),
    email: normalizeText(values.email).toLowerCase(),
    phoneNumber: normalizeText(values.phoneNumber),
    nationalId: normalizeText(values.nationalId),
  }
}
