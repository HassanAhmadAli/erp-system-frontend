import { z } from "zod"

import {
  compareDateInputValues,
  isHttpUrl,
  isValidDateInputValue,
  normalizeText,
  parseFiniteNumber,
  parseNonNegativeInteger,
  parseNonNegativeNumber,
  parsePositiveInteger,
  parsePositiveNumber,
} from "./helpers"

const REQUIRED_MESSAGE = "هذا الحقل مطلوب"
const INVALID_NUMBER_MESSAGE = "أدخل رقمًا صالحًا"
const INVALID_INTEGER_MESSAGE = "أدخل رقمًا صحيحًا"
const INVALID_DATE_MESSAGE = "أدخل تاريخًا صالحًا"
const INVALID_URL_MESSAGE = "أدخل رابطًا صالحًا يبدأ بـ http أو https"

export type TextOptions = {
  requiredMessage?: string
  min?: number
  minMessage?: string
  max?: number
  maxMessage?: string
}

export type NumberTextOptions = {
  requiredMessage?: string
  invalidMessage?: string
  min?: number
  minMessage?: string
  max?: number
  maxMessage?: string
}

export function requiredText(options: TextOptions = {}) {
  return z.string().superRefine((value, ctx) => {
    const normalized = normalizeText(value)

    if (!normalized) {
      ctx.addIssue({
        code: "custom",
        message: options.requiredMessage ?? REQUIRED_MESSAGE,
      })
      return
    }

    if (options.min != null && normalized.length < options.min) {
      ctx.addIssue({
        code: "custom",
        message:
          options.minMessage ?? `يجب أن يكون على الأقل ${options.min} أحرف`,
      })
    }

    if (options.max != null && normalized.length > options.max) {
      ctx.addIssue({
        code: "custom",
        message:
          options.maxMessage ?? `يجب ألا يتجاوز ${options.max} حرفًا`,
      })
    }
  })
}

export function optionalTrimmedText(options: Omit<TextOptions, "requiredMessage"> = {}) {
  return z.string().optional().superRefine((value, ctx) => {
    const normalized = normalizeText(value ?? "")
    if (!normalized) return

    if (options.min != null && normalized.length < options.min) {
      ctx.addIssue({
        code: "custom",
        message:
          options.minMessage ?? `يجب أن يكون على الأقل ${options.min} أحرف`,
      })
    }

    if (options.max != null && normalized.length > options.max) {
      ctx.addIssue({
        code: "custom",
        message:
          options.maxMessage ?? `يجب ألا يتجاوز ${options.max} حرفًا`,
      })
    }
  })
}

function validateNumberBounds(
  value: number,
  ctx: z.RefinementCtx,
  options: NumberTextOptions
) {
  if (options.min != null && value < options.min) {
    ctx.addIssue({
      code: "custom",
      message: options.minMessage ?? `يجب أن يكون الرقم ${options.min} أو أكثر`,
    })
  }

  if (options.max != null && value > options.max) {
    ctx.addIssue({
      code: "custom",
      message: options.maxMessage ?? `يجب ألا يتجاوز الرقم ${options.max}`,
    })
  }
}

export function finiteNumberText(options: NumberTextOptions = {}) {
  return z.string().superRefine((value, ctx) => {
    if (!value.trim()) {
      ctx.addIssue({
        code: "custom",
        message: options.requiredMessage ?? REQUIRED_MESSAGE,
      })
      return
    }

    const parsed = parseFiniteNumber(value)
    if (parsed == null) {
      ctx.addIssue({
        code: "custom",
        message: options.invalidMessage ?? INVALID_NUMBER_MESSAGE,
      })
      return
    }

    validateNumberBounds(parsed, ctx, options)
  })
}

export function optionalFiniteNumberText(options: NumberTextOptions = {}) {
  return z.string().optional().superRefine((value, ctx) => {
    if (!value?.trim()) return

    const parsed = parseFiniteNumber(value)
    if (parsed == null) {
      ctx.addIssue({
        code: "custom",
        message: options.invalidMessage ?? INVALID_NUMBER_MESSAGE,
      })
      return
    }

    validateNumberBounds(parsed, ctx, options)
  })
}

export function positiveNumberText(options: NumberTextOptions = {}) {
  return z.string().superRefine((value, ctx) => {
    if (!value.trim()) {
      ctx.addIssue({
        code: "custom",
        message: options.requiredMessage ?? REQUIRED_MESSAGE,
      })
      return
    }

    const parsed = parsePositiveNumber(value)
    if (parsed == null) {
      ctx.addIssue({
        code: "custom",
        message: options.invalidMessage ?? "أدخل رقمًا أكبر من الصفر",
      })
      return
    }

    validateNumberBounds(parsed, ctx, options)
  })
}

export function optionalPositiveNumberText(options: NumberTextOptions = {}) {
  return z.string().optional().superRefine((value, ctx) => {
    if (!value?.trim()) return

    const parsed = parsePositiveNumber(value)
    if (parsed == null) {
      ctx.addIssue({
        code: "custom",
        message: options.invalidMessage ?? "أدخل رقمًا أكبر من الصفر",
      })
      return
    }

    validateNumberBounds(parsed, ctx, options)
  })
}

export function nonNegativeNumberText(options: NumberTextOptions = {}) {
  return z.string().superRefine((value, ctx) => {
    if (!value.trim()) {
      ctx.addIssue({
        code: "custom",
        message: options.requiredMessage ?? REQUIRED_MESSAGE,
      })
      return
    }

    const parsed = parseNonNegativeNumber(value)
    if (parsed == null) {
      ctx.addIssue({
        code: "custom",
        message: options.invalidMessage ?? "أدخل رقمًا لا يقل عن الصفر",
      })
      return
    }

    validateNumberBounds(parsed, ctx, options)
  })
}

export function positiveIntegerText(options: NumberTextOptions = {}) {
  return z.string().superRefine((value, ctx) => {
    if (!value.trim()) {
      ctx.addIssue({
        code: "custom",
        message: options.requiredMessage ?? REQUIRED_MESSAGE,
      })
      return
    }

    const parsed = parsePositiveInteger(value)
    if (parsed == null) {
      ctx.addIssue({
        code: "custom",
        message: options.invalidMessage ?? "أدخل رقمًا صحيحًا أكبر من الصفر",
      })
      return
    }

    validateNumberBounds(parsed, ctx, options)
  })
}

export function optionalPositiveIntegerText(options: NumberTextOptions = {}) {
  return z.string().optional().superRefine((value, ctx) => {
    if (!value?.trim()) return

    const parsed = parsePositiveInteger(value)
    if (parsed == null) {
      ctx.addIssue({
        code: "custom",
        message: options.invalidMessage ?? "أدخل رقمًا صحيحًا أكبر من الصفر",
      })
      return
    }

    validateNumberBounds(parsed, ctx, options)
  })
}

export function nonNegativeIntegerText(options: NumberTextOptions = {}) {
  return z.string().superRefine((value, ctx) => {
    if (!value.trim()) {
      ctx.addIssue({
        code: "custom",
        message: options.requiredMessage ?? REQUIRED_MESSAGE,
      })
      return
    }

    const parsed = parseNonNegativeInteger(value)
    if (parsed == null) {
      ctx.addIssue({
        code: "custom",
        message: options.invalidMessage ?? INVALID_INTEGER_MESSAGE,
      })
      return
    }

    validateNumberBounds(parsed, ctx, options)
  })
}

export function dateInputText(requiredMessage = REQUIRED_MESSAGE) {
  return z.string().superRefine((value, ctx) => {
    if (!value.trim()) {
      ctx.addIssue({ code: "custom", message: requiredMessage })
      return
    }

    if (!isValidDateInputValue(value)) {
      ctx.addIssue({ code: "custom", message: INVALID_DATE_MESSAGE })
    }
  })
}

export function optionalDateInputText() {
  return z.string().optional().superRefine((value, ctx) => {
    if (!value?.trim()) return

    if (!isValidDateInputValue(value)) {
      ctx.addIssue({ code: "custom", message: INVALID_DATE_MESSAGE })
    }
  })
}

export function optionalHttpUrlText() {
  return z.string().optional().superRefine((value, ctx) => {
    if (!value?.trim()) return

    if (!isHttpUrl(value)) {
      ctx.addIssue({ code: "custom", message: INVALID_URL_MESSAGE })
    }
  })
}

export function validateDateRange(
  ctx: z.RefinementCtx,
  startDate: string,
  endDate: string | undefined,
  endDatePath: string,
  message = "تاريخ النهاية يجب أن يكون بعد تاريخ البداية"
) {
  if (!endDate?.trim()) return

  const comparison = compareDateInputValues(startDate, endDate)
  if (comparison != null && comparison < 0) return

  ctx.addIssue({
    code: "custom",
    message,
    path: [endDatePath],
  })
}
