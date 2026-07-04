import { useState } from "react"
import { Send } from "lucide-react"

import { useSendNotification } from "@/hooks/Notifications/useNotifications"
import { NotificationUserPicker } from "@/view/components/notifications/notification-user-picker"
import {
  NOTIFICATION_TARGET_ROLES,
  NOTIFICATION_TARGET_TYPES,
  type NotificationTargetRole,
  type NotificationTargetType,
} from "@/services/notification-service"
import {
  notificationFormValuesToPayload,
  notificationSchema,
  notificationZodErrorToFormErrors,
  type NotificationFormErrors,
} from "@/validation/notification-schema"
import {
  targetRoleLabels,
  targetTypeLabels,
} from "@/view/components/notifications/notification-target-labels"
import { Button } from "@/view/components/ui/button"
import { toEnglishDigits } from "@/utils/number-formatters"

export function SendNotificationForm() {
  const sendNotification = useSendNotification()

  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [targetType, setTargetType] = useState<NotificationTargetType>("ALL")
  const [targetRole, setTargetRole] =
    useState<NotificationTargetRole>("CASHIER")
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [formErrors, setFormErrors] = useState<NotificationFormErrors>({})
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  function handleTargetTypeChange(nextType: NotificationTargetType) {
    setTargetType(nextType)

    if (nextType !== "USER") {
      setSelectedUserIds([])
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")
    setFormErrors({})

    const validation = notificationSchema.safeParse({
      title,
      body,
      targetType,
      targetRole,
      userIds: selectedUserIds,
    })

    if (!validation.success) {
      setFormErrors(notificationZodErrorToFormErrors(validation.error))
      return
    }

    sendNotification.mutate(
      notificationFormValuesToPayload(validation.data),
      {
        onSuccess: () => {
          setSuccessMessage("تم إرسال الإشعار بنجاح.")
          setTitle("")
          setBody("")
          setSelectedUserIds([])
          setTargetType("ALL")
          setTargetRole("CASHIER")
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "فشل إرسال الإشعار."

          setErrorMessage(toEnglishDigits(message))
        },
      }
    )
  }

  return (
    <section className="rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
      <div className="mb-5 flex items-center gap-2">
        <Send className="h-5 w-5 text-[var(--erp-accent)]" />

        <div className="text-right">
          <h2 className="text-lg font-semibold text-[var(--erp-text)]">
            إرسال إشعار
          </h2>

          <p className="text-sm text-[var(--erp-muted)]">
            أرسل إشعارًا داخليًا للجميع أو حسب الدور أو لمستخدمين محددين.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <div className="space-y-2">
          <input
            placeholder="عنوان الإشعار"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none"
          />

          {formErrors.title && (
            <p className="text-sm text-red-500">{formErrors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <textarea
            rows={4}
            placeholder="نص الإشعار"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="w-full rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none"
          />

          {formErrors.body && (
            <p className="text-sm text-red-500">{formErrors.body}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-right text-sm">
            <span className="mb-2 block text-[var(--erp-muted)]">
              نوع المستهدف
            </span>

            <select
              value={targetType}
              onChange={(event) =>
                handleTargetTypeChange(
                  event.target.value as NotificationTargetType
                )
              }
              className="w-full rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none"
            >
              {NOTIFICATION_TARGET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {targetTypeLabels[type]}
                </option>
              ))}
            </select>

            {formErrors.targetType && (
              <p className="mt-2 text-sm text-red-500">
                {formErrors.targetType}
              </p>
            )}
          </label>

          {targetType === "ROLE" && (
            <label className="block text-right text-sm">
              <span className="mb-2 block text-[var(--erp-muted)]">الدور</span>

              <select
                value={targetRole}
                onChange={(event) =>
                  setTargetRole(event.target.value as NotificationTargetRole)
                }
                className="w-full rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-sm outline-none"
              >
                {NOTIFICATION_TARGET_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {targetRoleLabels[role]}
                  </option>
                ))}
              </select>

              {formErrors.targetRole && (
                <p className="mt-2 text-sm text-red-500">
                  {formErrors.targetRole}
                </p>
              )}
            </label>
          )}
        </div>

        {targetType === "USER" && (
          <div className="space-y-2">
            <NotificationUserPicker
              selectedUserIds={selectedUserIds}
              onChange={setSelectedUserIds}
            />

            <p className="text-sm text-[var(--erp-muted)]">
              عدد المستخدمين المحددين:{" "}
              <span dir="ltr" className="font-semibold">
                {toEnglishDigits(String(selectedUserIds.length))}
              </span>
            </p>

            {formErrors.userIds && (
              <p className="text-sm text-red-500">{formErrors.userIds}</p>
            )}
          </div>
        )}

        {errorMessage && (
          <p className="text-sm text-red-500">
            {toEnglishDigits(errorMessage)}
          </p>
        )}

        {successMessage && (
          <p className="text-sm text-green-600">
            {toEnglishDigits(successMessage)}
          </p>
        )}

        <Button type="submit" disabled={sendNotification.isPending}>
          {sendNotification.isPending ? "جاري الإرسال..." : "إرسال الإشعار"}
        </Button>
      </form>
    </section>
  )
}
