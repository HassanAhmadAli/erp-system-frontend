import { StatusBadge } from "@/view/components/common/status-badge"

type ProductRow = {
  name: string
  category: string
  price: string
  quantity: string
  status: "متوفر" | "منخفض" | "نافد"
}

const products: ProductRow[] = [
  {
    name: "حليب نيو بارك",
    category: "ألبان وأجبان",
    price: "100 sp",
    quantity: "30 pcs",
    status: "متوفر",
  },
  {
    name: "حليب هوى الشام",
    category: "ألبان وأجبان",
    price: "95 sp",
    quantity: "9 pcs",
    status: "منخفض",
  },
]

export function ProductsTable() {
  return (
    <section className="rounded-[20px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
      <h3 className="mb-4 text-right text-xl font-bold">المنتجات</h3>
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        {["الكل", "غذائيات", "مشروبات", "ألبان وأجبان"].map((tab, index) => (
          <button
            key={tab}
            className={`rounded-full px-4 py-1 text-sm ${
              index === 0
                ? "bg-[var(--erp-brand)] text-white"
                : "bg-[#ece8fb] text-[var(--erp-muted)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-2 px-4 text-sm text-[var(--erp-muted)]">
          <span className="text-right">المنتج</span>
          <span className="text-right">التصنيف</span>
          <span className="text-right">السعر</span>
          <span className="text-right">الكمية</span>
          <span className="text-right">الحالة</span>
        </div>
        {products.map((row) => (
          <div
            key={row.name}
            className="grid grid-cols-5 items-center gap-2 rounded-2xl bg-[#f1eefc] px-4 py-3"
          >
            <div className="flex items-center justify-end gap-3">
              <div className="size-10 rounded-xl bg-[var(--erp-brand)]" />
              <span className="font-semibold">{row.name}</span>
            </div>
            <span>{row.category}</span>
            <span>{row.price}</span>
            <span>{row.quantity}</span>
            <StatusBadge status={row.status} />
          </div>
        ))}
      </div>
    </section>
  )
}
