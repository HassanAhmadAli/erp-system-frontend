import { useQuery } from "@tanstack/react-query"

import {
  getProductsByCategory,
  normalizeProductList,
  type ProductsQuery,
} from "@/services/product-service"
import { toPaginationQuery } from "@/lib/pagination"
import { isValidId } from "@/validation/helpers"

export function useProductsByCategory(
  categoryId: number,
  params?: ProductsQuery
) {
  const query = toPaginationQuery(params)

  return useQuery({
    queryKey: ["products", "category", categoryId, query],
    queryFn: async () =>
      normalizeProductList(
        await getProductsByCategory(categoryId, params),
        query.limit,
        query.offset
      ),
    enabled: isValidId(categoryId),
  })
}
