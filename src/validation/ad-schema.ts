import { z } from "zod"

import i18n from "@/i18n"
import {
  isHttpUrl,
  normalizeText,
  optionalText,
  toEnglishDigits,
} from "./helpers"
import { optionalTrimmedText, requiredText } from "./zod-helpers"

export const AD_PLACEMENTS = ["HOME", "CHECKOUT", "SIDEBAR"] as const
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

  if (!Number.isFinite(date.getTime())) {
    return null
  }

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

  if (!date) {
    throw new Error("Invalid ad date")
  }

  return date.toISOString()
}

export function isoToDatetimeLocalInput(value?: string | null) {
  if (!value?.trim()) return ""

  const date = new Date(value)

  if (!Number.isFinite(date.getTime())) return ""

  const pad = (part: number) => String(part).padStart(2, "0")

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function requiredDateTimeInput(fieldMessage: () => string) {
  return z.string().superRefine((value, ctx) => {
    if (!value.trim()) {
      ctx.addIssue({
        code: "custom",
        message: fieldMessage(),
      })
      return
    }

    if (!isValidDateTimeInput(value)) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:mustBeDate"),
      })
    }
  })
}

function optionalHttpUrl(maxMessage: () => string) {
  return z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      const normalized = normalizeText(value ?? "")

      if (!normalized) return

      if (normalized.length > 500) {
        ctx.addIssue({
          code: "custom",
          message: maxMessage(),
        })
      }

      if (!isHttpUrl(normalized)) {
        ctx.addIssue({
          code: "custom",
          message: i18n.t("validation:mustBeUrl"),
        })
      }
    })
}

export const adSchema = z
  .object({
    title: requiredText({
      requiredMessage: () => i18n.t("validation:ad.titleRequired"),
      min: 2,
      minMessage: () => i18n.t("validation:ad.titleMin"),
      max: 120,
      maxMessage: () => i18n.t("validation:ad.titleMax"),
    }),

    titleAr: optionalTrimmedText({
      max: 120,
      maxMessage: () => i18n.t("validation:ad.titleArMax"),
    }),

    description: requiredText({
      requiredMessage: () => i18n.t("validation:ad.descriptionRequired"),
      min: 2,
      minMessage: () => i18n.t("validation:ad.descriptionMin"),
      max: 500,
      maxMessage: () => i18n.t("validation:ad.descriptionMax"),
    }),

    descriptionAr: optionalTrimmedText({
      max: 500,
      maxMessage: () => i18n.t("validation:ad.descriptionArMax"),
    }),

    imageUrl: optionalHttpUrl(() => i18n.t("validation:ad.imageUrlMax")),

    linkUrl: optionalHttpUrl(() => i18n.t("validation:ad.linkUrlMax")),

    placement: z.enum(AD_PLACEMENTS, {
      error: () => i18n.t("validation:ad.placementInvalid"),
    }),

    isActive: z.boolean({
      error: () => i18n.t("validation:ad.statusInvalid"),
    }),

    startDate: requiredDateTimeInput(() =>
      i18n.t("validation:ad.startDateRequired")
    ),

    endDate: requiredDateTimeInput(() =>
      i18n.t("validation:ad.endDateRequired")
    ),
  })
  .superRefine((values, ctx) => {
    const start = parseDateTimeInput(values.startDate)
    const end = parseDateTimeInput(values.endDate)

    if (!start || !end) return

    if (end.getTime() <= start.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: i18n.t("validation:endAfterStart"),
      })
    }
  })

export type AdFormValues = z.input<typeof adSchema>

export type AdRequestPayload = {
  title: string
  titleAr?: string
  description: string
  descriptionAr?: string
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
      field !== "titleAr" &&
      field !== "description" &&
      field !== "descriptionAr" &&
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

export function adFormValuesToPayload(values: AdFormValues): AdRequestPayload {
  const title = normalizeText(values.title)
  const titleAr = optionalText(values.titleAr)
  const description = normalizeText(values.description)
  const descriptionAr = optionalText(values.descriptionAr)
  const imageUrl = optionalText(values.imageUrl) ?? null
  const linkUrl = optionalText(values.linkUrl) ?? null

  return {
    title,
    ...(titleAr ? { titleAr } : {}),
    description,
    ...(descriptionAr ? { descriptionAr } : {}),
    imageUrl,
    linkUrl,
    placement: values.placement,
    isActive: values.isActive,
    startDate: dateTimeInputToIsoString(values.startDate),
    endDate: dateTimeInputToIsoString(values.endDate),
  }
}
