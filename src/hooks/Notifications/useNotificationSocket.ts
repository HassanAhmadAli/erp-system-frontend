import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import {
  connectNotificationSocket,
  disconnectNotificationSocket,
  LIVE_NOTIFICATION_EVENT,
  type LiveNotification,
  type LiveNotificationType,
} from "@/services/notification-socket"
import { subscribeAuthTokenChange } from "@/utils/auth-storage"

export type LiveNotificationToast = LiveNotification & { id: string }

const TOAST_DURATION_MS = 6000

const LIVE_TYPES: readonly LiveNotificationType[] = [
  "info",
  "success",
  "warning",
  "error",
  "security",
]

function parseLiveNotification(payload: unknown): LiveNotification | null {
  if (!payload || typeof payload !== "object") return null

  const value = payload as Record<string, unknown>
  const title = typeof value.title === "string" ? value.title : ""
  const message = typeof value.message === "string" ? value.message : ""

  if (!title.trim() && !message.trim()) return null

  const type = LIVE_TYPES.includes(value.type as LiveNotificationType)
    ? (value.type as LiveNotificationType)
    : "info"

  return {
    title,
    message,
    type,
    userId: typeof value.userId === "number" ? value.userId : undefined,
    email: typeof value.email === "string" ? value.email : null,
    createdAt:
      typeof value.createdAt === "string" ? value.createdAt : undefined,
  }
}

export function useNotificationSocket() {
  const queryClient = useQueryClient()
  const [toasts, setToasts] = useState<LiveNotificationToast[]>([])

  function dismissToast(id: string) {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  useEffect(() => {
    const timeouts = new Map<string, number>()

    function pushToast(notification: LiveNotification) {
      const id = crypto.randomUUID()
      setToasts((current) => [...current.slice(-4), { id, ...notification }])
      timeouts.set(
        id,
        window.setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== id))
          timeouts.delete(id)
        }, TOAST_DURATION_MS)
      )
    }

    function handleLiveMessage(payload: unknown) {
      const notification = parseLiveNotification(payload)
      if (!notification) return

      void queryClient.invalidateQueries({ queryKey: ["notifications"] })
      pushToast(notification)
    }

    function start() {
      const socket = connectNotificationSocket()
      if (!socket) return

      socket.off(LIVE_NOTIFICATION_EVENT)
      socket.on(LIVE_NOTIFICATION_EVENT, handleLiveMessage)
    }

    start()
    const unsubscribe = subscribeAuthTokenChange(start)

    return () => {
      unsubscribe()
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId))
      timeouts.clear()
      disconnectNotificationSocket()
    }
  }, [queryClient])

  return { toasts, dismissToast }
}
