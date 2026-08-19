import { z } from "zod"

import i18n from "@/i18n"
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

const REQUIRED_MESSAGE = () => i18n.t("validation:required")
const INVALID_NUMBER_MESSAGE = () => i18n.t("validation:mustBeNumber")
const INVALID_INTEGER_MESSAGE = () => i18n.t("validation:mustBeInteger")
const INVALID_DATE_MESSAGE = () => i18n.t("validation:mustBeDate")
const INVALID_URL_MESSAGE = () => i18n.t("validation:mustBeUrl")
const POSITIVE_NUMBER_MESSAGE = () => i18n.t("validation:mustBePositiveNumber")
const NON_NEGATIVE_NUMBER_MESSAGE = () =>
  i18n.t("validation:mustBeNonNegativeNumber")
const POSITIVE_INTEGER_MESSAGE = () =>
  i18n.t("validation:mustBePositiveInteger")
const END_AFTER_START_MESSAGE = () => i18n.t("validation:endAfterStart")

export type MessageInput = string | (() => string)

function resolveMessage(
  message: MessageInput | undefined,
  fallback: () => string
) {
  if (message == null) return fallback()
  return typeof message === "function" ? message() : message
}

export type TextOptions = {
  requiredMessage?: MessageInput
  min?: number
  minMessage?: MessageInput
  max?: number
  maxMessage?: MessageInput
}

export type NumberTextOptions = {
  requiredMessage?: MessageInput
  invalidMessage?: MessageInput
  min?: number
  minMessage?: MessageInput
  max?: number
  maxMessage?: MessageInput
}

export function requiredText(options: TextOptions = {}) {
  return z.string().superRefine((value, ctx) => {
    const normalized = normalizeText(value)

    if (!normalized) {
      ctx.addIssue({
        code: "custom",
        message: resolveMessage(options.requiredMessage, REQUIRED_MESSAGE),
      })
      return
    }

    if (options.min != null && normalized.length < options.min) {
      ctx.addIssue({
        code: "custom",
        message: resolveMessage(options.minMessage, () =>
          i18n.t("validation:stringMin", { min: options.min })
        ),
      })
    }

    if (options.max != null && normalized.length > options.max) {
      ctx.addIssue({
        code: "custom",
        message: resolveMessage(options.maxMessage, () =>
          i18n.t("validation:stringMax", { max: options.max })
        ),
      })
    }
  })
}

export function optionalTrimmedText(
  options: Omit<TextOptions, "requiredMessage"> = {}
) {
  return z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      const normalized = normalizeText(value ?? "")
      if (!normalized) return

      if (options.min != null && normalized.length < options.min) {
        ctx.addIssue({
          code: "custom",
          message: resolveMessage(options.minMessage, () =>
            i18n.t("validation:stringMin", { min: options.min })
          ),
        })
      }

      if (options.max != null && normalized.length > options.max) {
        ctx.addIssue({
          code: "custom",
          message: resolveMessage(options.maxMessage, () =>
            i18n.t("validation:stringMax", { max: options.max })
          ),
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
      message: resolveMessage(options.minMessage, () =>
        i18n.t("validation:mustBePositive")
      ),
    })
  }

  if (options.max != null && value > options.max) {
    ctx.addIssue({
      code: "custom",
      message: resolveMessage(options.maxMessage, () =>
        i18n.t("validation:stringMax", { max: options.max })
      ),
    })
  }
}

export function finiteNumberText(options: NumberTextOptions = {}) {
  return z.string().superRefine((value, ctx) => {
    if (!value.trim()) {
      ctx.addIssue({
        code: "custom",
        message: resolveMessage(options.requiredMessage, REQUIRED_MESSAGE),
      })
      return
    }

    const parsed = parseFiniteNumber(value)
    if (parsed == null) {
      ctx.addIssue({
        code: "custom",
        message: resolveMessage(options.invalidMessage, INVALID_NUMBER_MESSAGE),
      })
      return
    }

    validateNumberBounds(parsed, ctx, options)
  })
}

export function optionalFiniteNumberText(options: NumberTextOptions = {}) {
  return z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      if (!value?.trim()) return

      const parsed = parseFiniteNumber(value)
      if (parsed == null) {
        ctx.addIssue({
          code: "custom",
          message: resolveMessage(
            options.invalidMessage,
            INVALID_NUMBER_MESSAGE
          ),
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
        message: resolveMessage(options.requiredMessage, REQUIRED_MESSAGE),
      })
      return
    }

    const parsed = parsePositiveNumber(value)
    if (parsed == null) {
      ctx.addIssue({
        code: "custom",
        message: resolveMessage(
          options.invalidMessage,
          POSITIVE_NUMBER_MESSAGE
        ),
      })
      return
    }

    validateNumberBounds(parsed, ctx, options)
  })
}

export function optionalPositiveNumberText(options: NumberTextOptions = {}) {
  return z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      if (!value?.trim()) return

      const parsed = parsePositiveNumber(value)
      if (parsed == null) {
        ctx.addIssue({
          code: "custom",
          message: resolveMessage(
            options.invalidMessage,
            POSITIVE_NUMBER_MESSAGE
          ),
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
        message: resolveMessage(options.requiredMessage, REQUIRED_MESSAGE),
      })
      return
    }

    const parsed = parseNonNegativeNumber(value)
    if (parsed == null) {
      ctx.addIssue({
        code: "custom",
        message: resolveMessage(
          options.invalidMessage,
          NON_NEGATIVE_NUMBER_MESSAGE
        ),
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
        message: resolveMessage(options.requiredMessage, REQUIRED_MESSAGE),
      })
      return
    }

    const parsed = parsePositiveInteger(value)
    if (parsed == null) {
      ctx.addIssue({
        code: "custom",
        message: resolveMessage(
          options.invalidMessage,
          POSITIVE_INTEGER_MESSAGE
        ),
      })
      return
    }

    validateNumberBounds(parsed, ctx, options)
  })
}

export function optionalPositiveIntegerText(options: NumberTextOptions = {}) {
  return z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      if (!value?.trim()) return

      const parsed = parsePositiveInteger(value)
      if (parsed == null) {
        ctx.addIssue({
          code: "custom",
          message: resolveMessage(
            options.invalidMessage,
            POSITIVE_INTEGER_MESSAGE
          ),
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
        message: resolveMessage(options.requiredMessage, REQUIRED_MESSAGE),
      })
      return
    }

    const parsed = parseNonNegativeInteger(value)
    if (parsed == null) {
      ctx.addIssue({
        code: "custom",
        message: resolveMessage(
          options.invalidMessage,
          INVALID_INTEGER_MESSAGE
        ),
      })
      return
    }

    validateNumberBounds(parsed, ctx, options)
  })
}

export function dateInputText(
  requiredMessage: MessageInput = REQUIRED_MESSAGE
) {
  return z.string().superRefine((value, ctx) => {
    if (!value.trim()) {
      ctx.addIssue({
        code: "custom",
        message: resolveMessage(requiredMessage, REQUIRED_MESSAGE),
      })
      return
    }

    if (!isValidDateInputValue(value)) {
      ctx.addIssue({
        code: "custom",
        message: INVALID_DATE_MESSAGE(),
      })
    }
  })
}

export function optionalDateInputText() {
  return z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      if (!value?.trim()) return

      if (!isValidDateInputValue(value)) {
        ctx.addIssue({
          code: "custom",
          message: INVALID_DATE_MESSAGE(),
        })
      }
    })
}

export function optionalHttpUrlText() {
  return z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      if (!value?.trim()) return

      if (!isHttpUrl(value)) {
        ctx.addIssue({
          code: "custom",
          message: INVALID_URL_MESSAGE(),
        })
      }
    })
}

export function validateDateRange(
  ctx: z.RefinementCtx,
  startDate: string,
  endDate: string | undefined,
  endDatePath: string,
  message: MessageInput = END_AFTER_START_MESSAGE
) {
  if (!endDate?.trim()) return

  const comparison = compareDateInputValues(startDate, endDate)
  if (comparison != null && comparison < 0) return

  ctx.addIssue({
    code: "custom",
    message: resolveMessage(message, END_AFTER_START_MESSAGE),
    path: [endDatePath],
  })
}
