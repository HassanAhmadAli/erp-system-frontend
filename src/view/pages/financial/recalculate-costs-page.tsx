import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import { useRecalculateCosts } from "@/hooks/Financial/useFinancial"
import {
  recalculateCostsSchema,
  recalculateCostsValuesToPayload,
} from "@/validation/recalculate-costs-schema"
import { ReportLayout } from "@/view/components/reports/report-layout"
import { Button } from "@/view/components/ui/button"

export function RecalculateCostsPage() {
  const { t } = useTranslation(["common", "pages"])
  const [productIds, setProductIds] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [lastResult, setLastResult] = useState<Record<string, unknown> | null>(
    null
  )
  const recalculate = useRecalculateCosts()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage("")

    const validationResult = recalculateCostsSchema.safeParse({ productIds })

    if (!validationResult.success) {
      setErrorMessage(
        validationResult.error.issues[0]?.message ||
          t("financial.invalidProductIds", { ns: "pages" })
      )
      return
    }

    try {
      const result = await recalculate.mutateAsync(
        recalculateCostsValuesToPayload(validationResult.data)
      )
      setLastResult(result as Record<string, unknown>)
    } catch {
      setErrorMessage(t("financial.recalculateFailed", { ns: "pages" }))
    }
  }

  return (
    <ReportLayout
      title={t("financial.recalculate", { ns: "pages" })}
      description={t("financial.recalculateDescLong", { ns: "pages" })}
      backTo="/financial"
      backLabel={t("financial.title", { ns: "pages" })}
    >
      <section className="mx-auto max-w-xl space-y-6 rounded-[20px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
        <div className="text-start text-sm text-[var(--erp-muted)]">
          <p>{t("financial.enterProductIds", { ns: "pages" })}</p>
          <p className="mt-1">
            {t("financial.productIdsExample", { ns: "pages" })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="min-h-[100px] w-full rounded-xl border p-3 text-start"
            placeholder="1, 2, 3"
            value={productIds}
            onChange={(e) => setProductIds(e.target.value)}
          />

          {errorMessage && (
            <p className="rounded-xl bg-red-50 p-3 text-start text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <Button
            type="submit"
            disabled={recalculate.isPending}
            className="w-full"
          >
            {recalculate.isPending
              ? t("calculating")
              : t("financial.recalculate", { ns: "pages" })}
          </Button>
        </form>

        {lastResult && (
          <div className="flex items-start gap-3 rounded-xl bg-green-50 p-4 text-green-800">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            <div className="text-start text-sm">
              <p className="font-semibold">
                {t("financial.recalculateSuccess", { ns: "pages" })}
              </p>
              <pre className="mt-2 overflow-x-auto text-xs">
                {JSON.stringify(lastResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[20px] border border-dashed p-6 text-center text-sm text-[var(--erp-muted)]">
        <p className="font-medium text-[var(--erp-text)]">
          {t("financial.whenToUseTitle", { ns: "pages" })}
        </p>
        <p className="mt-2">{t("financial.whenToUseBody", { ns: "pages" })}</p>
      </section>
    </ReportLayout>
  )
}
