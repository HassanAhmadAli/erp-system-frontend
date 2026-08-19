import { z } from "zod"

import i18n from "@/i18n"
import {
  normalizeText,
  optionalText,
  parsePositiveInteger,
  parsePositiveNumber,
} from "./helpers"
import { optionalTrimmedText, requiredText } from "./zod-helpers"

const numericValueSchema = z.union([z.string(), z.number()])

export const LOYALTY_DISCOUNT_TYPES = ["PERCENTAGE", "FIXED_AMOUNT"] as const

export type LoyaltyDiscountType = (typeof LOYALTY_DISCOUNT_TYPES)[number]

export function getLoyaltyDiscountTypeLabel(type: LoyaltyDiscountType): string {
  return type === "PERCENTAGE"
    ? i18n.t("validation:loyalty.discountTypePercentage")
    : i18n.t("validation:loyalty.discountTypeFixedAmount")
}

function positiveNumberField(message: () => string) {
  return numericValueSchema.superRefine((value, ctx) => {
    if (parsePositiveNumber(value) == null) {
      ctx.addIssue({
        code: "custom",
        message: message(),
      })
    }
  })
}

function positiveIntegerField(message: () => string) {
  return numericValueSchema.superRefine((value, ctx) => {
    if (parsePositiveInteger(value) == null) {
      ctx.addIssue({
        code: "custom",
        message: message(),
      })
    }
  })
}

export const loyaltyRewardSchema = z.object({
  name: requiredText({
    requiredMessage: () => i18n.t("validation:loyalty.nameRequired"),
    min: 2,
    minMessage: () => i18n.t("validation:loyalty.nameMin"),
    max: 120,
    maxMessage: () => i18n.t("validation:loyalty.nameMax"),
  }),
  nameAr: optionalTrimmedText({
    max: 120,
    maxMessage: () => i18n.t("validation:shared.nameArMax100"),
  }),
  description: z.union([z.string(), z.null(), z.undefined()]).optional(),
  descriptionAr: optionalTrimmedText({
    max: 500,
    maxMessage: () => i18n.t("validation:loyalty.descriptionArMax"),
  }),
  pointsCost: positiveIntegerField(() =>
    i18n.t("validation:loyalty.pointsCostInvalid")
  ),
  discountType: z.enum(LOYALTY_DISCOUNT_TYPES, {
    error: () => i18n.t("validation:loyalty.discountTypeInvalid"),
  }),
  discountValue: positiveNumberField(() =>
    i18n.t("validation:loyalty.discountValueInvalid")
  ),
  maxUses: positiveIntegerField(() =>
    i18n.t("validation:loyalty.maxUsesInvalid")
  ),
  validityDays: positiveIntegerField(() =>
    i18n.t("validation:loyalty.validityDaysInvalid")
  ),
  isActive: z.boolean({
    error: () => i18n.t("validation:loyalty.statusInvalid"),
  }),
})

export type LoyaltyRewardFormValues = z.input<typeof loyaltyRewardSchema>

export type LoyaltyRewardPayload = {
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  pointsCost: number
  discountType: LoyaltyDiscountType
  discountValue: number
  maxUses: number
  validityDays: number
  isActive: boolean
}

export type LoyaltyRewardFormErrors = Partial<
  Record<keyof LoyaltyRewardFormValues, string>
>

export function loyaltyRewardZodErrorToFormErrors(error: z.ZodError) {
  const errors: LoyaltyRewardFormErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (
      field !== "name" &&
      field !== "nameAr" &&
      field !== "description" &&
      field !== "descriptionAr" &&
      field !== "pointsCost" &&
      field !== "discountType" &&
      field !== "discountValue" &&
      field !== "maxUses" &&
      field !== "validityDays" &&
      field !== "isActive"
    ) {
      continue
    }

    errors[field] ??= issue.message
  }

  return errors
}

export function loyaltyRewardValuesToPayload(
  values: LoyaltyRewardFormValues
): LoyaltyRewardPayload {
  const pointsCost = parsePositiveInteger(values.pointsCost)
  const discountValue = parsePositiveNumber(values.discountValue)
  const maxUses = parsePositiveInteger(values.maxUses)
  const validityDays = parsePositiveInteger(values.validityDays)

  if (pointsCost == null) {
    throw new Error("Invalid loyalty reward pointsCost")
  }

  if (discountValue == null) {
    throw new Error("Invalid loyalty reward discountValue")
  }

  if (maxUses == null) {
    throw new Error("Invalid loyalty reward maxUses")
  }

  if (validityDays == null) {
    throw new Error("Invalid loyalty reward validityDays")
  }

  const nameAr = optionalText(values.nameAr)
  const description = optionalText(values.description ?? undefined)
  const descriptionAr = optionalText(values.descriptionAr)

  return {
    name: normalizeText(values.name),
    ...(nameAr ? { nameAr } : {}),
    ...(description ? { description } : {}),
    ...(descriptionAr ? { descriptionAr } : {}),
    pointsCost,
    discountType: values.discountType,
    discountValue,
    maxUses,
    validityDays,
    isActive: values.isActive,
  }
}
