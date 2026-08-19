import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createExpense,
  getExpenseById,
  getExpenses,
  normalizeExpensesList,
  updateExpense,
  type CreateExpenseInput,
  type ExpensesQuery,
  type UpdateExpenseInput,
} from "@/services/expense-service"
import { toPaginationQuery } from "@/lib/pagination"

export function useExpenses(params?: ExpensesQuery) {
  const query = toPaginationQuery(params)

  return useQuery({
    queryKey: ["expenses", query, params?.category],
    queryFn: async () =>
      normalizeExpensesList(
        await getExpenses({ ...params, ...query }),
        query.limit,
        query.offset
      ),
  })
}

export function useExpenseById(id: number) {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: () => getExpenseById(id),
    enabled: Number.isSafeInteger(id) && id > 0,
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateExpenseInput) => createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
    },
  })
}

export function useUpdateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExpenseInput }) =>
      updateExpense(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      queryClient.invalidateQueries({ queryKey: ["expense", id] })
    },
  })
}
