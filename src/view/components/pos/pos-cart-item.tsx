import { Minus, Plus, Trash2 } from "lucide-react"

import { Button } from "@/view/components/ui/button"
import {
  formatCurrency,
  formatNumber,
  getProductPrice,
} from "@/utils/number-formatters"
import type { CartItem } from "./types"

type PosCartItemProps = {
  item: CartItem
  onIncreaseQuantity: (productId: number) => void
  onDecreaseQuantity: (productId: number) => void
  onRemoveFromCart: (productId: number) => void
}

export function PosCartItem({
  item,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveFromCart,
}: PosCartItemProps) {
  const productPrice = getProductPrice(item.product)
  const itemTotal = productPrice * item.quantity

  return (
    <div className="rounded-2xl border border-[var(--erp-border)] p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-[var(--erp-text)]">
            {item.product.name}
          </p>

          <p
            dir="ltr"
            className="mt-1 text-right text-xs text-[var(--erp-muted)]"
          >
            {formatCurrency(productPrice)}
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onRemoveFromCart(item.product.id)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDecreaseQuantity(item.product.id)}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <span
            dir="ltr"
            className="min-w-8 text-center font-semibold text-[var(--erp-text)]"
          >
            {formatNumber(item.quantity)}
          </span>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onIncreaseQuantity(item.product.id)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <p dir="ltr" className="text-left font-bold text-[var(--erp-text)]">
          {formatCurrency(itemTotal)}
        </p>
      </div>
    </div>
  )
}
