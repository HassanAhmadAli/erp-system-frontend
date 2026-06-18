import { useQuery } from "@tanstack/react-query"

import {
  getUsers,
  normalizeUsers,
  type UsersQuery,
} from "@/services/user-service"

export function useUsers(params?: UsersQuery, enabled = true) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => normalizeUsers(await getUsers(params)),
    enabled,
    retry: false,
  })
}
