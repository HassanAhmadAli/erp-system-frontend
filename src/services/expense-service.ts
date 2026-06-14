import { apiRequest, buildQuery, type PaginatedResponse } from "@/api/client"
import { toNumber } from "@/lib/report-parsers"

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

export type CreateExpenseInput = {
  description: string
  category: string
  amount: number
  expenseDate: string
}

export type UpdateExpenseInput = Partial<CreateExpenseInput>

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
  return apiRequest<Expense>(`/expenses/${id}`)
}

export function createExpense(data: CreateExpenseInput) {
  return apiRequest<Expense>("/expenses", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      expenseDate: new Date(data.expenseDate).toISOString(),
    }),
  })
}

export function updateExpense(id: number, data: UpdateExpenseInput) {
  const payload: UpdateExpenseInput = { ...data }

  if (data.expenseDate) {
    payload.expenseDate = new Date(data.expenseDate).toISOString()
  }

  return apiRequest<Expense>(`/expenses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}
