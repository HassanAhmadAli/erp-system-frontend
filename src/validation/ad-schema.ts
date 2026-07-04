import { z } from "zod"

import {
  isHttpUrl,
  normalizeText,
  optionalText,
  toEnglishDigits,
} from "./helpers"
import { requiredText } from "./zod-helpers"

export const AD_PLACEMENTS = ["HOME"] as const
export type AdPlacement = (typeof AD_PLACEMENTS)[number]

const DATE_TIME_INPUT_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/

function normalizeDateTimeInput(value: string) {
  return toEnglishDigits(value).trim()
}

function parseDateTimeInput(value: string) {
  const normalized = normalizeDateTimeInput(value)
  const match = DATE_TIME_INPUT_PATTERN.exec(normalized)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hours = Number(match[4])
  const minutes = Number(match[5])
  const seconds = Number(match[6] ?? "0")

  const date = new Date(year, month - 1, day, hours, minutes, seconds)
  if (!Number.isFinite(date.getTime())) return null

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hours ||
    date.getMinutes() !== minutes ||
    date.getSeconds() !== seconds
  ) {
    return null
  }

  return date
}

function isValidDateTimeInput(value: string) {
  return parseDateTimeInput(value) != null
}

function dateTimeInputToIsoString(value: string) {
  const date = parseDateTimeInput(value)
  if (!date) throw new Error("Invalid ad date")
  return date.toISOString()
}

function requiredDateTimeInput(fieldMessage: string) {
  return z.string().superRefine((value, ctx) => {
    if (!value.trim()) {
      ctx.addIssue({
        code: "custom",
        message: fieldMessage,
      })
      return
    }

    if (!isValidDateTimeInput(value)) {
      ctx.addIssue({
        code: "custom",
        message: "أدخل تاريخًا صالحًا.",
      })
    }
  })
}

function optionalHttpUrl(maxMessage: string) {
  return z.string().optional().superRefine((value, ctx) => {
    const normalized = normalizeText(value ?? "")
    if (!normalized) return

    if (normalized.length > 500) {
      ctx.addIssue({
        code: "custom",
        message: maxMessage,
      })
    }

    if (!isHttpUrl(normalized)) {
      ctx.addIssue({
        code: "custom",
        message: "أدخل رابطًا صالحًا يبدأ بـ http أو https.",
      })
    }
  })
}

export const adSchema = z
  .object({
    title: requiredText({
      requiredMessage: "عنوان الإعلان مطلوب.",
      min: 2,
      minMessage: "عنوان الإعلان يجب أن يكون حرفين على الأقل.",
      max: 120,
      maxMessage: "عنوان الإعلان يجب ألا يتجاوز 120 حرفًا.",
    }),
    description: requiredText({
      requiredMessage: "وصف الإعلان مطلوب.",
      min: 2,
      minMessage: "وصف الإعلان يجب أن يكون حرفين على الأقل.",
      max: 500,
      maxMessage: "وصف الإعلان يجب ألا يتجاوز 500 حرف.",
    }),
    imageUrl: optionalHttpUrl("رابط الصورة يجب ألا يتجاوز 500 حرف."),
    linkUrl: optionalHttpUrl("رابط الإعلان يجب ألا يتجاوز 500 حرف."),
    placement: z.string().superRefine((value, ctx) => {
      if (!AD_PLACEMENTS.includes(value as AdPlacement)) {
        ctx.addIssue({
          code: "custom",
          message: "مكان ظهور الإعلان غير صالح.",
        })
      }
    }),
    isActive: z.boolean({
      error: "حالة الإعلان غير صالحة.",
    }),
    startDate: requiredDateTimeInput("تاريخ بداية الإعلان مطلوب."),
    endDate: requiredDateTimeInput("تاريخ نهاية الإعلان مطلوب."),
  })
  .superRefine((values, ctx) => {
    const start = parseDateTimeInput(values.startDate)
    const end = parseDateTimeInput(values.endDate)

    if (!start || !end) return

    if (end.getTime() <= start.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية.",
      })
    }
  })

export type AdFormValues = z.input<typeof adSchema>

export type AdRequestPayload = {
  title: string
  description: string
  imageUrl: string | null
  linkUrl: string | null
  placement: AdPlacement
  isActive: boolean
  startDate: string
  endDate: string
}

export type AdFormErrors = Partial<Record<keyof AdFormValues, string>>

export function adZodErrorToFormErrors(error: z.ZodError) {
  const errors: AdFormErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]
    if (
      field !== "title" &&
      field !== "description" &&
      field !== "imageUrl" &&
      field !== "linkUrl" &&
      field !== "placement" &&
      field !== "isActive" &&
      field !== "startDate" &&
      field !== "endDate"
    ) {
      continue
    }

    errors[field] ??= issue.message
  }

  return errors
}

export function adFormValuesToPayload(
  values: AdFormValues
): AdRequestPayload {
  const title = normalizeText(values.title)
  const description = normalizeText(values.description)
  const imageUrl = optionalText(values.imageUrl) ?? null
  const linkUrl = optionalText(values.linkUrl) ?? null
  const placement = values.placement as AdPlacement

  return {
    title,
    description,
    imageUrl,
    linkUrl,
    placement,
    isActive: values.isActive,
    startDate: dateTimeInputToIsoString(values.startDate),
    endDate: dateTimeInputToIsoString(values.endDate),
  }
}
