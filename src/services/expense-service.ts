import { apiRequest, buildQuery, type PaginatedResponse } from "@/api/client"
import { toNumber } from "@/lib/report-parsers"
import {
  expensePayloadToApiPayload,
  type ExpenseRequestPayload,
} from "@/validation/expense-schema"
import { isValidId } from "@/validation/helpers"

export type Expense = {
  id: number
  description: string
  category: string
  amount: number | string
  expenseDate: string
  recordedById?: number
  recordedBy?: {
    id: number
    fullName?: string
    email?: string
  }
  createdAt?: string
  updatedAt?: string
}

export type CreateExpenseInput = ExpenseRequestPayload
export type UpdateExpenseInput = Partial<ExpenseRequestPayload>

export function parseExpenseAmount(amount: unknown): number {
  if (amount != null && typeof amount === "object") {
    return toNumber(String(amount)) ?? 0
  }

  return toNumber(amount) ?? 0
}

export function sumExpenseAmounts(expenses: Expense[]): number {
  return expenses.reduce(
    (sum, expense) => sum + parseExpenseAmount(expense.amount),
    0
  )
}

export function formatExpenseAmount(amount: unknown): string {
  return parseExpenseAmount(amount).toLocaleString("ar-SY", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export async function getAllExpenses(): Promise<Expense[]> {
  const limit = 50
  let offset = 0
  const all: Expense[] = []

  while (true) {
    const response = await apiRequest<PaginatedResponse<Expense> | Expense[]>(
      `/expenses${buildQuery({ limit, offset })}`
    )

    if (Array.isArray(response)) {
      return response
    }

    all.push(...response.data)

    if (response.isFinalPage || response.data.length === 0) {
      break
    }

    offset += limit
  }

  return all
}

export function getExpenses() {
  return apiRequest<PaginatedResponse<Expense> | Expense[]>("/expenses")
}

export function getExpenseById(id: number) {
  if (!isValidId(id)) {
    throw new Error("Invalid expense id")
  }

  return apiRequest<Expense>(`/expenses/${id}`)
}

export function createExpense(data: CreateExpenseInput) {
  return apiRequest<Expense>("/expenses", {
    method: "POST",
    body: JSON.stringify(expensePayloadToApiPayload(data)),
  })
}

export function updateExpense(id: number, data: UpdateExpenseInput) {
  if (!isValidId(id)) {
    throw new Error("Invalid expense id")
  }

  const payload =
    data.expenseDate != null
      ? expensePayloadToApiPayload(data as ExpenseRequestPayload)
      : data

  return apiRequest<Expense>(`/expenses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}