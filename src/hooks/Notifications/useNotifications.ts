import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { asList } from "@/lib/list-utils"
import {
  getMyNotifications,
  markNotificationRead,
  markNotificationUnread,
} from "@/services/notification-service"

export function useMyNotifications(params?: {
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: async () => asList(await getMyNotifications(params)),
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useMarkNotificationUnread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => markNotificationUnread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}
