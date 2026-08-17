import { z } from "zod"

import i18n from "@/i18n"
import { parseCommaSeparatedPositiveIntegers } from "./helpers"
import { requiredText } from "./zod-helpers"

export const recalculateCostsSchema = z.object({
  productIds: requiredText({
    requiredMessage: () =>
      i18n.t("validation:recalculateCosts.productIdsRequired"),
  }).superRefine((value, ctx) => {
    try {
      const ids = parseCommaSeparatedPositiveIntegers(value)

      if (ids.length === 0) {
        ctx.addIssue({
          code: "custom",
          message: i18n.t("validation:recalculateCosts.productIdsInvalid"),
        })
      }
    } catch {
      ctx.addIssue({
        code: "custom",
        message: i18n.t("validation:recalculateCosts.productIdsInvalid"),
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
