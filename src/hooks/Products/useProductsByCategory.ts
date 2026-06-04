import { useQuery } from "@tanstack/react-query"

import {
  getProductsByCategory,
  normalizeProducts,
} from "@/services/product-service"

export function useProductsByCategory(categoryId: number) {
  return useQuery({
    queryKey: ["products", "category", categoryId],
    queryFn: async () => {
      const res = await getProductsByCategory(categoryId)
      return normalizeProducts(res)
    },
    enabled: categoryId !== undefined && categoryId !== null,
  })
}
