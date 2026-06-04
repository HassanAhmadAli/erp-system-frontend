import { StatusBadge } from "@/view/components/common/status-badge"
import { useLowStockProducts } from "@/hooks/Products/useLowStockProducts"
import type { Product } from "@/services/product-service"

type StockStatus = "متوفر" | "منخفض" | "نافد"

function getStockStatus(p: Product): StockStatus {
  const qty = p.quantityInStock ?? 0
  const min = p.minQuantity ?? 0

  if (qty <= 0) return "نافد"
  if (min > 0 && qty <= min) return "منخفض"
  return "متوفر"
}

export function ProductsTable() {
  const { data, isLoading, error } = useLowStockProducts()

  return (
    <section className="rounded-[20px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
      <h3 className="mb-4 text-right text-xl font-bold">المنتجات</h3>
      {isLoading && (
        <p className="text-right text-sm text-[var(--erp-muted)]">
          جاري التحميل...
        </p>
      )}

      {error && (
        <p className="rounded-xl bg-red-100 p-3 text-right text-sm text-red-700">
          حدث خطأ أثناء تحميل المنتجات منخفضة المخزون
        </p>
      )}

      {!isLoading && !error && data && (
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2 px-4 text-sm text-[var(--erp-muted)]">
            <span className="text-right">المنتج</span>
            <span className="text-right">التصنيف</span>
            <span className="text-right">السعر</span>
            <span className="text-right">الكمية</span>
            <span className="text-right">الحالة</span>
          </div>

          {data.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-5 items-center gap-2 rounded-2xl bg-[#f1eefc] px-4 py-3"
            >
              <div className="flex items-center justify-end gap-3">
                <div className="size-10 rounded-xl bg-[var(--erp-brand)]" />
                <span className="font-semibold">{p.name}</span>
              </div>
              <span>{p.category?.name ?? p.categoryId ?? "-"}</span>
              <span>{p.sellingPrice ?? "-"}</span>
              <span>{p.quantityInStock ?? 0}</span>
              <StatusBadge status={getStockStatus(p)} />
            </div>
          ))}

          {data.length === 0 && (
            <p className="text-right text-sm text-[var(--erp-muted)]">
              لا توجد منتجات منخفضة المخزون حالياً
            </p>
          )}
        </div>
      )}
    </section>
  )
}
