import { z } from "zod"

import { parseCommaSeparatedPositiveIntegers } from "./helpers"
import { requiredText } from "./zod-helpers"

export const recalculateCostsSchema = z.object({
  productIds: requiredText({
    requiredMessage: "أدخل معرفات المنتجات",
  }).superRefine((value, ctx) => {
    try {
      const ids = parseCommaSeparatedPositiveIntegers(value)

      if (ids.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: "أدخل معرفات منتجات صحيحة مفصولة بفواصل",
        })
      }
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "أدخل معرفات منتجات صحيحة مفصولة بفواصل",
      })
    }
  }),
})

export type RecalculateCostsFormValues = z.input<typeof recalculateCostsSchema>

export function recalculateCostsValuesToPayload(
  values: RecalculateCostsFormValues
) {
  return parseCommaSeparatedPositiveIntegers(values.productIds)
}
