import { z } from "zod"

import {
  normalizeText,
  parsePositiveInteger,
} from "./helpers"
import { requiredText } from "./zod-helpers"

export const NOTIFICATION_TARGET_TYPES = ["ALL", "ROLE", "USER"] as const
export type NotificationTargetType =
  (typeof NOTIFICATION_TARGET_TYPES)[number]

export const NOTIFICATION_TARGET_ROLES = [
  "CASHIER",
  "STORE_MANAGER",
  "ACCOUNTANT",
  "WAREHOUSE_WORKER",
] as const
export type NotificationTargetRole =
  (typeof NOTIFICATION_TARGET_ROLES)[number]

const userIdSchema = z.union([z.string(), z.number()])

export const notificationSchema = z
  .object({
    title: requiredText({
      requiredMessage: "عنوان الإشعار مطلوب.",
      min: 2,
      minMessage: "عنوان الإشعار يجب أن يكون حرفين على الأقل.",
      max: 120,
      maxMessage: "عنوان الإشعار يجب ألا يتجاوز 120 حرفًا.",
    }),
    body: requiredText({
      requiredMessage: "نص الإشعار مطلوب.",
      min: 2,
      minMessage: "نص الإشعار يجب أن يكون حرفين على الأقل.",
      max: 1000,
      maxMessage: "نص الإشعار يجب ألا يتجاوز 1000 حرف.",
    }),
    targetType: z.string().superRefine((value, ctx) => {
      if (!NOTIFICATION_TARGET_TYPES.includes(value as NotificationTargetType)) {
        ctx.addIssue({
          code: "custom",
          message: "نوع المستهدف غير صالح.",
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
          message: "الدور مطلوب عند الإرسال حسب الدور.",
        })
      } else if (
        !NOTIFICATION_TARGET_ROLES.includes(
          values.targetRole as NotificationTargetRole
        )
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["targetRole"],
          message: "الدور غير صالح.",
        })
      }
    }

    if (values.targetType === "USER") {
      const userIds = values.userIds ?? []

      if (userIds.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["userIds"],
          message: "يرجى اختيار مستخدم واحد على الأقل.",
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
            message: "أرقام المستخدمين يجب أن تكون أرقامًا صحيحة موجبة.",
          })
          return
        }

        parsedIds.push(parsed)
      }

      if (new Set(parsedIds).size !== parsedIds.length) {
        ctx.addIssue({
          code: "custom",
          path: ["userIds"],
          message: "لا يمكن اختيار نفس المستخدم أكثر من مرة.",
        })
      }
    }
  })

export type NotificationFormValues = z.input<typeof notificationSchema>

export type NotificationRequestPayload = {
  title: string
  body: string
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
      field !== "body" &&
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
  const payload: NotificationRequestPayload = {
    title: normalizeText(values.title),
    body: normalizeText(values.body),
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
