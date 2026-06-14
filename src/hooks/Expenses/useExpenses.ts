import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  type CreateExpenseInput,
  type UpdateExpenseInput,
} from "@/services/expense-service"

export function useExpenses() {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: () => getAllExpenses(),
  })
}

export function useExpenseById(id: number) {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: () => getExpenseById(id),
    enabled: Number.isFinite(id),
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
