import { useQuery, useQueryClient } from "@tanstack/react-query"

import { findAuditLogById, type AuditLog } from "@/services/audit-log-service"

export function useAuditLogById(id: number | null) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ["audit-log", id],
    queryFn: async () => {
      const cachedLists = queryClient.getQueriesData<AuditLog[]>({
        queryKey: ["audit-logs"],
      })

      for (const [, logs] of cachedLists) {
        const cached = logs?.find((item) => item.id === id)
        if (cached) return cached
      }

      return findAuditLogById(id!)
    },
    enabled: id != null && Number.isFinite(id),
  })
}
