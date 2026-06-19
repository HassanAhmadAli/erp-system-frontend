import { useMemo, useState } from "react"

import { useCreateSaleInvoice, usePosProducts } from "@/hooks/usePos"
import type { PosProduct } from "@/services/pos-service"
import {
  formatCurrency,
  getProductPrice,
  toEnglishDigits,
} from "@/utils/number-formatters"
import { PosCartPanel } from "@/view/components/pos/pos-cart-panel"
import { PosProductsSection } from "@/view/components/pos/pos-products-section"
import type { CartItem } from "@/view/components/pos/types"

export function PosPage() {
  const [search, setSearch] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [amountPaid, setAmountPaid] = useState("")
  const [completeInvoice, setCompleteInvoice] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])

  const productsQuery = usePosProducts()
  const createInvoiceMutation = useCreateSaleInvoice()

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data])

  const filteredProducts = useMemo(() => {
    const searchValue = toEnglishDigits(search).trim().toLowerCase()

    if (!searchValue) {
      return products
    }

    return products.filter((product) => {
      const name = product.name.toLowerCase()
      const barcode = toEnglishDigits(product.barcode ?? "").toLowerCase()
      const id = String(product.id)

      return (
        name.includes(searchValue) ||
        barcode.includes(searchValue) ||
        id.includes(searchValue)
      )
    })
  }, [products, search])

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      return total + getProductPrice(item.product) * item.quantity
    }, 0)
  }, [cart])

  function addToCart(product: PosProduct) {
    if (product.quantityInStock <= 0) {
      return
    }

    setCart((previous) => {
      const existingItem = previous.find(
        (item) => item.product.id === product.id
      )

      if (!existingItem) {
        return [...previous, { product, quantity: 1 }]
      }

      if (existingItem.quantity >= product.quantityInStock) {
        return previous
      }

      return previous.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    })
  }

  function decreaseQuantity(productId: number) {
    setCart((previous) =>
      previous
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  function increaseQuantity(productId: number) {
    setCart((previous) =>
      previous.map((item) => {
        if (item.product.id !== productId) {
          return item
        }

        if (item.quantity >= item.product.quantityInStock) {
          return item
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        }
      })
    )
  }

  function removeFromCart(productId: number) {
    setCart((previous) =>
      previous.filter((item) => item.product.id !== productId)
    )
  }

  function clearCart() {
    setCart([])
    setAmountPaid("")
  }

  function handleCreateInvoice() {
    const parsedCustomerId = Number(toEnglishDigits(customerId))
    const parsedAmountPaid = Number(toEnglishDigits(amountPaid))

    if (!parsedCustomerId || Number.isNaN(parsedCustomerId)) {
      alert("يرجى اختيار العميل.")
      return
    }

    if (cart.length === 0) {
      alert("يرجى إضافة منتج واحد على الأقل إلى السلة.")
      return
    }

    if (Number.isNaN(parsedAmountPaid) || parsedAmountPaid < 0) {
      alert("يرجى إدخال مبلغ مدفوع صحيح.")
      return
    }

    if (completeInvoice && parsedAmountPaid < subtotal) {
      alert("المبلغ المدفوع يجب أن يكون أكبر من أو يساوي إجمالي الفاتورة.")
      return
    }

    createInvoiceMutation.reset()

    createInvoiceMutation.mutate(
      {
        customerId: parsedCustomerId,
        discountId: null,
        amountPaid: parsedAmountPaid,
        complete: completeInvoice,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      },
      {
        onSuccess: () => {
          clearCart()
          setCustomerId("")
          setCompleteInvoice(true)
        },
      }
    )
  }

  return (
    <main className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--erp-text)]">
            نقطة البيع
          </h1>
          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            إنشاء فاتورة بيع من المنتجات المتوفرة في المخزون.
          </p>
        </div>

        <div className="rounded-2xl bg-[var(--erp-card)] px-5 py-3 shadow-[var(--erp-shadow)]">
          <p className="text-sm text-[var(--erp-muted)]">إجمالي السلة</p>
          <p
            dir="ltr"
            className="mt-1 text-left text-xl font-bold text-[var(--erp-text)]"
          >
            {formatCurrency(subtotal)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <PosProductsSection
          search={search}
          products={filteredProducts}
          isLoading={productsQuery.isLoading}
          isError={productsQuery.isError}
          onSearchChange={setSearch}
          onAddToCart={addToCart}
        />

        <PosCartPanel
          cart={cart}
          customerId={customerId}
          amountPaid={amountPaid}
          completeInvoice={completeInvoice}
          subtotal={subtotal}
          isCreatingInvoice={createInvoiceMutation.isPending}
          isCreateInvoiceError={createInvoiceMutation.isError}
          isCreateInvoiceSuccess={createInvoiceMutation.isSuccess}
          onCustomerIdChange={setCustomerId}
          onAmountPaidChange={setAmountPaid}
          onCompleteInvoiceChange={setCompleteInvoice}
          onClearCart={clearCart}
          onCreateInvoice={handleCreateInvoice}
          onIncreaseQuantity={increaseQuantity}
          onDecreaseQuantity={decreaseQuantity}
          onRemoveFromCart={removeFromCart}
        />
      </div>
    </main>
  )
}
