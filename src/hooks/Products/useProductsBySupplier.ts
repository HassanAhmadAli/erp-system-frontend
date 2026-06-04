import { useQuery } from "@tanstack/react-query"

import {
  getProductsBySupplier,
  normalizeProducts,
} from "@/services/product-service"

export function useProductsBySupplier(supplierId: number) {
  return useQuery({
    queryKey: ["products", "supplier", supplierId],
    queryFn: async () => {
      const res = await getProductsBySupplier(supplierId)
      return normalizeProducts(res)
    },
    enabled: supplierId !== undefined && supplierId !== null,
  })
}
