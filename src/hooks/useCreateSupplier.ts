import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createSupplier } from "@/services/supplier-service"

export function useCreateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSupplier,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["suppliers"],
      })
    },

    onError: (error) => {
      console.error("Create supplier failed", error)
    },
  })
}
