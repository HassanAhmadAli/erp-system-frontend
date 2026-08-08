import { useQuery } from "@tanstack/react-query"

import {
  getProducts,
  normalizeProductList,
  type ProductsQuery,
} from "@/services/product-service"
import { toPaginationQuery } from "@/lib/pagination"

export function useProducts(params?: ProductsQuery) {
  const query = toPaginationQuery(params ?? { limit: 100 })

  return useQuery({
    queryKey: ["products", query],
    queryFn: async () =>
      normalizeProductList(
        await getProducts({ ...params, ...query }),
        query.limit,
        query.offset
      ),
  })
}
