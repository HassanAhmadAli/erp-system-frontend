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

function handshakeAuth() {
  const token = getAccessToken()
  return token ? { token } : {}
}

function bindReconnectAuth(target: Socket) {
  target.io.off("reconnect_attempt")
  target.io.on("reconnect_attempt", () => {
    const token = getAccessToken()
    if (!token) {
      disconnectNotificationSocket()
      return
    }
    target.auth = { token }
  })
}

export function connectNotificationSocket() {
  const token = getAccessToken()

  if (!token) {
    disconnectNotificationSocket()
    return null
  }

  if (socket) {
    socket.auth = { token }
    if (!socket.connected) {
      socket.connect()
    }
    return socket
  }

  socket = io(`${BASE_URL}/notifications`, {
    auth: handshakeAuth(),
    autoConnect: true,
    reconnection: true,
    transports: ["websocket", "polling"],
  })
  bindReconnectAuth(socket)

  return socket
}

export function disconnectNotificationSocket() {
  if (!socket) return

  socket.io.off("reconnect_attempt")
  socket.removeAllListeners()
  socket.disconnect()
  socket = null
}
