import { useQuery } from "@tanstack/react-query"

import { getStaffById } from "@/services/staff-service"
import { isValidId } from "@/validation/helpers"

export function useStaffById(id: number | null) {
  return useQuery({
    queryKey: ["staff", "detail", id],
    queryFn: () => getStaffById(id ?? 0),
    enabled: isValidId(id),
  })
}
