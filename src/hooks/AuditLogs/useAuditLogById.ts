import { useQuery, useQueryClient } from "@tanstack/react-query"

import type { PaginatedResponse } from "@/api/client"
import { findAuditLogById, type AuditLog } from "@/services/audit-log-service"

export function useAuditLogById(id: number | null) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ["audit-log", id],
    queryFn: async () => {
      const cachedLists = queryClient.getQueriesData<
        PaginatedResponse<AuditLog>
      >({
        queryKey: ["audit-logs"],
      })

      for (const [, page] of cachedLists) {
        const cached = page?.data?.find((item) => item.id === id)
        if (cached) return cached
      }

      return findAuditLogById(id!)
    },
    enabled: id != null && Number.isFinite(id),
  })
}
