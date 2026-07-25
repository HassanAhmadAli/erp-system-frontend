import { z } from "zod"

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
            requiredMessage: "اسم المنتج مطلوب",
            minMessage: "اسم المنتج يجب أن يكون حرفين على الأقل",
            maxMessage: "اسم المنتج يجب ألا يتجاوز 100 حرف",
        }),

        description: optionalTrimmedText({
            max: 500,
            maxMessage: "الوصف يجب ألا يتجاوز 500 حرف",
        }),

        barcode: requiredText({
            max: 64,
            requiredMessage: "الباركود مطلوب",
            maxMessage: "الباركود يجب ألا يتجاوز 64 حرفًا",
        }),

        purchasePrice: positiveNumberText({
            requiredMessage: "سعر الشراء مطلوب",
            invalidMessage: "سعر الشراء يجب أن يكون رقمًا أكبر من الصفر",
        }),

        sellingPrice: positiveNumberText({
            requiredMessage: "سعر البيع مطلوب",
            invalidMessage: "سعر البيع يجب أن يكون رقمًا أكبر من الصفر",
        }),

        quantityInStock: nonNegativeIntegerText({
            requiredMessage: "الكمية في المخزون مطلوبة",
            invalidMessage: "الكمية يجب أن تكون رقمًا صحيحًا لا يقل عن الصفر",
        }),

        minQuantity: nonNegativeIntegerText({
            requiredMessage: "الحد الأدنى للكمية مطلوب",
            invalidMessage: "الحد الأدنى يجب أن يكون رقمًا صحيحًا لا يقل عن الصفر",
        }),

        categoryId: positiveIntegerText({
            requiredMessage: "اختر التصنيف",
            invalidMessage: "اختر تصنيفًا صالحًا",
        }),

        supplierId: positiveIntegerText({
            requiredMessage: "اختر المورد",
            invalidMessage: "اختر موردًا صالحًا",
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
                message: "سعر البيع يجب ألا يكون أقل من سعر الشراء",
                path: ["sellingPrice"],
            })
        }
    })

export type ProductFormValues = z.input<typeof productSchema>

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>

export type ProductRequestPayload = {
    name: string
    description?: string
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
    const description = optionalText(values.description)

    return {
        name: normalizeText(values.name),
        ...(description ? { description } : {}),
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