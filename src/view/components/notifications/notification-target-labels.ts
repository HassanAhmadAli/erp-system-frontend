import type {
  NotificationTargetRole,
  NotificationTargetType,
} from "@/services/notification-service"

export const targetTypeLabels: Record<NotificationTargetType, string> = {
  ALL: "الجميع",
  ROLE: "حسب الدور",
  USER: "مستخدمون محددون",
}

export const targetRoleLabels: Record<NotificationTargetRole, string> = {
  CASHIER: "كاشير",
  STORE_MANAGER: "مدير متجر",
  ACCOUNTANT: "محاسب",
  WAREHOUSE_WORKER: "عامل مستودع",
}

export function formatTargetLabel(
  targetType: NotificationTargetType,
  targetRole: NotificationTargetRole | null
) {
  if (targetType === "ROLE" && targetRole) {
    return `${targetTypeLabels.ROLE}: ${targetRoleLabels[targetRole]}`
  }

  return targetTypeLabels[targetType]
}

/** Inbox badge: role-only label without the "حسب الدور" prefix. */
export function formatInboxTargetLabel(
  targetType: NotificationTargetType,
  targetRole: NotificationTargetRole | null
) {
  if (targetType === "ROLE" && targetRole) {
    return targetRoleLabels[targetRole]
  }

  return targetTypeLabels[targetType]
}
