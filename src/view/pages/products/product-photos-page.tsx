import { AlertTriangle, ArrowRight, ImageIcon } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { toEnglishDigits } from "@/utils/number-formatters"
import { ProductPhotosPanel } from "@/view/components/products/product-photos-panel"
import { Button } from "@/view/components/ui/button"

export function ProductPhotosPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const productId = Number(id)

  if (!id || Number.isNaN(productId) || productId <= 0) {
    return (
      <main className="space-y-6 text-[var(--erp-text)]" dir="rtl">
        <section className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-6 text-right shadow-[var(--erp-shadow)] dark:bg-red-500/15">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-300" />

            <div>
              <h1 className="text-lg font-bold text-red-700 dark:text-red-300">
                معرف المنتج غير صالح
              </h1>

              <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/80">
                لا يمكن فتح صفحة الصور لأن رقم المنتج غير صحيح.
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/products")}
              >
                <ArrowRight className="size-4" />
                رجوع للمنتجات
              </Button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="space-y-6 text-[var(--erp-text)]" dir="rtl">
      <section className="flex flex-col gap-4 rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)] sm:flex-row sm:items-center sm:justify-between">
        <div className="text-right">
          <div className="flex items-center gap-2">
            <ImageIcon className="size-6 text-[var(--erp-accent)]" />

            <h1 className="text-2xl font-bold text-[var(--erp-text)]">
              إدارة صور المنتج
            </h1>
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            إضافة وتعديل صور المنتج رقم{" "}
            <span dir="ltr" className="inline-block font-semibold">
              #{toEnglishDigits(String(productId))}
            </span>
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 sm:w-auto"
          onClick={() => navigate(`/products/${productId}`)}
        >
          <ArrowRight className="size-4" />
          رجوع للتفاصيل
        </Button>
      </section>

      <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-4 shadow-[var(--erp-shadow)] sm:p-5">
        <ProductPhotosPanel productId={productId} />
      </section>
    </main>
  )
}