import { AlertTriangle, ArrowRight, Pencil } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate, useParams } from "react-router-dom"

import { useProductById } from "@/hooks/Products/useProductById"
import { toEnglishDigits } from "@/utils/number-formatters"
import { ProductForm } from "@/view/components/products/product-form"
import { ProductPhotosPanel } from "@/view/components/products/product-photos-panel"
import { Button } from "@/view/components/ui/button"

export function EditProductPage() {
  const { t } = useTranslation(["common", "pages"])
  const { id } = useParams()
  const navigate = useNavigate()

  const productId = id ? Number(id) : null
  const isValidProductId =
    productId !== null && Number.isFinite(productId) && productId > 0

  const { data, isLoading, error } = useProductById(
    isValidProductId ? productId : null
  )

  if (!isValidProductId) {
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
                {t("pages:products.invalidProductEditHint")}
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-4 gap-2"
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

  if (isLoading) {
    return (
      <main className="space-y-6 text-[var(--erp-text)]">
        <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-center shadow-[var(--erp-shadow)]">
          <p className="text-sm text-[var(--erp-muted)]">
            {t("pages:products.loadingProduct")}
          </p>
        </section>
      </main>
    )
  }

  if (!data || error) {
    return (
      <main className="space-y-6 text-[var(--erp-text)]">
        <section className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-6 text-start shadow-[var(--erp-shadow)] dark:bg-red-500/15">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-300" />

            <div>
              <h1 className="text-lg font-bold text-red-700 dark:text-red-300">
                {t("pages:products.loadFailed")}
              </h1>

              <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/80">
                {t("pages:products.loadFailedHint")}
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-4 gap-2"
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
            <Pencil className="size-6 text-[var(--erp-accent)]" />

            <h1 className="text-2xl font-bold text-[var(--erp-text)]">
              {t("pages:products.edit")}
            </h1>
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:products.editSubtitle")}
          </p>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:products.productNumber")}:{" "}
            <span dir="ltr" className="inline-block font-semibold">
              #{toEnglishDigits(String(data.id))}
            </span>
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 sm:w-auto"
            onClick={() => navigate(`/products/${data.id}`)}
          >
            <ArrowRight className="size-4" />
            {t("common:backToDetails")}
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="text-start">
          <h2 className="text-lg font-bold text-[var(--erp-text)]">
            {t("pages:products.editDataTitle")}
          </h2>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:products.editDataSubtitle")}
          </p>
        </div>

        <ProductForm
          mode="edit"
          productId={data.id}
          initialValues={data}
          onSuccess={() => {
            navigate(`/products/${data.id}`, { replace: true })
          }}
        />
      </section>

      <ProductPhotosPanel productId={data.id} />
    </main>
  )
}
