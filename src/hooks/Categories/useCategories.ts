import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  type UpdateCategoryInput,
} from "@/services/category-service"

type CategoriesQueryParams = {
  search: string
  page: number
  limit: number
}

type UpdateCategoryMutationInput = {
  id: number
  data: UpdateCategoryInput
}

export function useCategories(params: CategoriesQueryParams) {
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
    mutationFn: ({ id, data }: UpdateCategoryMutationInput) =>
      updateCategory(id, data),
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