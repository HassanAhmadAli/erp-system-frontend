import { useMutation, useQueryClient } from "@tanstack/react-query"

import { deleteProduct } from "@/services/product-service"

export function useDeleteProduct() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] })
      qc.invalidateQueries({ queryKey: ["products-low-stock"] })
    },
  })
}
