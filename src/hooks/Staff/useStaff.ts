import { useQuery } from "@tanstack/react-query"

import {
  getStaffProfiles,
  isStaffRole,
  normalizeStaffProfiles,
  type StaffQuery,
} from "@/services/staff-service"

export function useStaff(params?: StaffQuery) {
  return useQuery({
    queryKey: ["staff", params],
    queryFn: async () => {
      const response = await getStaffProfiles(params)
      const users = normalizeStaffProfiles(response)

      if (params?.role) {
        return users
      }

      return users.filter((user) => isStaffRole(user.role))
    },
  })
}
