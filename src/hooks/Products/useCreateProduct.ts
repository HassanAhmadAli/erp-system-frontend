import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
  createProduct,
  type CreateProductInput,
} from "@/services/product-service"

export function useCreateProduct() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProductInput) => createProduct(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] })
      qc.invalidateQueries({ queryKey: ["products-low-stock"] })
    },
  })
}
