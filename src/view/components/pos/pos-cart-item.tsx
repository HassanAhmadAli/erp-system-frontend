import { Minus, Plus, Trash2 } from "lucide-react"

import { Button } from "@/view/components/ui/button"
import {
  formatCurrency,
  getProductPrice,
  toEnglishDigits,
} from "@/utils/number-formatters"
import type { CartItem } from "./types"

type PosCartItemProps = {
  item: CartItem
  onIncreaseQuantity: (productId: number) => void
  onDecreaseQuantity: (productId: number) => void
  onQuantityChange: (productId: number, quantity: number) => void
  onRemoveFromCart: (productId: number) => void
}

export function PosCartItem({
  item,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onQuantityChange,
  onRemoveFromCart,
}: PosCartItemProps) {
  const productPrice = getProductPrice(item.product)
  const itemTotal = productPrice * item.quantity
  const maxQuantity = item.product.quantityInStock

  function handleQuantityInputChange(value: string) {
    const englishValue = toEnglishDigits(value).replace(/\D/g, "")

    if (!englishValue) {
      return
    }

    const parsedQuantity = Number(englishValue)

    if (!Number.isFinite(parsedQuantity)) {
      return
    }

    const safeQuantity = Math.min(Math.max(parsedQuantity, 1), maxQuantity)

    onQuantityChange(item.product.id, safeQuantity)
  }

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

          <input
            value={String(item.quantity)}
            onChange={(event) => handleQuantityInputChange(event.target.value)}
            type="text"
            inputMode="numeric"
            dir="ltr"
            className="h-9 w-16 rounded-xl border border-[var(--erp-border)] bg-transparent text-center text-sm font-semibold text-[var(--erp-text)] outline-none focus:border-[var(--erp-accent)]"
            aria-label={`Quantity for ${item.product.name}`}
          />

          <Button
            size="sm"
            variant="outline"
            disabled={item.quantity >= maxQuantity}
            onClick={() => onIncreaseQuantity(item.product.id)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <p dir="ltr" className="text-left font-bold text-[var(--erp-text)]">
          {formatCurrency(itemTotal)}
        </p>
      </div>

      {item.quantity >= maxQuantity && (
        <p className="mt-2 text-xs text-amber-600">
          وصلت إلى الكمية المتوفرة في المخزون.
        </p>
      )}
    </div>
  )
}