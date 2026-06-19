import { Plus } from "lucide-react"

import type { PosProduct } from "@/services/pos-service"
import { Button } from "@/view/components/ui/button"
import {
  formatCurrency,
  formatId,
  formatNumber,
  toEnglishDigits,
} from "@/utils/number-formatters"

type PosProductCardProps = {
  product: PosProduct
  onAddToCart: (product: PosProduct) => void
}

export function PosProductCard({ product, onAddToCart }: PosProductCardProps) {
  const isOutOfStock = product.quantityInStock <= 0

  return (
    <article className="rounded-2xl border border-[var(--erp-border)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[var(--erp-text)]">
            {product.name}
          </h3>

          <p
            dir="ltr"
            className="mt-1 text-right text-xs text-[var(--erp-muted)]"
          >
            {product.barcode
              ? toEnglishDigits(product.barcode)
              : "لا يوجد باركود"}
          </p>
        </div>

        <span
          dir="ltr"
          className="rounded-full bg-[var(--erp-accent)]/10 px-3 py-1 text-xs font-medium text-[var(--erp-accent)]"
        >
          #{formatId(product.id)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--erp-muted)]">السعر</p>
          <p dir="ltr" className="text-left font-bold text-[var(--erp-text)]">
            {formatCurrency(product.sellingPrice)}
          </p>
        </div>

        <div className="text-left">
          <p className="text-xs text-[var(--erp-muted)]">المخزون</p>
          <p
            dir="ltr"
            className={
              isOutOfStock
                ? "font-bold text-red-500"
                : "font-bold text-[var(--erp-text)]"
            }
          >
            {formatNumber(product.quantityInStock)}
          </p>
        </div>
      </div>

      <Button
        className="mt-4 w-full"
        disabled={isOutOfStock}
        onClick={() => onAddToCart(product)}
      >
        <Plus className="h-4 w-4" />
        إضافة للسلة
      </Button>
    </article>
  )
}
