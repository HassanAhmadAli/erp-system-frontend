import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  updateProduct,
  type UpdateProductInput,
} from "@/services/product-service"

export function useUpdateProduct() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductInput }) =>
      updateProduct(id, data),

    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["products"] })
      qc.invalidateQueries({ queryKey: ["products-low-stock"] })
      qc.invalidateQueries({ queryKey: ["product", variables.id] })
    },
  })
}
