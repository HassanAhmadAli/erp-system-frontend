import { apiRequest, buildQuery, type PaginatedResponse } from "@/api/client"
import {
  normalizePaginatedResponse,
  toPaginationQuery,
  type PaginationParams,
} from "@/lib/pagination"
import { toNumber } from "@/lib/report-parsers"
import { formatNumber } from "@/utils/number-formatters"
import {
  expensePayloadToApiPayload,
  type ExpenseRequestPayload,
} from "@/validation/expense-schema"
import { isValidId } from "@/validation/helpers"

export type Expense = {
  id: number
  description: string
  descriptionAr?: string | null
  category: string
  categoryAr?: string | null
  amount: number | string
  expenseDate: string
  recordedById?: number
  recordedBy?: {
    id: number
    fullName?: string
    fullNameAr?: string | null
    email?: string
  }
  createdAt?: string
  updatedAt?: string
}

export type ExpensesQuery = PaginationParams & {
  category?: string
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
  return formatNumber(parseExpenseAmount(amount))
}

export function normalizeExpensesList(
  response?: PaginatedResponse<Expense> | Expense[] | null,
  fallbackLimit = 10,
  fallbackOffset = 0
) {
  return normalizePaginatedResponse(response, fallbackLimit, fallbackOffset)
}

export async function getAllExpenses(): Promise<Expense[]> {
  const limit = 100
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

export function getExpenses(params?: ExpensesQuery) {
  const { category, ...pagination } = params ?? {}
  const query = toPaginationQuery(pagination)

  return apiRequest<PaginatedResponse<Expense> | Expense[]>(
    `/expenses${buildQuery({ ...query, category })}`
  )
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
