import { useTranslation } from "react-i18next"

import { Button } from "@/view/components/ui/button"

type ConfirmDialogProps = {
  open: boolean
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  isLoading = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const { t } = useTranslation("common")

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-[420px] rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <h2 id="confirm-dialog-title" className="mb-2 text-lg font-bold">
          {title ?? t("confirmDialog.title")}
        </h2>

        {description && (
          <p className="mb-6 text-sm leading-6 text-[var(--erp-muted)]">
            {description}
          </p>
        )}

        {!description && <div className="mb-6" />}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel ?? t("cancel")}
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading
              ? t("confirmDialog.processing")
              : (confirmLabel ?? t("delete"))}
          </Button>
        </div>
      </div>
    </div>
  )
}
