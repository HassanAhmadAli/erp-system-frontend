import { X } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { LiveNotificationToast } from "@/hooks/Notifications/useNotificationSocket"
import { cn } from "@/lib/utils"

const TYPE_CLASSES: Record<LiveNotificationToast["type"], string> = {
  info: "border-[var(--erp-border)] bg-[var(--erp-card)] text-[var(--erp-text)]",
  success:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
  warning:
    "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
  error:
    "border-red-500/20 bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  security:
    "border-red-500/20 bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300",
}

type NotificationLiveToastsProps = {
  toasts: LiveNotificationToast[]
  onDismiss: (id: string) => void
}

export function NotificationLiveToasts({
  toasts,
  onDismiss,
}: NotificationLiveToastsProps) {
  const { t } = useTranslation(["common", "pages"])

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed start-4 end-4 bottom-6 z-[60] flex max-w-sm flex-col gap-2 sm:start-auto sm:end-6 print:hidden">
      {toasts.map((toast) => {
        const title =
          toast.title.trim() ||
          t("notifications.liveFallbackTitle", { ns: "pages" })
        const message =
          toast.message.trim() ||
          t("notifications.liveFallbackBody", { ns: "pages" })

        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto w-full max-w-sm rounded-2xl border p-4 shadow-[var(--erp-shadow)]",
              TYPE_CLASSES[toast.type]
            )}
            role="status"
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm opacity-90">{message}</p>
              </div>
              <button
                type="button"
                aria-label={t("close")}
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg opacity-70 transition-opacity hover:opacity-100"
                onClick={() => onDismiss(toast.id)}
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
