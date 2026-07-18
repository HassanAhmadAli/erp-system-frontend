import { z } from "zod"

import {
  dateInputToIsoString,
  isValidDateInputValue,
  parsePositiveInteger,
  parsePositiveNumber,
} from "./helpers"

export const PURCHASE_INVOICE_STATUS_OPTIONS = [
  "PENDING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
] as const

export type PurchaseInvoiceStatus =
  (typeof PURCHASE_INVOICE_STATUS_OPTIONS)[number]

type PurchaseInvoiceItemValues = {
  productId?: string | number | null | undefined
  quantity?: string | number | null | undefined
  unitCost?: string | number | null | undefined
  expiryDate?: string | null | undefined
}

function isValidDateTimeInputValue(value: string | null | undefined) {
  if (!value?.trim()) return false

  const parsed = new Date(value)
  return Number.isFinite(parsed.getTime())
}

function dateTimeInputToIsoString(value: string) {
  if (!isValidDateTimeInputValue(value)) {
    throw new Error("Invalid purchase invoice date")
  }

  return new Date(value).toISOString()
}

function hasOptionalDateValue(value: string | null | undefined) {
  return Boolean(value?.trim())
}

export const purchaseInvoiceSchema = z
  .object({
    supplierId: z.union([z.string(), z.number()]).nullish(),
    invoiceDate: z.string(),
    receive: z.boolean(),
    items: z.array(
      z.object({
        productId: z.union([z.string(), z.number()]).nullish(),
        quantity: z.union([z.string(), z.number()]).nullish(),
        unitCost: z.union([z.string(), z.number()]).nullish(),
        expiryDate: z.string().nullish(),
      })
    ),
  })
  .superRefine((values, ctx) => {
    if (parsePositiveInteger(values.supplierId) == null) {
      ctx.addIssue({
        code: "custom",
        message: "أدخل رقم المورد بشكل صحيح",
        path: ["supplierId"],
      })
    }

    if (!isValidDateTimeInputValue(values.invoiceDate)) {
      ctx.addIssue({
        code: "custom",
        message: "أدخل تاريخ الفاتورة بشكل صحيح",
        path: ["invoiceDate"],
      })
    }

    if (values.items.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "أضف منتجًا واحدًا على الأقل إلى الفاتورة",
        path: ["items"],
      })
    }

    const productIds = new Set<number>()

    values.items.forEach((item, index) => {
      const productId = parsePositiveInteger(item.productId)
      const quantity = parsePositiveInteger(item.quantity)
      const unitCost = parsePositiveNumber(item.unitCost)

      if (productId == null) {
        ctx.addIssue({
          code: "custom",
          message: "رقم المنتج يجب أن يكون رقمًا صحيحًا أكبر من الصفر",
          path: ["items", index, "productId"],
        })
      } else if (productIds.has(productId)) {
        ctx.addIssue({
          code: "custom",
          message: "لا يمكن تكرار نفس المنتج في الفاتورة",
          path: ["items"],
        })
      } else {
        productIds.add(productId)
      }

      if (quantity == null) {
        ctx.addIssue({
          code: "custom",
          message: "الكمية يجب أن تكون رقمًا صحيحًا أكبر من الصفر",
          path: ["items", index, "quantity"],
        })
      }

      if (unitCost == null) {
        ctx.addIssue({
          code: "custom",
          message: "تكلفة الوحدة يجب أن تكون رقمًا أكبر من الصفر",
          path: ["items", index, "unitCost"],
        })
      }

      if (
        hasOptionalDateValue(item.expiryDate) &&
        !isValidDateInputValue(item.expiryDate)
      ) {
        ctx.addIssue({
          code: "custom",
          message: "أدخل تاريخ الانتهاء بشكل صحيح",
          path: ["items", index, "expiryDate"],
        })
      }
    })
  })

export type PurchaseInvoiceFormValues = z.input<typeof purchaseInvoiceSchema>

export type PurchaseInvoiceItemPayload = {
  productId: number
  quantity: number
  unitCost: number
  expiryDate?: string
}

export type PurchaseInvoicePayload = {
  supplierId: number
  invoiceDate: string
  items: PurchaseInvoiceItemPayload[]
  receive: boolean
}

export type PurchaseInvoiceFormErrors = Partial<
  Record<"supplierId" | "invoiceDate" | "items" | "status", string>
>

export function isPurchaseInvoiceStatus(
  status: unknown
): status is PurchaseInvoiceStatus {
  return PURCHASE_INVOICE_STATUS_OPTIONS.includes(
    status as PurchaseInvoiceStatus
  )
}

export function purchaseInvoiceZodErrorToFormErrors(error: z.ZodError) {
  const errors: PurchaseInvoiceFormErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (field !== "supplierId" && field !== "invoiceDate" && field !== "items") {
      continue
    }

    errors[field] ??= issue.message
  }

  return errors
}

export function purchaseInvoiceValuesToPayload(
  values: PurchaseInvoiceFormValues
): PurchaseInvoicePayload {
  const supplierId = parsePositiveInteger(values.supplierId)

  if (supplierId == null) {
    throw new Error("Invalid purchase invoice supplierId")
  }

  return {
    supplierId,
    invoiceDate: dateTimeInputToIsoString(values.invoiceDate),
    receive: values.receive,
    items: values.items.map((item: PurchaseInvoiceItemValues) => {
      const productId = parsePositiveInteger(item.productId)
      const quantity = parsePositiveInteger(item.quantity)
      const unitCost = parsePositiveNumber(item.unitCost)
      const expiryDate = item.expiryDate?.trim()

      if (productId == null || quantity == null || unitCost == null) {
        throw new Error("Invalid purchase invoice item")
      }

      return {
        productId,
        quantity,
        unitCost,
        ...(expiryDate
          ? { expiryDate: dateInputToIsoString(expiryDate) }
          : {}),
      }
    }),
  }
}

export function validatePurchaseInvoiceItems(
  values: PurchaseInvoiceFormValues
) {
  return purchaseInvoiceSchema.safeParse(values)
}