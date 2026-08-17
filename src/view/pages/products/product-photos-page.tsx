import { AlertTriangle, ArrowRight, ImageIcon } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"

import { toEnglishDigits } from "@/utils/number-formatters"
import { ProductPhotosPanel } from "@/view/components/products/product-photos-panel"
import { Button } from "@/view/components/ui/button"

export function ProductPhotosPage() {
  const { t } = useTranslation(["common", "pages"])
  const { id } = useParams()
  const navigate = useNavigate()

  const productId = Number(id)

  if (!id || Number.isNaN(productId) || productId <= 0) {
    return (
      <main className="space-y-6 text-[var(--erp-text)]">
        <section className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-6 text-start shadow-[var(--erp-shadow)] dark:bg-red-500/15">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-300" />

            <div>
              <h1 className="text-lg font-bold text-red-700 dark:text-red-300">
                {t("pages:products.invalidProductId")}
              </h1>

              <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/80">
                {t("pages:products.invalidProductPhotosHint")}
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/products")}
              >
                <ArrowRight className="size-4" />
                {t("pages:products.backToProducts")}
              </Button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="space-y-6 text-[var(--erp-text)]">
      <section className="flex flex-col gap-4 rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)] sm:flex-row sm:items-center sm:justify-between">
        <div className="text-start">
          <div className="flex items-center gap-2">
            <ImageIcon className="size-6 text-[var(--erp-accent)]" />

            <h1 className="text-2xl font-bold text-[var(--erp-text)]">
              {t("pages:products.managePhotos")}
            </h1>
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:products.managePhotosFor", {
              id: toEnglishDigits(String(productId)),
            })}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 sm:w-auto"
          onClick={() => navigate(`/products/${productId}`)}
        >
          <ArrowRight className="size-4" />
          {t("common:backToDetails")}
        </Button>
      </section>

      <ProductPhotosPanel productId={productId} />
    </main>
  )
}
