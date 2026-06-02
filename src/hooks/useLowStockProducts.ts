import { useQuery } from "@tanstack/react-query"

import {
  getLowStockProducts,
  normalizeProducts,
} from "@/services/product-service"

export function useLowStockProducts() {
  return useQuery({
    queryKey: ["products-low-stock"],
    queryFn: async () => {
      const res = await getLowStockProducts()
      return normalizeProducts(res)
    },
  })
}
