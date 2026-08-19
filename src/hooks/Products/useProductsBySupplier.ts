import { useQuery } from "@tanstack/react-query"

import {
  getProductsBySupplier,
  normalizeProductList,
  type ProductsQuery,
} from "@/services/product-service"
import { toPaginationQuery } from "@/lib/pagination"
import { isValidId } from "@/validation/helpers"

export function useProductsBySupplier(
  supplierId: number,
  params?: ProductsQuery
) {
  const query = toPaginationQuery(params)

  return useQuery({
    queryKey: ["products", "supplier", supplierId, query],
    queryFn: async () =>
      normalizeProductList(
        await getProductsBySupplier(supplierId, params),
        query.limit,
        query.offset
      ),
    enabled: isValidId(supplierId),
  })
}
