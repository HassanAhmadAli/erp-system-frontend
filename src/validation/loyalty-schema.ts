import { z } from "zod"

import {
  normalizeText,
  optionalText,
  parsePositiveInteger,
  parsePositiveNumber,
} from "./helpers"
import { requiredText } from "./zod-helpers"

const numericValueSchema = z.union([z.string(), z.number()])

export const LOYALTY_DISCOUNT_TYPES = ["PERCENTAGE", "FIXED_AMOUNT"] as const

export type LoyaltyDiscountType = (typeof LOYALTY_DISCOUNT_TYPES)[number]

export const LOYALTY_DISCOUNT_TYPE_LABELS: Record<LoyaltyDiscountType, string> =
  {
    PERCENTAGE: "نسبة مئوية",
    FIXED_AMOUNT: "مبلغ ثابت",
  }

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

export const loyaltyRewardSchema = z.object({
  name: requiredText({
    requiredMessage: "اسم المكافأة مطلوب.",
    min: 2,
    minMessage: "اسم المكافأة يجب أن يكون حرفين على الأقل.",
    max: 120,
    maxMessage: "اسم المكافأة يجب ألا يتجاوز 120 حرفًا.",
  }),
  description: z.union([z.string(), z.null(), z.undefined()]).optional(),
  pointsCost: positiveIntegerField(
    "تكلفة النقاط يجب أن تكون رقمًا صحيحًا أكبر من صفر."
  ),
  discountType: z.enum(LOYALTY_DISCOUNT_TYPES, {
    error: "نوع الخصم غير صالح.",
  }),
  discountValue: positiveNumberField(
    "قيمة الخصم يجب أن تكون رقمًا أكبر من صفر."
  ),
  maxUses: positiveIntegerField(
    "الحد الأقصى للاستخدام يجب أن يكون رقمًا صحيحًا أكبر من صفر."
  ),
  validityDays: positiveIntegerField(
    "مدة الصلاحية بالأيام يجب أن تكون رقمًا صحيحًا أكبر من صفر."
  ),
  isActive: z.boolean({
    error: "حالة المكافأة غير صالحة.",
  }),
})

export type LoyaltyRewardFormValues = z.input<typeof loyaltyRewardSchema>

export type LoyaltyRewardPayload = {
  name: string
  description?: string
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
      field !== "description" &&
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

  const description = optionalText(values.description ?? undefined)

  return {
    name: normalizeText(values.name),
    ...(description ? { description } : {}),
    pointsCost,
    discountType: values.discountType,
    discountValue,
    maxUses,
    validityDays,
    isActive: values.isActive,
  }
}
