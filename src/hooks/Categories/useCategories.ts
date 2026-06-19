import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/category-service"

export function useCategories(params: {
  search: string
  page: number
  limit: number
}) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => getCategories(params),
    placeholderData: (prev) => prev,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: { name?: string; description?: string }
    }) => updateCategory(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}
