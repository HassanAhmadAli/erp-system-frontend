type Product = {
  name: string
  category: string
  sold: number
}

const products: Product[] = [
  { name: "حليب نيو بارك", category: "ألبان وأجبان", sold: 140 },
  { name: "خبز عربي", category: "مخبوزات", sold: 118 },
  { name: "أرز بسمتي", category: "مواد غذائية", sold: 96 },
]

export function TopProductsCard() {
  return (
    <section className="rounded-[20px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold">المنتجات الأكثر مبيعًا</h3>
        <span className="rounded-full bg-[var(--erp-bg)] px-3 py-1 text-xs font-medium text-[var(--erp-muted)]">
          هذا الأسبوع
        </span>
      </div>

      <div className="space-y-3">
        {products.map((product, index) => (
          <div
            key={`${product.name}-${index}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-3 transition-colors dark:bg-white/[0.04]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--erp-brand)] text-sm font-bold text-white">
                {index + 1}
              </div>

              <div className="min-w-0 text-right">
                <p className="truncate font-semibold text-[var(--erp-text)]">
                  {product.name}
                </p>
                <p className="truncate text-sm text-[var(--erp-muted)]">
                  {product.category}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-left">
              <p className="text-3xl leading-none font-bold text-[var(--erp-brand-solid)]">
                {product.sold}
              </p>
              <p className="mt-1 text-xs font-medium text-[var(--erp-muted)]">
                مبيع
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
