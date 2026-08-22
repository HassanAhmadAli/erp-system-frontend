import { Download, Loader2, Printer } from "lucide-react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

type InvoiceIoButtonsProps = {
  onPrint?: () => void
  onExport?: () => void
  printLabel?: string
  exportLabel?: string
  isPrinting?: boolean
  isExporting?: boolean
  disabled?: boolean
  className?: string
}

const buttonClass =
  "inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)] disabled:cursor-not-allowed disabled:opacity-60"

export function InvoiceIoButtons({
  onPrint,
  onExport,
  printLabel,
  exportLabel,
  isPrinting = false,
  isExporting = false,
  disabled = false,
  className,
}: InvoiceIoButtonsProps) {
  const { t } = useTranslation("common")

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 print:hidden",
        className
      )}
    >
      {onPrint ? (
        <button
          type="button"
          className={buttonClass}
          disabled={disabled || isPrinting}
          onClick={onPrint}
        >
          {isPrinting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Printer className="size-4" />
          )}
          {printLabel ?? t("print")}
        </button>
      ) : null}

      {onExport ? (
        <button
          type="button"
          className={buttonClass}
          disabled={disabled || isExporting}
          onClick={onExport}
        >
          {isExporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {exportLabel ?? t("exportCsv")}
        </button>
      ) : null}
    </div>
  )
}
