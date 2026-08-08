import { useQuery } from "@tanstack/react-query"

import {
  getSuppliers,
  normalizeSuppliers,
  type SuppliersQuery,
} from "@/services/supplier-service"
import { toPaginationQuery } from "@/lib/pagination"

export function useSuppliers(params?: SuppliersQuery) {
  const query = toPaginationQuery(params ?? { limit: 100 })

  return useQuery({
    queryKey: ["suppliers", query],
    queryFn: async () =>
      normalizeSuppliers(
        await getSuppliers({ ...params, ...query }),
        query.limit,
        query.offset
      ),
  })
}
