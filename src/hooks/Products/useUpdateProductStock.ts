import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  updateProductStock,
  type UpdateStockInput,
} from "@/services/product-service"

export function useUpdateProductStock() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStockInput }) =>
      updateProductStock(id, data),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["products-low-stock"] })
      qc.invalidateQueries({ queryKey: ["product", variables.id] })
    },
  })
}
