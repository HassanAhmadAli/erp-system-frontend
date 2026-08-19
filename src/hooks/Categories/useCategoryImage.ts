import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  deleteCategoryImage,
  uploadCategoryImage,
} from "@/services/category-service"

export function useUploadCategoryImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ categoryId, file }: { categoryId: number; file: File }) =>
      uploadCategoryImage(categoryId, file),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({
        queryKey: ["category", String(variables.categoryId)],
      })
      queryClient.invalidateQueries({
        queryKey: ["category", variables.categoryId],
      })
    },
  })
}

export function useDeleteCategoryImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryId: number) => deleteCategoryImage(categoryId),

    onSuccess: (_data, categoryId) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({
        queryKey: ["category", String(categoryId)],
      })
      queryClient.invalidateQueries({
        queryKey: ["category", categoryId],
      })
    },
  })
}
