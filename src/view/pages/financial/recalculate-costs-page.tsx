import { useState } from "react"
import { CheckCircle2 } from "lucide-react"

import { useRecalculateCosts } from "@/hooks/Financial/useFinancial"
import {
  recalculateCostsSchema,
  recalculateCostsValuesToPayload,
} from "@/validation/recalculate-costs-schema"
import { ReportLayout } from "@/view/components/reports/report-layout"
import { Button } from "@/view/components/ui/button"

export function RecalculateCostsPage() {
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
          "أدخل معرفات منتجات صحيحة مفصولة بفواصل"
      )
      return
    }

    try {
      const result = await recalculate.mutateAsync(
        recalculateCostsValuesToPayload(validationResult.data)
      )
      setLastResult(result as Record<string, unknown>)
    } catch {
      setErrorMessage("فشل إعادة حساب التكاليف")
    }
  }

  return (
    <ReportLayout
      title="إعادة حساب التكاليف"
      description="تحديث تكاليف المنتجات بعد تغيّر أسعار الشراء أو التوريد"
      backTo="/financial"
      backLabel="التحليل المالي"
    >
      <section className="mx-auto max-w-xl space-y-6 rounded-[20px] bg-[var(--erp-card)] p-6 shadow-[var(--erp-shadow)]">
        <div className="text-right text-sm text-[var(--erp-muted)]">
          <p>أدخل معرفات المنتجات التي تريد إعادة حساب تكاليفها.</p>
          <p className="mt-1">مثال: 1, 2, 5</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="min-h-[100px] w-full rounded-xl border p-3 text-right"
            placeholder="1, 2, 3"
            value={productIds}
            onChange={(e) => setProductIds(e.target.value)}
          />

          {errorMessage && (
            <p className="rounded-xl bg-red-50 p-3 text-right text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <Button
            type="submit"
            disabled={recalculate.isPending}
            className="w-full"
          >
            {recalculate.isPending ? "جاري الحساب..." : "إعادة حساب التكاليف"}
          </Button>
        </form>

        {lastResult && (
          <div className="flex items-start gap-3 rounded-xl bg-green-50 p-4 text-green-800">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
            <div className="text-right text-sm">
              <p className="font-semibold">تمت العملية بنجاح</p>
              <pre className="mt-2 overflow-x-auto text-xs">
                {JSON.stringify(lastResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[20px] border border-dashed p-6 text-center text-sm text-[var(--erp-muted)]">
        <p className="font-medium text-[var(--erp-text)]">
          متى تستخدم هذه الأداة؟
        </p>
        <p className="mt-2">
          بعد استلام فواتير شراء جديدة أو تعديل أسعار الموردين، استخدم إعادة
          الحساب لتحديث تكلفة المنتجات وبالتالي هوامش الربح في التقارير.
        </p>
      </section>
    </ReportLayout>
  )
}
