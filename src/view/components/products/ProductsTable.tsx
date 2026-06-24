import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ConfirmDialog } from "@/view/components/ui/confirm-dialog"
import { StatusBadge } from "@/view/components/common/status-badge"

import { normalizeProducts, type Product } from "@/services/product-service"
import { PERMISSIONS } from "@/auth/permissions"
import { Can } from "@/view/components/auth/can"
import { useDeleteProduct } from "@/hooks/Products/useDeleteProduct"
import { useProducts } from "@/hooks/Products/useProducts"
import { useLowStockProducts } from "@/hooks/Products/useLowStockProducts"
import { useProductsByCategory } from "@/hooks/Products/useProductsByCategory"
import { useProductsBySupplier } from "@/hooks/Products/useProductsBySupplier"
import { useCategoriesForSelect } from "@/hooks/Categories/useCategoriesForSelect"
import { useSuppliers } from "@/hooks/Suppliers/useSuppliers"
import { ProductsSkeleton } from "./products-skeleton"

type Status = "متوفر" | "منخفض" | "نافد"

function getProductStatus(p: Product): Status {
  const qty = p.quantityInStock ?? 0
  const min = p.minQuantity ?? 0

  if (qty <= 0) return "نافد"
  if (min > 0 && qty <= min) return "منخفض"
  return "متوفر"
}

const PAGE_SIZE = 10

export function ProductsTable() {
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<
    "all" | "low-stock" | "category" | "supplier"
  >("all")
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
        filteredProducts = normalizeProducts(categoryData)
        break
      case "supplier":
        filteredProducts = normalizeProducts(supplierData)
        break
      default:
        filteredProducts = normalizeProducts(data)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.barcode.toLowerCase().includes(query)
      )
    }

    return filteredProducts
  }, [data, lowStockData, categoryData, supplierData, filterType, searchQuery])

  // Reset to first page whenever the filtered result set changes.
  useEffect(() => {
    setPage(1)
  }, [filterType, searchQuery, categoryId, supplierId])

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedProducts = useMemo(
    () =>
      products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [products, currentPage]
  )

  const isLoadingData =
    isLoading ||
    (filterType === "low-stock" && isLoadingLowStock) ||
    (filterType === "category" && isLoadingCategory) ||
    (filterType === "supplier" && isLoadingSupplier)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="بحث بالاسم أو الباركود..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="min-w-[200px] flex-1 rounded-xl border p-2 text-right"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={`rounded-xl px-3 py-2 text-white ${
              filterType === "all" ? "bg-green-600" : "bg-gray-600"
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilterType("low-stock")}
            className={`rounded-xl px-3 py-2 text-white ${
              filterType === "low-stock" ? "bg-green-600" : "bg-gray-600"
            }`}
          >
            المخزون المنخفض
          </button>
          <button
            onClick={() => setFilterType("category")}
            className={`rounded-xl px-3 py-2 text-white ${
              filterType === "category" ? "bg-green-600" : "bg-gray-600"
            }`}
          >
            حسب التصنيف
          </button>
          <button
            onClick={() => setFilterType("supplier")}
            className={`rounded-xl px-3 py-2 text-white ${
              filterType === "supplier" ? "bg-green-600" : "bg-gray-600"
            }`}
          >
            حسب المورد
          </button>
        </div>
      </div>

      {filterType === "category" && (
        <div className="flex items-center gap-2">
          <label className="text-sm">التصنيف:</label>
          <select
            value={categoryId ?? ""}
            onChange={(e) =>
              setCategoryId(e.target.value ? Number(e.target.value) : null)
            }
            className="w-64 rounded-xl border p-2"
          >
            <option value="">اختر التصنيف</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {filterType === "supplier" && (
        <div className="flex items-center gap-2">
          <label className="text-sm">المورد:</label>
          <select
            value={supplierId ?? ""}
            onChange={(e) =>
              setSupplierId(e.target.value ? Number(e.target.value) : null)
            }
            className="w-64 rounded-xl border p-2"
          >
            <option value="">اختر المورد</option>
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.fullName}
              </option>
            ))}
          </select>
        </div>
      )}

      {isLoadingData && <ProductsSkeleton />}

      {!isLoadingData && error && (
        <p className="rounded-xl bg-red-100 p-3 text-center text-sm text-red-700">
          حدث خطأ أثناء تحميل المنتجات
        </p>
      )}

      {!isLoadingData && !error && (
        <div className="overflow-hidden rounded-2xl bg-[var(--erp-card)]">
          <table className="w-full text-right">
            <thead className="bg-[var(--erp-sidebar)]">
              <tr>
                <th className="p-3">المنتج</th>
                <th className="p-3">التصنيف</th>
                <th className="p-3">المورد</th>
                <th className="p-3">السعر</th>
                <th className="p-3">الكمية</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-[var(--erp-muted)]">
                      {p.barcode}
                    </div>
                  </td>
                  <td className="p-3">
                    {p.category?.name ?? p.categoryId ?? "-"}
                  </td>
                  <td className="p-3">
                    {p.supplier?.fullName ?? p.supplierId ?? "-"}
                  </td>
                  <td className="p-3">{p.sellingPrice ?? "-"}</td>
                  <td className="p-3">
                    {p.quantityInStock ?? 0}{" "}
                    {p.minQuantity ? `/ ${p.minQuantity}` : ""}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={getProductStatus(p)} />
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/products/${p.id}`)}
                        className="rounded bg-green-600 px-3 py-1 text-white"
                      >
                        التفاصيل
                      </button>
                      <Can permission={PERMISSIONS.PRODUCT_MANAGE}>
                        <button
                          onClick={() => navigate(`/products/${p.id}/edit`)}
                          className="rounded bg-blue-600 px-3 py-1 text-white"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="rounded bg-red-600 px-3 py-1 text-white"
                        >
                          حذف
                        </button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td className="p-6 text-center" colSpan={7}>
                    لا يوجد منتجات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!isLoadingData && !error && products.length > 0 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl bg-gray-600 px-4 py-2 text-white disabled:opacity-50"
          >
            السابق
          </button>

          <span className="text-sm">
            الصفحة {currentPage} من {totalPages}
          </span>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-xl bg-gray-600 px-4 py-2 text-white disabled:opacity-50"
          >
            التالي
          </button>
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return
          deleteMutation.mutate(deleteId)
          setDeleteId(null)
        }}
      />
    </div>
  )
}
