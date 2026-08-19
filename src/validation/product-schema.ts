import { z } from "zod"

import i18n from "@/i18n"
import {
  normalizeText,
  optionalText,
  parsePositiveNumber,
  requireNonNegativeInteger,
  requirePositiveInteger,
  requirePositiveNumber,
} from "./helpers"
import {
  nonNegativeIntegerText,
  optionalTrimmedText,
  positiveIntegerText,
  positiveNumberText,
  requiredText,
} from "./zod-helpers"

export const productSchema = z
  .object({
    name: requiredText({
      min: 2,
      max: 100,
      requiredMessage: () => i18n.t("validation:product.nameRequired"),
      minMessage: () => i18n.t("validation:product.nameMin"),
      maxMessage: () => i18n.t("validation:product.nameMax"),
    }),

    nameAr: optionalTrimmedText({
      max: 100,
      maxMessage: () => i18n.t("validation:shared.nameArMax100"),
    }),

    description: optionalTrimmedText({
      max: 500,
      maxMessage: () => i18n.t("validation:shared.descriptionMax500"),
    }),

    descriptionAr: optionalTrimmedText({
      max: 500,
      maxMessage: () => i18n.t("validation:shared.descriptionArMax500"),
    }),

    barcode: requiredText({
      max: 64,
      requiredMessage: () => i18n.t("validation:product.barcodeRequired"),
      maxMessage: () => i18n.t("validation:product.barcodeMax"),
    }),

    purchasePrice: positiveNumberText({
      requiredMessage: () => i18n.t("validation:product.purchasePriceRequired"),
      invalidMessage: () => i18n.t("validation:product.purchasePriceInvalid"),
    }),

    sellingPrice: positiveNumberText({
      requiredMessage: () => i18n.t("validation:product.sellingPriceRequired"),
      invalidMessage: () => i18n.t("validation:product.sellingPriceInvalid"),
    }),

    quantityInStock: nonNegativeIntegerText({
      requiredMessage: () => i18n.t("validation:product.quantityRequired"),
      invalidMessage: () => i18n.t("validation:product.quantityInvalid"),
    }),

    minQuantity: nonNegativeIntegerText({
      requiredMessage: () => i18n.t("validation:product.minQuantityRequired"),
      invalidMessage: () => i18n.t("validation:product.minQuantityInvalid"),
    }),

    categoryId: positiveIntegerText({
      requiredMessage: () => i18n.t("validation:product.categoryRequired"),
      invalidMessage: () => i18n.t("validation:shared.selectCategoryValid"),
    }),

    supplierId: positiveIntegerText({
      requiredMessage: () => i18n.t("validation:product.supplierRequired"),
      invalidMessage: () => i18n.t("validation:product.supplierInvalid"),
    }),
  })
  .superRefine((data, ctx) => {
    const purchasePrice = parsePositiveNumber(data.purchasePrice)
    const sellingPrice = parsePositiveNumber(data.sellingPrice)

    if (
      purchasePrice != null &&
      sellingPrice != null &&
      sellingPrice < purchasePrice
    ) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:product.sellingBelowPurchase"),
        path: ["sellingPrice"],
      })
    }
  })

export type ProductFormValues = z.input<typeof productSchema>

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>

export type ProductRequestPayload = {
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  barcode: string
  purchasePrice: number
  sellingPrice: number
  quantityInStock: number
  minQuantity: number
  categoryId: number
  supplierId: number
}

export function productZodErrorToFormErrors(error: z.ZodError) {
  const errors: ProductFormErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (typeof field !== "string") continue
    if (!(field in productSchema.shape)) continue

    const key = field as keyof ProductFormValues
    errors[key] ??= issue.message
  }

  return errors
}

export function productFormValuesToPayload(
  values: ProductFormValues
): ProductRequestPayload {
  const nameAr = optionalText(values.nameAr)
  const description = optionalText(values.description)
  const descriptionAr = optionalText(values.descriptionAr)

  return {
    name: normalizeText(values.name),
    ...(nameAr ? { nameAr } : {}),
    ...(description ? { description } : {}),
    ...(descriptionAr ? { descriptionAr } : {}),
    barcode: normalizeText(values.barcode),
    purchasePrice: requirePositiveNumber(values.purchasePrice, "purchasePrice"),
    sellingPrice: requirePositiveNumber(values.sellingPrice, "sellingPrice"),
    quantityInStock: requireNonNegativeInteger(
      values.quantityInStock,
      "quantityInStock"
    ),
    minQuantity: requireNonNegativeInteger(values.minQuantity, "minQuantity"),
    categoryId: requirePositiveInteger(values.categoryId, "categoryId"),
    supplierId: requirePositiveInteger(values.supplierId, "supplierId"),
  }
}
