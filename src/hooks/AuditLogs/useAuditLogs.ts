import { useQuery } from "@tanstack/react-query"

import type { PaginatedResponse } from "@/api/client"
import {
  normalizePaginatedResponse,
  toPaginationQuery,
  type PaginationParams,
} from "@/lib/pagination"
import { getAuditLogs, type AuditLog } from "@/services/audit-log-service"

export function useAuditLogs(params?: PaginationParams) {
  const query = toPaginationQuery(params)

  return useQuery({
    queryKey: ["audit-logs", query],
    queryFn: async (): Promise<PaginatedResponse<AuditLog>> =>
      normalizePaginatedResponse(
        await getAuditLogs(query),
        query.limit,
        query.offset
      ),
  })
}
