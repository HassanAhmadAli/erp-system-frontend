import { z } from "zod"

import {
  dateInputToIsoString,
  normalizeText,
  optionalDateInputToIsoString,
  optionalPositiveIntegerOrNull,
  optionalPositiveNumberOrNull,
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
      requiredMessage: "اسم الخصم مطلوب",
      minMessage: "اسم الخصم يجب أن يكون حرفين على الأقل",
      maxMessage: "اسم الخصم يجب ألا يتجاوز 100 حرف",
    }),

    type: discountTypeSchema,
    scope: discountScopeSchema,

    value: finiteNumberText({
      requiredMessage: "قيمة الخصم مطلوبة",
      invalidMessage: "أدخل قيمة خصم صالحة",
    }),

    categoryId: optionalPositiveIntegerText({
      invalidMessage: "اختر تصنيفًا صالحًا",
    }),

    productId: optionalPositiveIntegerText({
      invalidMessage: "اختر منتجًا صالحًا",
    }),

    maxInvoiceValue: optionalPositiveNumberText({
      invalidMessage: "أقصى قيمة للفاتورة يجب أن تكون أكبر من الصفر",
    }),

    maxUses: optionalPositiveIntegerText({
      invalidMessage:
        "عدد مرات الاستخدام يجب أن يكون رقمًا صحيحًا أكبر من الصفر",
    }),

    startDate: dateInputText("تاريخ البداية مطلوب"),
    endDate: optionalDateInputText(),

    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    const value = parseFiniteNumber(data.value)

    if (value != null && data.type === "PERCENTAGE") {
      if (value <= 0 || value > 100) {
        ctx.addIssue({
          code: "custom",
          message: "النسبة يجب أن تكون أكبر من 0 وأقل أو تساوي 100",
          path: ["value"],
        })
      }
    }

    if (value != null && data.type === "FIXED_AMOUNT" && value <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "مبلغ الخصم يجب أن يكون أكبر من الصفر",
        path: ["value"],
      })
    }

    if (
      data.scope === "CATEGORY" &&
      parsePositiveInteger(data.categoryId) == null
    ) {
      ctx.addIssue({
        code: "custom",
        message: "يرجى اختيار التصنيف",
        path: ["categoryId"],
      })
    }

    if (
      data.scope === "PRODUCT" &&
      parsePositiveInteger(data.productId) == null
    ) {
      ctx.addIssue({
        code: "custom",
        message: "يرجى اختيار المنتج",
        path: ["productId"],
      })
    }

    validateDateRange(ctx, data.startDate, data.endDate, "endDate")
  })

export type DiscountFormValues = z.input<typeof discountSchema>

export type DiscountRequestPayload = {
  name: string
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

  const payload: DiscountRequestPayload = {
    name: normalizeText(values.name),
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