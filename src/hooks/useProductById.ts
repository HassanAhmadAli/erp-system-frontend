import { useQuery } from "@tanstack/react-query"

import { getProductById } from "@/services/product-service"

export function useProductById(id: number | null) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id!),
    enabled: !!id,
  })
}
