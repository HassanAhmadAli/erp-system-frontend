import { useQuery } from "@tanstack/react-query"

import { getCurrentUser } from "@/services/user-service"
import { getAccessToken } from "@/utils/auth-storage"

export function useCurrentUser() {
  const token = getAccessToken()

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}
