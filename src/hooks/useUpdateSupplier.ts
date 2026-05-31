import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateSupplier } from "@/services/supplier-service"

export function useUpdateSupplier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: {
        fullName: string
        phone: string
        email: string
        address: string
      }
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
