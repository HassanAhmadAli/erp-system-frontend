import { useQuery } from "@tanstack/react-query"

import {
  getLowStockProducts,
  normalizeProductList,
  type ProductsQuery,
} from "@/services/product-service"
import { toPaginationQuery } from "@/lib/pagination"

export function useLowStockProducts(params?: ProductsQuery, enabled = true) {
  const query = toPaginationQuery(params ?? { limit: 100 })

  return useQuery({
    queryKey: ["products-low-stock", query],
    queryFn: async () =>
      normalizeProductList(
        await getLowStockProducts({ ...params, ...query }),
        query.limit,
        query.offset
      ),
    enabled,
  })
}
