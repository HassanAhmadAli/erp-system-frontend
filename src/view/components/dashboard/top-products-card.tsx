import { useTranslation } from "react-i18next"

type Product = {
  nameKey: "milk" | "bread" | "rice"
  sold: number
}

const products: Product[] = [
  { nameKey: "milk", sold: 140 },
  { nameKey: "bread", sold: 118 },
  { nameKey: "rice", sold: 96 },
]

export function TopProductsCard() {
  const { t } = useTranslation(["common", "pages"])

  return (
    <section className="rounded-[20px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold">
          {t("overview.topProducts", { ns: "pages" })}
        </h3>
        <span className="rounded-full bg-[var(--erp-bg)] px-3 py-1 text-xs font-medium text-[var(--erp-muted)]">
          {t("overview.thisWeek", { ns: "pages" })}
        </span>
      </div>

      <div className="space-y-3">
        {products.map((product, index) => (
          <div
            key={product.nameKey}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-3 transition-colors dark:bg-white/[0.04]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--erp-brand)] text-sm font-bold text-white">
                {index + 1}
              </div>

              <div className="min-w-0 text-start">
                <p className="truncate font-semibold text-[var(--erp-text)]">
                  {t(`overview.demoProducts.${product.nameKey}.name`, {
                    ns: "pages",
                  })}
                </p>
                <p className="truncate text-sm text-[var(--erp-muted)]">
                  {t(`overview.demoProducts.${product.nameKey}.category`, {
                    ns: "pages",
                  })}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-left">
              <p className="text-3xl leading-none font-bold text-[var(--erp-brand-solid)]">
                {product.sold}
              </p>
              <p className="mt-1 text-xs font-medium text-[var(--erp-muted)]">
                {t("overview.sold", { ns: "pages" })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
