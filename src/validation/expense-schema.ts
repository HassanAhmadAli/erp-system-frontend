import { z } from "zod"

import {
    dateInputToIsoString,
    normalizeText,
    requirePositiveNumber,
} from "./helpers"
import { dateInputText, positiveNumberText, requiredText } from "./zod-helpers"

export const expenseSchema = z.object({
    description: requiredText({
        min: 2,
        max: 200,
        requiredMessage: "وصف المصروف مطلوب",
        minMessage: "وصف المصروف يجب أن يكون حرفين على الأقل",
        maxMessage: "وصف المصروف يجب ألا يتجاوز 200 حرف",
    }),

    category: requiredText({
        min: 2,
        max: 80,
        requiredMessage: "فئة المصروف مطلوبة",
        minMessage: "فئة المصروف يجب أن تكون حرفين على الأقل",
        maxMessage: "فئة المصروف يجب ألا تتجاوز 80 حرفًا",
    }),

    amount: positiveNumberText({
        requiredMessage: "المبلغ مطلوب",
        invalidMessage: "المبلغ يجب أن يكون رقمًا أكبر من الصفر",
    }),

    expenseDate: dateInputText("تاريخ المصروف مطلوب"),
})

export type ExpenseFormValues = z.input<typeof expenseSchema>

export type ExpenseFormErrors = Partial<Record<keyof ExpenseFormValues, string>>

export type ExpenseRequestPayload = {
    description: string
    category: string
    amount: number
    expenseDate: string
}

export function expenseZodErrorToFormErrors(error: z.ZodError) {
    const errors: ExpenseFormErrors = {}

    for (const issue of error.issues) {
        const field = issue.path[0]

        if (
            field !== "description" &&
            field !== "category" &&
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
    return {
        description: normalizeText(values.description),
        category: normalizeText(values.category),
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