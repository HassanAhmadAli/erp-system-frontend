import { z } from "zod"

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
        requiredMessage: "إجمالي الفاتورة مطلوب",
        invalidMessage: "يرجى إدخال إجمالي فاتورة صحيح",
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
          message: "يرجى اختيار التصنيف",
          path: ["categoryId"],
        })
      }

      if (
        data.targetType === "PRODUCT" &&
        optionalPositiveIntegerOrNull(data.productId) == null
      ) {
        ctx.addIssue({
          code: "custom",
          message: "يرجى اختيار المنتج",
          path: ["productId"],
        })
      }
    })
}

export const calculateDiscountSchema = buildDiscountLookupSchema().extend({
  discountId: positiveIntegerText({
    requiredMessage: "رقم الخصم مطلوب",
    invalidMessage: "يرجى إدخال رقم خصم صحيح",
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
