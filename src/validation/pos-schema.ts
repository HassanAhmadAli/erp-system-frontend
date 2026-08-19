import { z } from "zod"

import i18n from "@/i18n"
import {
  parseFiniteNumber,
  parseNonNegativeInteger,
  parsePositiveInteger,
} from "./helpers"

type PosCheckoutCartItemValues = {
  productId?: string | number | null | undefined
  quantity?: string | number | null | undefined
  quantityInStock?: string | number | null | undefined
}

export const posCheckoutSchema = z
  .object({
    cart: z.array(
      z.object({
        productId: z.union([z.string(), z.number()]).nullish(),
        quantity: z.union([z.string(), z.number()]).nullish(),
        quantityInStock: z.union([z.string(), z.number()]).nullish(),
      })
    ),
    customerId: z.union([z.string(), z.number()]).nullish(),
    discountId: z.union([z.string(), z.number()]).nullish(),
    amountPaid: z.union([z.string(), z.number()]).nullish(),
    complete: z.boolean(),
    subtotal: z.union([z.string(), z.number()]).nullish(),
  })
  .superRefine((values, ctx) => {
    if (values.cart.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:pos.cartEmpty"),
        path: ["cart"],
      })
    }

    const productIds = new Set<number>()

    values.cart.forEach((item, index) => {
      const productId = parsePositiveInteger(item.productId)
      const quantity = parsePositiveInteger(item.quantity)
      const quantityInStock =
        item.quantityInStock == null
          ? null
          : parseNonNegativeInteger(item.quantityInStock)

      if (productId == null) {
        ctx.addIssue({
          code: "custom",
          message: i18n.t("validation:pos.invalidProduct"),
          path: ["cart", index, "productId"],
        })
      } else if (productIds.has(productId)) {
        ctx.addIssue({
          code: "custom",
          message: i18n.t("validation:shared.duplicateProductInInvoice"),
          path: ["cart"],
        })
      } else {
        productIds.add(productId)
      }

      if (quantity == null) {
        ctx.addIssue({
          code: "custom",
          message: i18n.t("validation:pos.quantityInvalid"),
          path: ["cart", index, "quantity"],
        })
      } else if (quantityInStock != null && quantity > quantityInStock) {
        ctx.addIssue({
          code: "custom",
          message: i18n.t("validation:pos.quantityExceedsStock"),
          path: ["cart", index, "quantity"],
        })
      }
    })

    const amountPaid = parseFiniteNumber(values.amountPaid)

    if (amountPaid == null) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:pos.amountPaidInvalid"),
        path: ["amountPaid"],
      })
    } else if (amountPaid < 0) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:pos.amountPaidNonNegative"),
        path: ["amountPaid"],
      })
    }

    if (values.complete && amountPaid != null) {
      const subtotal = parseFiniteNumber(values.subtotal)

      if (subtotal != null && amountPaid < subtotal) {
        ctx.addIssue({
          code: "custom",
          message: i18n.t("validation:pos.amountPaidBelowTotal"),
          path: ["amountPaid"],
        })
      }
    }

    if (
      values.customerId != null &&
      String(values.customerId).trim() !== "" &&
      parsePositiveInteger(values.customerId) == null
    ) {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:pos.customerInvalid"),
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
        message: i18n.t("validation:pos.discountIdInvalid"),
        path: ["discountId"],
      })
    }
  })

export type PosCheckoutFormValues = z.input<typeof posCheckoutSchema>

export type PosCheckoutItemPayload = {
  productId: number
  quantity: number
}

export type PosCheckoutPayload = {
  customerId?: number
  discountId: number | null
  amountPaid: number
  items: PosCheckoutItemPayload[]
  complete: boolean
}

export type PosCheckoutFormErrors = Partial<
  Record<"cart" | "customerId" | "discountId" | "amountPaid", string>
>

export function posCheckoutZodErrorToFormErrors(error: z.ZodError) {
  const errors: PosCheckoutFormErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (
      field !== "cart" &&
      field !== "customerId" &&
      field !== "discountId" &&
      field !== "amountPaid"
    ) {
      continue
    }

    errors[field] ??= issue.message
  }

  return errors
}

export function posCheckoutValuesToPayload(
  values: PosCheckoutFormValues
): PosCheckoutPayload {
  const customerId = parsePositiveInteger(values.customerId)
  const discountId = parsePositiveInteger(values.discountId)
  const amountPaid = parseFiniteNumber(values.amountPaid)

  if (amountPaid == null) {
    throw new Error("Invalid POS amountPaid")
  }

  return {
    ...(customerId != null ? { customerId } : {}),
    discountId,
    amountPaid,
    complete: values.complete,
    items: values.cart.map((item: PosCheckoutCartItemValues) => {
      const productId = parsePositiveInteger(item.productId)
      const quantity = parsePositiveInteger(item.quantity)

      if (productId == null || quantity == null) {
        throw new Error("Invalid POS cart item")
      }

      return { productId, quantity }
    }),
  }
}

export function validatePosCartBeforeCheckout(values: PosCheckoutFormValues) {
  return posCheckoutSchema.safeParse(values)
}
