import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteSupplier } from "@/services/supplier-service"

export function useDeleteSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteSupplier(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["suppliers"],
      })
    },
  })
}
