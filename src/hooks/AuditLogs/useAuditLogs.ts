import { useQuery } from "@tanstack/react-query"

import { asList } from "@/lib/list-utils"
import { getAuditLogs } from "@/services/audit-log-service"

export function useAuditLogs(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: async () => asList(await getAuditLogs(params)),
  })
}
