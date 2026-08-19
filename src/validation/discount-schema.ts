import { z } from "zod"

import i18n from "@/i18n"
import {
  dateInputToIsoString,
  normalizeText,
  optionalDateInputToIsoString,
  optionalPositiveIntegerOrNull,
  optionalPositiveNumberOrNull,
  optionalText,
  parseFiniteNumber,
  parsePositiveInteger,
  requireFiniteNumber,
  requirePositiveInteger,
} from "./helpers"
import {
  dateInputText,
  finiteNumberText,
  optionalDateInputText,
  optionalPositiveIntegerText,
  optionalPositiveNumberText,
  optionalTrimmedText,
  requiredText,
  validateDateRange,
} from "./zod-helpers"

export const discountTypeSchema = z.enum(["PERCENTAGE", "FIXED_AMOUNT"])

// Backend-supported scopes only.
// CUSTOMER is intentionally not allowed because the backend enum does not support it.
export const discountScopeSchema = z.enum(["GLOBAL", "CATEGORY", "PRODUCT"])

export type DiscountType = z.infer<typeof discountTypeSchema>
export type DiscountScope = z.infer<typeof discountScopeSchema>

export const discountSchema = z
  .object({
    name: requiredText({
      min: 2,
      max: 100,
      requiredMessage: () => i18n.t("validation:discount.nameRequired"),
      minMessage: () => i18n.t("validation:discount.nameMin"),
      maxMessage: () => i18n.t("validation:discount.nameMax"),
    }),

    nameAr: optionalTrimmedText({
      max: 100,
      maxMessage: () => i18n.t("validation:shared.nameArMax100"),
    }),

    type: discountTypeSchema,
    scope: discountScopeSchema,

    value: finiteNumberText({
      requiredMessage: () => i18n.t("validation:discount.valueRequired"),
      invalidMessage: () => i18n.t("validation:discount.valueInvalid"),
    }),

    categoryId: optionalPositiveIntegerText({
      invalidMessage: () => i18n.t("validation:shared.selectCategoryValid"),
    }),

    productId: optionalPositiveIntegerText({
      invalidMessage: () => i18n.t("validation:shared.selectProductValid"),
    }),

    maxInvoiceValue: optionalPositiveNumberText({
      invalidMessage: () => i18n.t("validation:discount.maxInvoiceInvalid"),
    }),

    maxUses: optionalPositiveIntegerText({
      invalidMessage: () => i18n.t("validation:discount.maxUsesInvalid"),
    }),

    startDate: dateInputText(() =>
      i18n.t("validation:discount.startDateRequired")
    ),
    endDate: optionalDateInputText(),

    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    const value = parseFiniteNumber(data.value)

    if (value != null && data.type === "PERCENTAGE") {
      if (value <= 0 || value > 100) {
        ctx.addIssue({
          code: "custom",
          message: i18n.t("validation:discount.percentageRange"),
          path: ["value"],
        })
      }
    }

    if (value != null && data.type === "FIXED_AMOUNT" && value <= 0) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:discount.fixedAmountPositive"),
        path: ["value"],
      })
    }

    if (
      data.scope === "CATEGORY" &&
      parsePositiveInteger(data.categoryId) == null
    ) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:shared.selectCategory"),
        path: ["categoryId"],
      })
    }

    if (
      data.scope === "PRODUCT" &&
      parsePositiveInteger(data.productId) == null
    ) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:shared.selectProduct"),
        path: ["productId"],
      })
    }

    validateDateRange(ctx, data.startDate, data.endDate, "endDate")
  })

export type DiscountFormValues = z.input<typeof discountSchema>

export type DiscountRequestPayload = {
  name: string
  nameAr?: string
  type: DiscountType
  scope: DiscountScope
  value: string
  maxInvoiceValue: number | null
  maxUses: number | null
  startDate: string
  endDate: string | null
  isActive: boolean
  categoryId?: number
  productId?: number
}

export function discountFormValuesToPayload(
  values: DiscountFormValues
): DiscountRequestPayload {
  const value = requireFiniteNumber(values.value, "discount value")
  const maxInvoiceValue = optionalPositiveNumberOrNull(values.maxInvoiceValue)
  const maxUses = optionalPositiveIntegerOrNull(values.maxUses)
  const nameAr = optionalText(values.nameAr)

  const payload: DiscountRequestPayload = {
    name: normalizeText(values.name),
    ...(nameAr ? { nameAr } : {}),
    type: values.type,
    scope: values.scope,
    value: String(value),
    maxInvoiceValue,
    maxUses,
    startDate: dateInputToIsoString(values.startDate),
    endDate: optionalDateInputToIsoString(values.endDate),
    isActive: values.isActive ?? true,
  }

  if (values.scope === "CATEGORY") {
    payload.categoryId = requirePositiveInteger(values.categoryId, "categoryId")
  }

  if (values.scope === "PRODUCT") {
    payload.productId = requirePositiveInteger(values.productId, "productId")
  }

  return payload
}
