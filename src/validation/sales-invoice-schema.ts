import { z } from "zod"

import {
  parseFiniteNumber,
  parsePositiveInteger,
} from "./helpers"

export const SALES_INVOICE_STATUS_OPTIONS = [
  "PENDING",
  "COMPLETED",
  "REFUNDED",
] as const

export type SalesInvoiceStatus =
  (typeof SALES_INVOICE_STATUS_OPTIONS)[number]

type SalesInvoiceItemValues = {
  productId?: string | number | null | undefined
  quantity?: string | number | null | undefined
}

export const salesInvoiceSchema = z
  .object({
    customerId: z.union([z.string(), z.number()]).nullish(),
    discountId: z.union([z.string(), z.number()]).nullish(),
    amountPaid: z.union([z.string(), z.number()]).nullish(),
    items: z.array(
      z.object({
        productId: z.union([z.string(), z.number()]).nullish(),
        quantity: z.union([z.string(), z.number()]).nullish(),
      })
    ),
    complete: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const customerId = parsePositiveInteger(values.customerId)

    if (customerId == null) {
      ctx.addIssue({
        code: "custom",
        message: "أدخل رقم العميل بشكل صحيح",
        path: ["customerId"],
      })
    }

    if (
      values.discountId != null &&
      String(values.discountId).trim() !== "" &&
      parsePositiveInteger(values.discountId) == null
    ) {
      ctx.addIssue({
        code: "custom",
        message: "أدخل رقم الخصم بشكل صحيح أو اتركه فارغًا",
        path: ["discountId"],
      })
    }

    const amountPaid = parseFiniteNumber(values.amountPaid)

    if (amountPaid == null) {
      ctx.addIssue({
        code: "custom",
        message: "أدخل المبلغ المدفوع بشكل صحيح",
        path: ["amountPaid"],
      })
    } else if (amountPaid < 0) {
      ctx.addIssue({
        code: "custom",
        message: "المبلغ المدفوع يجب ألا يكون أقل من الصفر",
        path: ["amountPaid"],
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
    })
  })

export type SalesInvoiceFormValues = z.input<typeof salesInvoiceSchema>

export type SalesInvoiceItemPayload = {
  productId: number
  quantity: number
}

export type SalesInvoicePayload = {
  customerId: number
  discountId: number | null
  amountPaid: number
  items: SalesInvoiceItemPayload[]
  complete: boolean
}

export type SalesInvoiceFormErrors = Partial<
  Record<"customerId" | "discountId" | "amountPaid" | "items" | "status", string>
>

export function isSalesInvoiceStatus(
  status: unknown
): status is SalesInvoiceStatus {
  return SALES_INVOICE_STATUS_OPTIONS.includes(status as SalesInvoiceStatus)
}

export function salesInvoiceZodErrorToFormErrors(error: z.ZodError) {
  const errors: SalesInvoiceFormErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (
      field !== "customerId" &&
      field !== "discountId" &&
      field !== "amountPaid" &&
      field !== "items"
    ) {
      continue
    }

    errors[field] ??= issue.message
  }

  return errors
}

export function salesInvoiceValuesToPayload(
  values: SalesInvoiceFormValues
): SalesInvoicePayload {
  const customerId = parsePositiveInteger(values.customerId)
  const amountPaid = parseFiniteNumber(values.amountPaid)
  const discountId = parsePositiveInteger(values.discountId)

  if (customerId == null) {
    throw new Error("Invalid sales invoice customerId")
  }

  if (amountPaid == null) {
    throw new Error("Invalid sales invoice amountPaid")
  }

  return {
    customerId,
    discountId,
    amountPaid,
    complete: values.complete,
    items: values.items.map((item: SalesInvoiceItemValues) => {
      const productId = parsePositiveInteger(item.productId)
      const quantity = parsePositiveInteger(item.quantity)

      if (productId == null || quantity == null) {
        throw new Error("Invalid sales invoice item")
      }

      return { productId, quantity }
    }),
  }
}

export function validateSalesInvoiceItems(values: SalesInvoiceFormValues) {
  return salesInvoiceSchema.safeParse(values)
}
