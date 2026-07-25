import { z } from "zod"

import {
  normalizeText,
  parsePositiveInteger,
  parsePositiveNumber,
} from "./helpers"
import { requiredText } from "./zod-helpers"

const numericValueSchema = z.union([z.string(), z.number()])

function positiveNumberField(message: string) {
  return numericValueSchema.superRefine((value, ctx) => {
    if (parsePositiveNumber(value) == null) {
      ctx.addIssue({
        code: "custom",
        message,
      })
    }
  })
}

function positiveIntegerField(message: string) {
  return numericValueSchema.superRefine((value, ctx) => {
    if (parsePositiveInteger(value) == null) {
      ctx.addIssue({
        code: "custom",
        message,
      })
    }
  })
}

export const loyaltyPolicySchema = z.object({
  pointsPerCurrency: positiveNumberField(
    "نقاط كل عملة يجب أن تكون رقمًا أكبر من صفر."
  ),
  currencyPerPoint: positiveNumberField(
    "قيمة كل نقطة يجب أن تكون رقمًا أكبر من صفر."
  ),
})

export type LoyaltyPolicyFormValues = z.input<typeof loyaltyPolicySchema>

export type LoyaltyPolicyPayload = {
  pointsPerCurrency: number
  currencyPerPoint: number
}

export type LoyaltyPolicyFormErrors = Partial<
  Record<keyof LoyaltyPolicyFormValues, string>
>

export function loyaltyPolicyZodErrorToFormErrors(error: z.ZodError) {
  const errors: LoyaltyPolicyFormErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]
    if (field !== "pointsPerCurrency" && field !== "currencyPerPoint") {
      continue
    }

    errors[field] ??= issue.message
  }

  return errors
}

export function loyaltyPolicyValuesToPayload(
  values: LoyaltyPolicyFormValues
): LoyaltyPolicyPayload {
  const pointsPerCurrency = parsePositiveNumber(values.pointsPerCurrency)
  const currencyPerPoint = parsePositiveNumber(values.currencyPerPoint)

  if (pointsPerCurrency == null) {
    throw new Error("Invalid loyalty pointsPerCurrency")
  }

  if (currencyPerPoint == null) {
    throw new Error("Invalid loyalty currencyPerPoint")
  }

  return {
    pointsPerCurrency,
    currencyPerPoint,
  }
}

export const loyaltyRewardSchema = z.object({
  pointsThreshold: positiveIntegerField(
    "حد النقاط يجب أن يكون رقمًا صحيحًا أكبر من صفر."
  ),
  rewardDescription: requiredText({
    requiredMessage: "وصف المكافأة مطلوب.",
    min: 2,
    minMessage: "وصف المكافأة يجب أن يكون حرفين على الأقل.",
    max: 300,
    maxMessage: "وصف المكافأة يجب ألا يتجاوز 300 حرف.",
  }),
  discountValue: positiveNumberField(
    "قيمة الخصم يجب أن تكون رقمًا أكبر من صفر."
  ),
  isActive: z.boolean({
    error: "حالة المكافأة غير صالحة.",
  }),
})

export type LoyaltyRewardFormValues = z.input<typeof loyaltyRewardSchema>

export type LoyaltyRewardPayload = {
  pointsThreshold: number
  rewardDescription: string
  discountValue: number
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
      field !== "pointsThreshold" &&
      field !== "rewardDescription" &&
      field !== "discountValue" &&
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
  const pointsThreshold = parsePositiveInteger(values.pointsThreshold)
  const discountValue = parsePositiveNumber(values.discountValue)

  if (pointsThreshold == null) {
    throw new Error("Invalid loyalty reward pointsThreshold")
  }

  if (discountValue == null) {
    throw new Error("Invalid loyalty reward discountValue")
  }

  return {
    pointsThreshold,
    rewardDescription: normalizeText(values.rewardDescription),
    discountValue,
    isActive: values.isActive,
  }
}
