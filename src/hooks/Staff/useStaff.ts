import { useQuery } from "@tanstack/react-query"

import type { PaginatedResponse } from "@/api/client"
import {
  getStaffProfiles,
  isStaffRole,
  normalizeStaffList,
  STAFF_ROLES,
  type StaffProfile,
  type StaffQuery,
} from "@/services/staff-service"
import { toPaginationQuery } from "@/lib/pagination"

export function useStaff(params?: StaffQuery) {
  const query = toPaginationQuery(params)

  return useQuery({
    queryKey: ["staff", params?.role ?? "ALL", query],
    queryFn: async (): Promise<PaginatedResponse<StaffProfile>> => {
      if (params?.role) {
        const response = await getStaffProfiles({
          ...params,
          ...query,
        })
        return normalizeStaffList(response, query.limit, query.offset)
      }

      const pages = await Promise.all(
        STAFF_ROLES.map((role) =>
          getStaffProfiles({ role, limit: 100, offset: 0 })
        )
      )

      const merged = pages
        .flatMap((page) => normalizeStaffList(page, 100, 0).data)
        .filter((user) => isStaffRole(user.role))
        .sort((a, b) => b.id - a.id)

      const data = merged.slice(query.offset, query.offset + query.limit)

      return {
        data,
        total: merged.length,
        limit: query.limit,
        offset: query.offset,
        isFinalPage: query.offset + query.limit >= merged.length,
      }
    },
  })
}
