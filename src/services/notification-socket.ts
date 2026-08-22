import { io, type Socket } from "socket.io-client"

import { BASE_URL } from "@/api/client"
import { getAccessToken } from "@/utils/auth-storage"

export const LIVE_NOTIFICATION_EVENT = "recieve-message"

export type LiveNotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "security"

export type LiveNotification = {
  title: string
  message: string
  type: LiveNotificationType
  userId?: number
  email?: string | null
  createdAt?: string
}

let socket: Socket | null = null
let connectedToken: string | null = null

export function connectNotificationSocket() {
  const token = getAccessToken()

  if (!token) {
    disconnectNotificationSocket()
    return null
  }

  if (socket && connectedToken === token) {
    return socket
  }

  disconnectNotificationSocket()

  socket = io(`${BASE_URL}/notifications`, {
    query: { token },
    autoConnect: true,
    reconnection: true,
  })
  connectedToken = token

  return socket
}

export function disconnectNotificationSocket() {
  socket?.removeAllListeners()
  socket?.disconnect()
  socket = null
  connectedToken = null
}
