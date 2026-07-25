import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  updateSupplier,
  type UpdateSupplierInput,
} from "@/services/supplier-service"

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: UpdateSupplierInput
    }) => updateSupplier(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["suppliers"],
      })

      queryClient.invalidateQueries({
        queryKey: ["supplier", variables.id],
      })
    },
  })
}
