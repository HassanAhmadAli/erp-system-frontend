import { apiRequest, buildQuery, type PaginatedResponse } from "@/api/client"

export type Notification = {
  id: number
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export function getMyNotifications(params?: {
  limit?: number
  offset?: number
}) {
  return apiRequest<PaginatedResponse<Notification> | Notification[]>(
    `/notifications/me${buildQuery(params)}`
  )
}

export function markNotificationRead(id: number) {
  return apiRequest<Notification>(`/notifications/${id}/read`, {
    method: "PATCH",
  })
}

export function markNotificationUnread(id: number) {
  return apiRequest<Notification>(`/notifications/${id}/unread`, {
    method: "PATCH",
  })
}
