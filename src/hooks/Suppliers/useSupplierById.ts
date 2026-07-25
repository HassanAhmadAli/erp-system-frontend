import { useQuery } from "@tanstack/react-query"
import { getSupplierById } from "@/services/supplier-service"
import { isValidId } from "@/validation/helpers"

export function useSupplierById(id: number | null) {
  return useQuery({
    queryKey: ["supplier", id],
    queryFn: () => getSupplierById(id ?? 0),
    enabled: isValidId(id),
  })
}
