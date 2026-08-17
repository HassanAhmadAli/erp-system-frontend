import i18n from "@/i18n"
import type {
  NotificationTargetRole,
  NotificationTargetType,
} from "@/services/notification-service"

export function getTargetTypeLabel(type: NotificationTargetType): string {
  return i18n.t(`notifications.targetTypes.${type}`, { ns: "pages" })
}

export function getTargetRoleLabel(role: NotificationTargetRole): string {
  return i18n.t(`roles.${role}`, { ns: "common" })
}

export function formatTargetLabel(
  targetType: NotificationTargetType,
  targetRole: NotificationTargetRole | null
) {
  if (targetType === "ROLE" && targetRole) {
    return `${getTargetTypeLabel("ROLE")}: ${getTargetRoleLabel(targetRole)}`
  }

  return getTargetTypeLabel(targetType)
}

/** Inbox badge: role-only label without the "By role" prefix. */
export function formatInboxTargetLabel(
  targetType: NotificationTargetType,
  targetRole: NotificationTargetRole | null
) {
  if (targetType === "ROLE" && targetRole) {
    return getTargetRoleLabel(targetRole)
  }

  return getTargetTypeLabel(targetType)
}
