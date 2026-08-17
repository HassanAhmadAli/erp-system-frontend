import { z } from "zod"

import i18n from "@/i18n"
import {
  optionalPositiveIntegerOrNull,
  requirePositiveInteger,
  requirePositiveNumber,
} from "./helpers"
import { positiveNumberText, positiveIntegerText } from "./zod-helpers"

export const discountHelperTargetTypeSchema = z.enum([
  "NONE",
  "GLOBAL",
  "CATEGORY",
  "PRODUCT",
])

function buildDiscountLookupSchema() {
  return z
    .object({
      subtotal: positiveNumberText({
        requiredMessage: () => i18n.t("validation:discount.subtotalRequired"),
        invalidMessage: () => i18n.t("validation:discount.subtotalInvalid"),
      }),
      categoryId: z.string().optional(),
      productId: z.string().optional(),
      targetType: discountHelperTargetTypeSchema,
    })
    .superRefine((data, ctx) => {
      if (
        data.targetType === "CATEGORY" &&
        optionalPositiveIntegerOrNull(data.categoryId) == null
      ) {
        ctx.addIssue({
          code: "custom",
          message: i18n.t("validation:shared.selectCategory"),
          path: ["categoryId"],
        })
      }

      if (
        data.targetType === "PRODUCT" &&
        optionalPositiveIntegerOrNull(data.productId) == null
      ) {
        ctx.addIssue({
          code: "custom",
          message: i18n.t("validation:shared.selectProduct"),
          path: ["productId"],
        })
      }
    })
}

export const calculateDiscountSchema = buildDiscountLookupSchema().extend({
  discountId: positiveIntegerText({
    requiredMessage: () => i18n.t("validation:discount.discountIdRequired"),
    invalidMessage: () => i18n.t("validation:discount.discountIdInvalid"),
  }),
})

export const bestDiscountSchema = buildDiscountLookupSchema()

export type CalculateDiscountFormValues = z.input<
  typeof calculateDiscountSchema
>
export type BestDiscountFormValues = z.input<typeof bestDiscountSchema>

export function calculateDiscountValuesToPayload(
  values: CalculateDiscountFormValues
) {
  return {
    discountId: requirePositiveInteger(values.discountId, "discountId"),
    subtotal: requirePositiveNumber(values.subtotal, "subtotal"),
    categoryId:
      values.targetType === "CATEGORY"
        ? requirePositiveInteger(values.categoryId, "categoryId")
        : undefined,
    productId:
      values.targetType === "PRODUCT"
        ? requirePositiveInteger(values.productId, "productId")
        : undefined,
  }
}

export function bestDiscountValuesToPayload(values: BestDiscountFormValues) {
  return {
    subtotal: requirePositiveNumber(values.subtotal, "subtotal"),
    categoryId:
      values.targetType === "CATEGORY"
        ? requirePositiveInteger(values.categoryId, "categoryId")
        : undefined,
    productId:
      values.targetType === "PRODUCT"
        ? requirePositiveInteger(values.productId, "productId")
        : undefined,
  }
}
