import { useQuery } from "@tanstack/react-query"
import { getSupplierById } from "@/services/supplier-service"

export function useSupplierById(id: number | null) {
  return useQuery({
    queryKey: ["supplier", id],
    queryFn: () => getSupplierById(id!),
    enabled: !!id,
  })
}
