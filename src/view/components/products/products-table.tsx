import { useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  PackageOpen,
  Pencil,
  Search,
  Trash2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import { useCategoriesForSelect } from "@/hooks/Categories/useCategoriesForSelect"
import { useDeleteProduct } from "@/hooks/Products/useDeleteProduct"
import { useLowStockProducts } from "@/hooks/Products/useLowStockProducts"
import { useProducts } from "@/hooks/Products/useProducts"
import { useProductsByCategory } from "@/hooks/Products/useProductsByCategory"
import { useProductsBySupplier } from "@/hooks/Products/useProductsBySupplier"
import { useSuppliers } from "@/hooks/Suppliers/useSuppliers"
import { normalizeProducts, type Product } from "@/services/product-service"
import {
  formatCurrency,
  formatInteger,
  toEnglishDigits,
} from "@/utils/number-formatters"
import { StatusBadge } from "@/view/components/common/status-badge"
import { Button } from "@/view/components/ui/button"
import { ConfirmDialog } from "@/view/components/ui/confirm-dialog"
import { ProductsSkeleton } from "./products-skeleton"

type ProductStatus = "متوفر" | "منخفض" | "نافد"
type ProductFilterType = "all" | "low-stock" | "category" | "supplier"

const PAGE_SIZE = 10

function getProductStatus(product: Product): ProductStatus {
  const quantity = product.quantityInStock ?? 0
  const minQuantity = product.minQuantity ?? 0

  if (quantity <= 0) return "نافد"
  if (minQuantity > 0 && quantity <= minQuantity) return "منخفض"

  return "متوفر"
}

function getProductCategory(product: Product) {
  if (product.category?.name) {
    return product.category.name
  }

  if (product.categoryId) {
    return `#${formatInteger(product.categoryId)}`
  }

  return "-"
}

function getProductSupplier(product: Product) {
  if (product.supplier?.fullName) {
    return product.supplier.fullName
  }

  if (product.supplierId) {
    return `#${formatInteger(product.supplierId)}`
  }

  return "-"
}

function getProductQuantity(product: Product) {
  const quantity = formatInteger(product.quantityInStock ?? 0)

  if (!product.minQuantity) {
    return quantity
  }

  return `${quantity} / ${formatInteger(product.minQuantity)}`
}

function ProductActions({
  product,
  onDelete,
}: {
  product: Product
  onDelete: () => void
}) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={() => navigate(`/products/${product.id}`)}
      >
        <Eye className="size-4" />
        التفاصيل
      </Button>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => navigate(`/products/${product.id}/edit`)}
        title="تعديل المنتج"
      >
        <Pencil className="size-4" />
      </Button>

      <Button
        type="button"
        variant="destructive"
        size="icon-sm"
        onClick={onDelete}
        title="حذف المنتج"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}

function ProductMobileCard({
  product,
  onDelete,
}: {
  product: Product
  onDelete: () => void
}) {
  return (
    <article className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 text-right">
          <h3 className="line-clamp-2 font-semibold leading-6 text-[var(--erp-text)]">
            {product.name}
          </h3>

          <p dir="ltr" className="mt-1 text-left text-xs text-[var(--erp-muted)]">
            {toEnglishDigits(product.barcode)}
          </p>
        </div>

        <StatusBadge status={getProductStatus(product)} />
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl bg-[var(--erp-bg)] p-3 text-sm">
        <InfoRow label="التصنيف" value={getProductCategory(product)} />
        <InfoRow label="المورد" value={getProductSupplier(product)} />
        <InfoRow
          label="السعر"
          value={formatCurrency(product.sellingPrice ?? 0)}
          ltr
        />
        <InfoRow label="الكمية" value={getProductQuantity(product)} ltr />
      </div>

      <div className="mt-4">
        <ProductActions product={product} onDelete={onDelete} />
      </div>
    </article>
  )
}

function InfoRow({
  label,
  value,
  ltr = false,
}: {
  label: string
  value: string
  ltr?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[var(--erp-muted)]">{label}</span>

      <span
        dir={ltr ? "ltr" : "rtl"}
        className={`font-medium text-[var(--erp-text)] ${
          ltr ? "text-left tabular-nums" : "text-right"
        }`}
      >
        {value}
      </span>
    </div>
  )
}

export function ProductsTable() {
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<ProductFilterType>("all")
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [supplierId, setSupplierId] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useProducts()
  const { data: lowStockData, isLoading: isLoadingLowStock } =
    useLowStockProducts()
  const { data: categoryData, isLoading: isLoadingCategory } =
    useProductsByCategory(categoryId ?? 0)
  const { data: supplierData, isLoading: isLoadingSupplier } =
    useProductsBySupplier(supplierId ?? 0)
  const { data: categoriesData } = useCategoriesForSelect()
  const { data: suppliersData } = useSuppliers()
  const deleteMutation = useDeleteProduct()

  const categories = categoriesData?.data ?? []
  const suppliers = suppliersData?.data ?? []

  const products = useMemo(() => {
    let filteredProducts: Product[] = []

    switch (filterType) {
      case "low-stock":
        filteredProducts = normalizeProducts(lowStockData)
        break

      case "category":
        filteredProducts = categoryId ? normalizeProducts(categoryData) : []
        break

      case "supplier":
        filteredProducts = supplierId ? normalizeProducts(supplierData) : []
        break

      default:
        filteredProducts = normalizeProducts(data)
    }

    const query = toEnglishDigits(searchQuery).trim().toLowerCase()

    if (!query) {
      return filteredProducts
    }

    return filteredProducts.filter((product) => {
      const name = product.name.toLowerCase()
      const barcode = toEnglishDigits(product.barcode).toLowerCase()
      const productId = String(product.id)

      return (
        name.includes(query) ||
        barcode.includes(query) ||
        productId.includes(query)
      )
    })
  }, [
    data,
    lowStockData,
    categoryData,
    supplierData,
    filterType,
    categoryId,
    supplierId,
    searchQuery,
  ])

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedProducts = products.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const selectedProduct = products.find((product) => product.id === deleteId)

  const isLoadingData =
    isLoading ||
    (filterType === "low-stock" && isLoadingLowStock) ||
    (filterType === "category" && categoryId !== null && isLoadingCategory) ||
    (filterType === "supplier" && supplierId !== null && isLoadingSupplier)

  function handleSearchChange(value: string) {
    setSearchQuery(toEnglishDigits(value))
    setPage(1)
  }

  function handleFilterChange(nextFilter: ProductFilterType) {
    setFilterType(nextFilter)
    setPage(1)

    if (nextFilter !== "category") {
      setCategoryId(null)
    }

    if (nextFilter !== "supplier") {
      setSupplierId(null)
    }
  }

  function handleCategoryChange(value: string) {
    setCategoryId(value ? Number(value) : null)
    setPage(1)
  }

  function handleSupplierChange(value: string) {
    setSupplierId(value ? Number(value) : null)
    setPage(1)
  }

  function confirmDelete() {
    if (!deleteId) return

    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        setDeleteId(null)
      },
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <label className="relative block">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[var(--erp-muted)]" />

          <input
            type="search"
            placeholder="بحث بالاسم أو الباركود أو رقم المنتج..."
            value={searchQuery}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="w-full rounded-2xl border border-[var(--erp-border)] bg-transparent py-2.5 ps-10 pe-4 text-right text-sm text-[var(--erp-text)] outline-none transition focus:border-[var(--erp-accent)]"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={filterType === "all"}
            onClick={() => handleFilterChange("all")}
          >
            الكل
          </FilterButton>

          <FilterButton
            active={filterType === "low-stock"}
            onClick={() => handleFilterChange("low-stock")}
          >
            المخزون المنخفض
          </FilterButton>

          <FilterButton
            active={filterType === "category"}
            onClick={() => handleFilterChange("category")}
          >
            حسب التصنيف
          </FilterButton>

          <FilterButton
            active={filterType === "supplier"}
            onClick={() => handleFilterChange("supplier")}
          >
            حسب المورد
          </FilterButton>
        </div>
      </div>

      {filterType === "category" && (
        <div className="grid gap-2 sm:max-w-sm">
          <label className="text-sm font-medium text-[var(--erp-muted)]">
            التصنيف
          </label>

          <select
            value={categoryId ?? ""}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-2.5 text-sm text-[var(--erp-text)] outline-none"
          >
            <option value="">اختر التصنيف</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {filterType === "supplier" && (
        <div className="grid gap-2 sm:max-w-sm">
          <label className="text-sm font-medium text-[var(--erp-muted)]">
            المورد
          </label>

          <select
            value={supplierId ?? ""}
            onChange={(event) => handleSupplierChange(event.target.value)}
            className="rounded-2xl border border-[var(--erp-border)] bg-transparent px-4 py-2.5 text-sm text-[var(--erp-text)] outline-none"
          >
            <option value="">اختر المورد</option>

            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.fullName}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoadingData && (
        <div className="rounded-2xl border border-[var(--erp-border)] p-4">
          <ProductsSkeleton />
        </div>
      )}

      {!isLoadingData && error && (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
          حدث خطأ أثناء تحميل المنتجات
        </p>
      )}

      {!isLoadingData && !error && products.length === 0 && (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--erp-border)] p-8 text-center">
          <PackageOpen className="size-12 text-[var(--erp-muted)]" />

          <h3 className="mt-4 text-lg font-semibold text-[var(--erp-text)]">
            لا توجد منتجات
          </h3>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            جرّب تغيير البحث أو الفلاتر، أو أضف منتج جديد.
          </p>

          <Button
            type="button"
            className="mt-4"
            onClick={() => navigate("/products/create")}
          >
            إضافة منتج
          </Button>
        </div>
      )}

      {!isLoadingData && !error && products.length > 0 && (
        <>
          <div className="space-y-3 lg:hidden">
            {paginatedProducts.map((product) => (
              <ProductMobileCard
                key={product.id}
                product={product}
                onDelete={() => setDeleteId(product.id)}
              />
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-[var(--erp-border)] lg:block">
            <table className="w-full min-w-[1050px] text-right text-sm">
              <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">المنتج</th>
                  <th className="px-4 py-3 font-medium">التصنيف</th>
                  <th className="px-4 py-3 font-medium">المورد</th>
                  <th className="px-4 py-3 font-medium">السعر</th>
                  <th className="px-4 py-3 font-medium">الكمية</th>
                  <th className="px-4 py-3 text-center font-medium">الحالة</th>
                  <th className="px-4 py-3 text-center font-medium">
                    الإجراءات
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-[var(--erp-border)] transition-colors last:border-0 hover:bg-[var(--erp-bg)]"
                  >
                    <td className="max-w-[280px] px-4 py-4">
                      <p className="line-clamp-2 font-semibold leading-6 text-[var(--erp-text)]">
                        {product.name}
                      </p>

                      <p
                        dir="ltr"
                        className="mt-1 text-left text-xs text-[var(--erp-muted)]"
                      >
                        {toEnglishDigits(product.barcode)}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-[var(--erp-muted)]">
                      {getProductCategory(product)}
                    </td>

                    <td className="px-4 py-4 text-[var(--erp-muted)]">
                      {getProductSupplier(product)}
                    </td>

                    <td
                      dir="ltr"
                      className="px-4 py-4 text-left tabular-nums text-[var(--erp-muted)]"
                    >
                      {formatCurrency(product.sellingPrice ?? 0)}
                    </td>

                    <td
                      dir="ltr"
                      className="px-4 py-4 text-left tabular-nums text-[var(--erp-muted)]"
                    >
                      {getProductQuantity(product)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <StatusBadge status={getProductStatus(product)} />
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <ProductActions
                        product={product}
                        onDelete={() => setDeleteId(product.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-sm text-[var(--erp-muted)] sm:text-right">
              الصفحة{" "}
              <span dir="ltr" className="font-semibold text-[var(--erp-text)]">
                {formatInteger(currentPage)}
              </span>{" "}
              من{" "}
              <span dir="ltr" className="font-semibold text-[var(--erp-text)]">
                {formatInteger(totalPages)}
              </span>
            </p>

            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
              >
                <ChevronRight className="size-4" />
                السابق
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setPage((previous) => Math.min(totalPages, previous + 1))
                }
              >
                التالي
                <ChevronLeft className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="حذف المنتج"
        description={
          selectedProduct
            ? `هل أنت متأكد من حذف المنتج "${selectedProduct.name}"؟ لا يمكن التراجع عن هذه العملية.`
            : "هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذه العملية."
        }
        confirmLabel="حذف المنتج"
        cancelLabel="إلغاء"
        isLoading={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
    >
      {children}
    </Button>
  )
}