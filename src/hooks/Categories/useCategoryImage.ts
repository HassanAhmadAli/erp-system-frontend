import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  deleteCategoryImage,
  uploadCategoryImage,
  type Category,
  type CategoryDetails,
} from "@/services/category-service"

type CategoryRecord = Category | CategoryDetails

function patchCategoryImage(
  queryClient: ReturnType<typeof useQueryClient>,
  categoryId: number,
  patch: Partial<Pick<Category, "imageUrl" | "storedFileId">> | CategoryRecord
) {
  const apply = (current: CategoryRecord | undefined) =>
    current ? { ...current, ...patch } : current

  queryClient.setQueryData(["category", categoryId], apply)
  queryClient.setQueryData(["category", String(categoryId)], apply)
}

function invalidateCategoryImage(
  queryClient: ReturnType<typeof useQueryClient>,
  categoryId: number
) {
  void queryClient.invalidateQueries({ queryKey: ["categories"] })
  void queryClient.invalidateQueries({
    queryKey: ["category", String(categoryId)],
  })
  void queryClient.invalidateQueries({
    queryKey: ["category", categoryId],
  })
}

export function useUploadCategoryImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ categoryId, file }: { categoryId: number; file: File }) =>
      uploadCategoryImage(categoryId, file),

    onSuccess: (data, variables) => {
      if (data && typeof data === "object" && "id" in data) {
        patchCategoryImage(queryClient, variables.categoryId, data)
      }
      invalidateCategoryImage(queryClient, variables.categoryId)
    },
  })
}

export function useDeleteCategoryImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryId: number) => deleteCategoryImage(categoryId),

    onMutate: async (categoryId) => {
      await queryClient.cancelQueries({ queryKey: ["category", categoryId] })
      await queryClient.cancelQueries({
        queryKey: ["category", String(categoryId)],
      })

      patchCategoryImage(queryClient, categoryId, {
        imageUrl: null,
        storedFileId: null,
      })
    },

    onSuccess: (_data, categoryId) => {
      patchCategoryImage(queryClient, categoryId, {
        imageUrl: null,
        storedFileId: null,
      })
      invalidateCategoryImage(queryClient, categoryId)
    },
  })
}
