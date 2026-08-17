import { z } from "zod"

import i18n from "@/i18n"
import { normalizeText, optionalText, parsePositiveInteger } from "./helpers"
import { optionalTrimmedText, requiredText } from "./zod-helpers"

export const NOTIFICATION_TARGET_TYPES = ["ALL", "ROLE", "USER"] as const
export type NotificationTargetType = (typeof NOTIFICATION_TARGET_TYPES)[number]

export const NOTIFICATION_TARGET_ROLES = [
  "CASHIER",
  "STORE_MANAGER",
  "ACCOUNTANT",
  "WAREHOUSE_WORKER",
] as const
export type NotificationTargetRole = (typeof NOTIFICATION_TARGET_ROLES)[number]

const userIdSchema = z.union([z.string(), z.number()])

export const notificationSchema = z
  .object({
    title: requiredText({
      requiredMessage: () => i18n.t("validation:notification.titleRequired"),
      min: 2,
      minMessage: () => i18n.t("validation:notification.titleMin"),
      max: 120,
      maxMessage: () => i18n.t("validation:notification.titleMax"),
    }),
    titleAr: optionalTrimmedText({
      max: 120,
      maxMessage: () => i18n.t("validation:notification.titleArMax"),
    }),
    body: requiredText({
      requiredMessage: () => i18n.t("validation:notification.bodyRequired"),
      min: 2,
      minMessage: () => i18n.t("validation:notification.bodyMin"),
      max: 1000,
      maxMessage: () => i18n.t("validation:notification.bodyMax"),
    }),
    bodyAr: optionalTrimmedText({
      max: 1000,
      maxMessage: () => i18n.t("validation:notification.bodyArMax"),
    }),
    targetType: z.string().superRefine((value, ctx) => {
      if (
        !NOTIFICATION_TARGET_TYPES.includes(value as NotificationTargetType)
      ) {
        ctx.addIssue({
          code: "custom",
          message: i18n.t("validation:notification.targetTypeInvalid"),
        })
      }
    }),
    targetRole: z.string().optional(),
    userIds: z.array(userIdSchema).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.targetType === "ROLE") {
      if (!values.targetRole) {
        ctx.addIssue({
          code: "custom",
          path: ["targetRole"],
          message: i18n.t("validation:notification.roleRequiredForRoleTarget"),
        })
      } else if (
        !NOTIFICATION_TARGET_ROLES.includes(
          values.targetRole as NotificationTargetRole
        )
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["targetRole"],
          message: i18n.t("validation:notification.roleInvalid"),
        })
      }
    }

    if (values.targetType === "USER") {
      const userIds = values.userIds ?? []

      if (userIds.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["userIds"],
          message: i18n.t("validation:notification.userRequired"),
        })
        return
      }

      const parsedIds: number[] = []

      for (const userId of userIds) {
        const parsed = parsePositiveInteger(userId)
        if (parsed == null) {
          ctx.addIssue({
            code: "custom",
            path: ["userIds"],
            message: i18n.t("validation:notification.userIdsInvalid"),
          })
          return
        }

        parsedIds.push(parsed)
      }

      if (new Set(parsedIds).size !== parsedIds.length) {
        ctx.addIssue({
          code: "custom",
          path: ["userIds"],
          message: i18n.t("validation:notification.duplicateUser"),
        })
      }
    }
  })

export type NotificationFormValues = z.input<typeof notificationSchema>

export type NotificationRequestPayload = {
  title: string
  titleAr?: string
  body: string
  bodyAr?: string
  targetType: NotificationTargetType
  targetRole?: NotificationTargetRole
  userIds?: number[]
}

export type NotificationFormErrors = Partial<
  Record<keyof NotificationFormValues, string>
>

export function notificationZodErrorToFormErrors(error: z.ZodError) {
  const errors: NotificationFormErrors = {}

  for (const issue of error.issues) {
    const field = issue.path[0]
    if (
      field !== "title" &&
      field !== "titleAr" &&
      field !== "body" &&
      field !== "bodyAr" &&
      field !== "targetType" &&
      field !== "targetRole" &&
      field !== "userIds"
    ) {
      continue
    }

    errors[field] ??= issue.message
  }

  return errors
}

export function notificationFormValuesToPayload(
  values: NotificationFormValues
): NotificationRequestPayload {
  const targetType = values.targetType as NotificationTargetType
  const titleAr = optionalText(values.titleAr)
  const bodyAr = optionalText(values.bodyAr)
  const payload: NotificationRequestPayload = {
    title: normalizeText(values.title),
    ...(titleAr ? { titleAr } : {}),
    body: normalizeText(values.body),
    ...(bodyAr ? { bodyAr } : {}),
    targetType,
  }

  if (targetType === "ROLE") {
    payload.targetRole = values.targetRole as NotificationTargetRole
  }

  if (targetType === "USER") {
    payload.userIds = (values.userIds ?? []).map((userId) => {
      const parsed = parsePositiveInteger(userId)
      if (parsed == null) throw new Error("Invalid notification user id")
      return parsed
    })
  }

  return payload
}
