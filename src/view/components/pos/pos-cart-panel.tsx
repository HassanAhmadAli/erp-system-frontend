import { Loader2, Receipt, ShoppingCart } from "lucide-react"

import { Button } from "@/view/components/ui/button"
import { formatCurrency, toEnglishDigits } from "@/utils/number-formatters"
import { PosCustomerSelect } from "@/view/components/pos/pos-customer-select"
import type { PosCheckoutFormErrors } from "@/validation/pos-schema"
import type { CartItem } from "./types"
import { PosCartItem } from "./pos-cart-item"

type PosCartPanelProps = {
  cart: CartItem[]
  customerId: string
  amountPaid: string
  completeInvoice: boolean
  subtotal: number
  isCreatingInvoice: boolean
  isCreateInvoiceError: boolean
  isCreateInvoiceSuccess: boolean
  errors: PosCheckoutFormErrors
  onCustomerIdChange: (value: string) => void
  onAmountPaidChange: (value: string) => void
  onCompleteInvoiceChange: (value: boolean) => void
  onClearCart: () => void
  onCreateInvoice: () => void
  onIncreaseQuantity: (productId: number) => void
  onDecreaseQuantity: (productId: number) => void
  onQuantityChange: (productId: number, quantity: number) => void
  onRemoveFromCart: (productId: number) => void
}

export function PosCartPanel({
  cart,
  customerId,
  amountPaid,
  completeInvoice,
  subtotal,
  isCreatingInvoice,
  isCreateInvoiceError,
  isCreateInvoiceSuccess,
  errors,
  onCustomerIdChange,
  onAmountPaidChange,
  onCompleteInvoiceChange,
  onClearCart,
  onCreateInvoice,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onQuantityChange,
  onRemoveFromCart,
}: PosCartPanelProps) {
  return (
    <aside className="rounded-[24px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
      <div className="mb-5 flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-[var(--erp-accent)]" />
        <h2 className="text-lg font-semibold text-[var(--erp-text)]">
          سلة البيع
        </h2>
      </div>

      <div className="space-y-4">
        <PosCustomerSelect value={customerId} onChange={onCustomerIdChange} />
        {errors.customerId && (
          <p className="text-xs text-red-500 dark:text-red-300">
            {errors.customerId}
          </p>
        )}

        <div className="max-h-[340px] space-y-3 overflow-y-auto pr-1">
          {cart.length === 0 ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--erp-border)] text-center">
              <Receipt className="h-10 w-10 text-[var(--erp-muted)]" />

              <p className="mt-3 text-sm font-medium text-[var(--erp-text)]">
                السلة فارغة
              </p>

              <p className="mt-1 text-xs text-[var(--erp-muted)]">
                أضف منتجات من القائمة لإنشاء الفاتورة.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <PosCartItem
                key={item.product.id}
                item={item}
                onIncreaseQuantity={onIncreaseQuantity}
                onDecreaseQuantity={onDecreaseQuantity}
                onQuantityChange={onQuantityChange}
                onRemoveFromCart={onRemoveFromCart}
              />
            ))
          )}
        </div>
        {errors.cart && (
          <p className="text-xs text-red-500 dark:text-red-300">
            {errors.cart}
          </p>
        )}

        <div className="border-t border-[var(--erp-border)] pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--erp-muted)]">المجموع</span>

            <span
              dir="ltr"
              className="text-left font-bold text-[var(--erp-text)]"
            >
              {formatCurrency(subtotal)}
            </span>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm text-[var(--erp-muted)]">
              المبلغ المدفوع
            </span>

            <input
              value={amountPaid}
              onChange={(event) =>
                onAmountPaidChange(toEnglishDigits(event.target.value))
              }
              type="text"
              inputMode="decimal"
              dir="ltr"
              placeholder="Enter paid amount"
              className="w-full rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-3 text-left text-sm text-[var(--erp-text)] outline-none placeholder:text-[var(--erp-muted)]"
            />
            {errors.amountPaid && (
              <p className="mt-1 text-right text-xs text-red-500 dark:text-red-300">
                {errors.amountPaid}
              </p>
            )}
          </label>

          <label className="mt-4 flex items-center gap-2 text-sm text-[var(--erp-text)]">
            <input
              checked={completeInvoice}
              onChange={(event) =>
                onCompleteInvoiceChange(event.target.checked)
              }
              type="checkbox"
              className="h-4 w-4"
            />
            إتمام الفاتورة مباشرة
          </label>

          {isCreateInvoiceError && (
            <p className="mt-3 rounded-xl bg-red-500/10 p-3 text-sm text-red-500">
              حدث خطأ أثناء إنشاء الفاتورة.
            </p>
          )}

          {isCreateInvoiceSuccess && (
            <p className="mt-3 rounded-xl bg-green-500/10 p-3 text-sm text-green-600">
              تم إنشاء الفاتورة بنجاح.
            </p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              disabled={cart.length === 0 || isCreatingInvoice}
              onClick={onClearCart}
            >
              تفريغ السلة
            </Button>

            <Button
              disabled={isCreatingInvoice}
              onClick={onCreateInvoice}
            >
              {isCreatingInvoice ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Receipt className="h-4 w-4" />
              )}
              إنشاء الفاتورة
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}
