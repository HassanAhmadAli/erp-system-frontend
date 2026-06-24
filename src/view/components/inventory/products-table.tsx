import { StatusBadge } from "@/view/components/common/status-badge"
import { useLowStockProducts } from "@/hooks/Products/useLowStockProducts"
import type { Product } from "@/services/product-service"
import { formatCurrency, formatNumber } from "@/utils/number-formatters"

type StockStatus = "متوفر" | "منخفض" | "نافد"

function getStockStatus(product: Product): StockStatus {
  const quantity = product.quantityInStock ?? 0
  const minimumQuantity = product.minQuantity ?? 0

  if (quantity <= 0) return "نافد"
  if (minimumQuantity > 0 && quantity <= minimumQuantity) return "منخفض"

  return "متوفر"
}

function getCategoryName(product: Product) {
  return product.category?.name ?? product.categoryId ?? "-"
}

export function ProductsTable() {
  const { data, isLoading, error } = useLowStockProducts()

  return (
    <section className="rounded-[20px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="mb-4 text-right">
        <h3 className="text-xl font-bold text-[var(--erp-text)]">المنتجات</h3>

        <p className="mt-1 text-sm text-[var(--erp-muted)]">
          المنتجات منخفضة المخزون أو التي تحتاج إلى متابعة.
        </p>
      </div>

      {isLoading && (
        <p className="text-right text-sm text-[var(--erp-muted)]">
          جاري التحميل...
        </p>
      )}

      {error && (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-right text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
          حدث خطأ أثناء تحميل المنتجات منخفضة المخزون
        </p>
      )}

      {!isLoading && !error && data && (
        <div className="overflow-hidden rounded-2xl border border-[var(--erp-border)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed text-right text-sm">
              <colgroup>
                <col className="w-[34%]" />
                <col className="w-[22%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
              </colgroup>

              <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">المنتج</th>
                  <th className="px-4 py-3 font-medium">التصنيف</th>
                  <th className="px-4 py-3 text-center font-medium">السعر</th>
                  <th className="px-4 py-3 text-center font-medium">الكمية</th>
                  <th className="px-4 py-3 text-center font-medium">الحالة</th>
                </tr>
              </thead>

              <tbody>
                {data.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-[var(--erp-border)] bg-[var(--erp-card)] text-[var(--erp-text)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)] dark:bg-white/[0.02] dark:hover:bg-white/[0.05]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex min-w-0 items-center justify-end gap-3">
                        <span className="truncate font-semibold text-[var(--erp-text)]">
                          {product.name}
                        </span>

                        <div className="size-10 shrink-0 rounded-xl bg-[var(--erp-brand)]" />
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="block truncate text-[var(--erp-muted)]">
                        {getCategoryName(product)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center font-medium text-[var(--erp-text)]">
                      {product.sellingPrice
                        ? formatCurrency(product.sellingPrice)
                        : "-"}
                    </td>

                    <td className="px-4 py-3 text-center font-medium text-[var(--erp-text)]">
                      {formatNumber(product.quantityInStock ?? 0)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <StatusBadge status={getStockStatus(product)} />
                      </div>
                    </td>
                  </tr>
                ))}

                {data.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-[var(--erp-muted)]"
                    >
                      لا توجد منتجات منخفضة المخزون حالياً
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
