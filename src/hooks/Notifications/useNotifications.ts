import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getMyNotifications,
  getNotificationHistory,
  markNotificationRead,
  markNotificationUnread,
  normalizeInboxNotifications,
  normalizeNotificationHistory,
  sendNotification,
  type MyNotificationsQuery,
  type NotificationHistoryQuery,
  type SendNotificationPayload,
} from "@/services/notification-service"
import { isValidId } from "@/validation/helpers"

export function useMyNotifications(params?: MyNotificationsQuery) {
  return useQuery({
    queryKey: ["notifications", "inbox", params],
    queryFn: async () => {
      const response = await getMyNotifications(params)
      return normalizeInboxNotifications(response)
    },
  })
}

export function useNotificationHistory(
  params?: NotificationHistoryQuery,
  enabled = true
) {
  return useQuery({
    queryKey: ["notifications", "history", params],
    queryFn: async () => {
      const response = await getNotificationHistory(params)
      return normalizeNotificationHistory(response)
    },
    enabled,
    retry: false,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recipientId: number) => {
      if (!isValidId(recipientId)) throw new Error("Invalid notification id")
      return markNotificationRead(recipientId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useMarkNotificationUnread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (recipientId: number) => {
      if (!isValidId(recipientId)) throw new Error("Invalid notification id")
      return markNotificationUnread(recipientId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

export function useSendNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SendNotificationPayload) => sendNotification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}
