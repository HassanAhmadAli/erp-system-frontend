import { z } from "zod"

import i18n from "@/i18n"
import {
  dateInputToIsoString,
  normalizeText,
  optionalText,
  requirePositiveNumber,
} from "./helpers"
import {
  dateInputText,
  optionalTrimmedText,
  positiveNumberText,
  requiredText,
} from "./zod-helpers"

export const expenseSchema = z.object({
  description: requiredText({
    min: 2,
    max: 200,
    requiredMessage: () => i18n.t("validation:expense.descriptionRequired"),
    minMessage: () => i18n.t("validation:expense.descriptionMin"),
    maxMessage: () => i18n.t("validation:expense.descriptionMax"),
  }),

  descriptionAr: optionalTrimmedText({
    max: 200,
    maxMessage: () => i18n.t("validation:expense.descriptionArMax"),
  }),

  category: requiredText({
    min: 2,
    max: 80,
    requiredMessage: () => i18n.t("validation:expense.categoryRequired"),
    minMessage: () => i18n.t("validation:expense.categoryMin"),
    maxMessage: () => i18n.t("validation:expense.categoryMax"),
  }),

  categoryAr: optionalTrimmedText({
    max: 80,
    maxMessage: () => i18n.t("validation:expense.categoryArMax"),
  }),

  amount: positiveNumberText({
    requiredMessage: () => i18n.t("validation:expense.amountRequired"),
    invalidMessage: () => i18n.t("validation:expense.amountInvalid"),
  }),

  expenseDate: dateInputText(() => i18n.t("validation:expense.dateRequired")),
})

export type ExpenseFormValues = z.input<typeof expenseSchema>

export type ExpenseFormErrors = Partial<Record<keyof ExpenseFormValues, string>>

export type ExpenseRequestPayload = {
  description: string
  descriptionAr?: string
  category: string
  categoryAr?: string
  amount: number
  expenseDate: string
}

export function expenseZodErrorToFormErrors(error: z.ZodError) {
  const errors: ExpenseFormErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]

    if (
      field !== "description" &&
      field !== "descriptionAr" &&
      field !== "category" &&
      field !== "categoryAr" &&
      field !== "amount" &&
      field !== "expenseDate"
    ) {
      continue
    }

    errors[field] ??= issue.message
  }

  return errors
}

export function expenseFormValuesToPayload(
  values: ExpenseFormValues
): ExpenseRequestPayload {
  const descriptionAr = optionalText(values.descriptionAr)
  const categoryAr = optionalText(values.categoryAr)

  return {
    description: normalizeText(values.description),
    ...(descriptionAr ? { descriptionAr } : {}),
    category: normalizeText(values.category),
    ...(categoryAr ? { categoryAr } : {}),
    amount: requirePositiveNumber(values.amount, "amount"),
    expenseDate: values.expenseDate,
  }
}

export function expensePayloadToApiPayload(payload: ExpenseRequestPayload) {
  return {
    ...payload,
    expenseDate: dateInputToIsoString(payload.expenseDate),
  }
}
