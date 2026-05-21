type Product = {
  name: string
  category: string
  sold: number
}

const products: Product[] = [
  { name: "حليب نيو بارك", category: "ألبان وأجبان", sold: 140 },
  { name: "حليب نيو بارك", category: "ألبان وأجبان", sold: 140 },
  { name: "حليب نيو بارك", category: "ألبان وأجبان", sold: 140 },
]

export function TopProductsCard() {
  return (
    <section className="rounded-[20px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
      <h3 className="mb-4 text-xl font-bold">المنتجات الأكثر مبيعًا</h3>
      <div className="space-y-3">
        {products.map((product, index) => (
          <div
            key={`${product.name}-${index}`}
            className="flex items-center justify-between rounded-2xl bg-[#f1eefc] p-3"
          >
            <div className="size-12 rounded-xl bg-[var(--erp-brand)]" />
            <div className="text-right">
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-[var(--erp-muted)]">
                {product.category}
              </p>
            </div>
            <p className="text-4xl leading-none font-bold">{product.sold}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
