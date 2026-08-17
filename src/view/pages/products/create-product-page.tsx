import { ArrowRight, PackagePlus } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { ProductForm } from "@/view/components/products/product-form"
import { Button } from "@/view/components/ui/button"

export function CreateProductPage() {
  const { t } = useTranslation(["common", "pages"])
  const navigate = useNavigate()

  return (
    <main className="space-y-6 text-[var(--erp-text)]">
      <section className="flex flex-col gap-4 rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)] sm:flex-row sm:items-center sm:justify-between">
        <div className="text-start">
          <div className="flex items-center gap-2">
            <PackagePlus className="size-6 text-[var(--erp-accent)]" />

            <h1 className="text-2xl font-bold text-[var(--erp-text)]">
              {t("pages:products.create")}
            </h1>
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("pages:products.createSubtitle")}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 sm:w-auto"
          onClick={() => navigate("/products")}
        >
          <ArrowRight className="size-4" />
          {t("pages:products.backToProducts")}
        </Button>
      </section>

      <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-4 shadow-[var(--erp-shadow)] sm:p-5">
        <ProductForm
          mode="create"
          onSuccess={() => {
            navigate("/products", { replace: true })
          }}
        />
      </section>
    </main>
  )
}
