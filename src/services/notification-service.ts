import { apiRequest, buildQuery, type PaginatedResponse } from "@/api/client"

export const NOTIFICATION_TARGET_TYPES = ["ALL", "ROLE", "USER"] as const
export type NotificationTargetType = (typeof NOTIFICATION_TARGET_TYPES)[number]

export const NOTIFICATION_TARGET_ROLES = [
  "CASHIER",
  "STORE_MANAGER",
  "ACCOUNTANT",
  "WAREHOUSE_WORKER",
] as const
export type NotificationTargetRole = (typeof NOTIFICATION_TARGET_ROLES)[number]

export type NotificationSender = {
  id: number
  fullName: string
  email: string
}

export type InboxNotificationRecipient = {
  id: number
  notificationId: number
  userId: number
  isRead: boolean
  readAt: string | null
  notification: {
    id: number
    senderId: number
    title: string
    body: string
    targetType: NotificationTargetType
    targetRole: NotificationTargetRole | null
    sentAt: string
    sender?: NotificationSender
  }
}

export type InboxNotification = {
  recipientId: number
  notificationId: number
  isRead: boolean
  readAt: string | null
  title: string
  body: string
  targetType: NotificationTargetType
  targetRole: NotificationTargetRole | null
  sentAt: string
  sender?: NotificationSender
}

export type SentNotificationHistory = {
  id: number
  title: string
  body: string
  targetType: NotificationTargetType
  targetRole: NotificationTargetRole | null
  sentAt: string
  sender?: NotificationSender
  recipientCount: number
}

export type SendNotificationPayload = {
  title: string
  body: string
  targetType: NotificationTargetType
  targetRole?: NotificationTargetRole
  userIds?: number[]
}

export type MyNotificationsQuery = {
  limit?: number
  offset?: number
  unreadOnly?: boolean
}

export type NotificationHistoryQuery = {
  limit?: number
  offset?: number
}

export function mapInboxRecipient(
  recipient: InboxNotificationRecipient
): InboxNotification {
  return {
    recipientId: recipient.id,
    notificationId: recipient.notificationId,
    isRead: recipient.isRead,
    readAt: recipient.readAt,
    title: recipient.notification.title,
    body: recipient.notification.body,
    targetType: recipient.notification.targetType,
    targetRole: recipient.notification.targetRole,
    sentAt: recipient.notification.sentAt,
    sender: recipient.notification.sender,
  }
}

export function normalizeInboxNotifications(
  response?:
    | PaginatedResponse<InboxNotificationRecipient>
    | InboxNotificationRecipient[]
) {
  if (!response) {
    return { items: [], total: 0, limit: 10, offset: 0, isFinalPage: true }
  }

  if (Array.isArray(response)) {
    const items = response.map(mapInboxRecipient)
    return {
      items,
      total: items.length,
      limit: items.length,
      offset: 0,
      isFinalPage: true,
    }
  }

  const items = (response.data ?? []).map(mapInboxRecipient)
  return {
    items,
    total: response.total ?? items.length,
    limit: response.limit ?? 10,
    offset: response.offset ?? 0,
    isFinalPage: response.isFinalPage ?? true,
  }
}

export function normalizeNotificationHistory(
  response?:
    | PaginatedResponse<SentNotificationHistory>
    | SentNotificationHistory[]
) {
  if (!response) {
    return { items: [], total: 0, limit: 10, offset: 0, isFinalPage: true }
  }

  if (Array.isArray(response)) {
    return {
      items: response,
      total: response.length,
      limit: response.length,
      offset: 0,
      isFinalPage: true,
    }
  }

  const items = response.data ?? []
  return {
    items,
    total: response.total ?? items.length,
    limit: response.limit ?? 10,
    offset: response.offset ?? 0,
    isFinalPage: response.isFinalPage ?? true,
  }
}

export function getMyNotifications(params?: MyNotificationsQuery) {
  return apiRequest<
    PaginatedResponse<InboxNotificationRecipient> | InboxNotificationRecipient[]
  >(`/notifications/me${buildQuery(params)}`)
}

export function markNotificationRead(recipientId: number) {
  return apiRequest<InboxNotificationRecipient>(
    `/notifications/${recipientId}/read`,
    {
      method: "PATCH",
    }
  )
}

export function markNotificationUnread(recipientId: number) {
  return apiRequest<InboxNotificationRecipient>(
    `/notifications/${recipientId}/unread`,
    {
      method: "PATCH",
    }
  )
}

export function sendNotification(payload: SendNotificationPayload) {
  return apiRequest(`/notifications/send`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function getNotificationHistory(params?: NotificationHistoryQuery) {
  return apiRequest<
    PaginatedResponse<SentNotificationHistory> | SentNotificationHistory[]
  >(`/notifications/history${buildQuery(params)}`)
}
