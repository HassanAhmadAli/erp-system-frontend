import type { ReactNode } from "react"
import {
  ArrowRight,
  Barcode,
  FolderOpen,
  Hash,
  Package,
  Pencil,
  Tag,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"

import { getCategoryById } from "@/services/category-service"
import {
  formatCurrency,
  formatId,
  formatNumber,
} from "@/utils/number-formatters"
import { CustomerInfoCard } from "@/view/components/customers/customer-info-card"
import { CustomerInfoRow } from "@/view/components/customers/customer-info-row"
import { Button } from "@/view/components/ui/button"

export function CategoryDetailsPage() {
  const { id } = useParams()
  const categoryId = Number(id)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(categoryId),
    enabled: Number.isFinite(categoryId),
  })

  if (!Number.isFinite(categoryId)) {
    return <ErrorMessage message="رقم التصنيف غير صالح." />
  }

  if (isLoading) {
    return (
      <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
        <p className="text-[var(--erp-muted)]">جاري تحميل بيانات التصنيف...</p>
      </div>
    )
  }

  if (isError || !data) {
    return <ErrorMessage message="تعذر تحميل بيانات التصنيف." />
  }

  const products = data.products ?? []
  const productCount = data._count?.products ?? products.length
  const totalStock = products.reduce(
    (sum, product) => sum + (Number(product.quantityInStock) || 0),
    0
  )
  const averageStock =
    productCount > 0 ? Math.round(totalStock / productCount) : 0

  return (
    <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--erp-text)]">
            {data.name}
          </h1>

          <p className="mt-2 text-[var(--erp-muted)]">
            {data.description || "لا يوجد وصف لهذا التصنيف."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={`/categories/${categoryId}/edit`}>
            <Button className="gap-2">
              <Pencil className="size-4" />
              تعديل التصنيف
            </Button>
          </Link>

          <Link
            to="/categories"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
          >
            <ArrowRight className="size-4" />
            العودة إلى التصنيفات
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="عدد المنتجات"
          value={formatNumber(productCount)}
          icon={<Package className="size-5" />}
        />

        <SummaryCard
          label="إجمالي الكمية في المخزون"
          value={formatNumber(totalStock)}
          icon={<Tag className="size-5" />}
        />

        <SummaryCard
          label="رقم التصنيف"
          value={`#${formatId(data.id)}`}
          icon={<Hash className="size-5" />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <CustomerInfoCard title="معلومات التصنيف">
          <CustomerInfoRow label="اسم التصنيف" value={data.name} />
          <CustomerInfoRow label="الوصف" value={data.description || "—"} />
          <CustomerInfoRow
            label="رقم التصنيف"
            value={`#${formatId(data.id)}`}
          />
          <CustomerInfoRow
            label="عدد المنتجات"
            value={formatNumber(productCount)}
          />
        </CustomerInfoCard>

        <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
          <div className="mb-4 flex items-center justify-end gap-2">
            <h2 className="text-xl font-semibold text-[var(--erp-text)]">
              ملخص المخزون
            </h2>

            <FolderOpen className="size-5 text-[var(--erp-brand-solid)]" />
          </div>

          <div className="space-y-3 text-sm">
            <InfoLine
              label="المنتجات المرتبطة"
              value={formatNumber(productCount)}
            />

            <InfoLine label="إجمالي الوحدات" value={formatNumber(totalStock)} />

            <InfoLine
              label="متوسط الكمية لكل منتج"
              value={formatNumber(averageStock)}
            />
          </div>
        </section>
      </section>

      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-sm text-[var(--erp-muted)]">
            {formatNumber(productCount)} منتج
          </span>

          <h2 className="text-xl font-semibold text-[var(--erp-text)]">
            المنتجات في هذا التصنيف
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)] p-8 text-center text-[var(--erp-muted)]">
            لا توجد منتجات مرتبطة بهذا التصنيف حالياً.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--erp-border)]">
            <table className="w-full table-fixed text-right text-sm">
              <colgroup>
                <col className="w-[10%]" />
                <col className="w-[25%]" />
                <col className="w-[20%]" />
                <col className="w-[16%]" />
                <col className="w-[13%]" />
                <col className="w-[16%]" />
              </colgroup>

              <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
                <tr>
                  <th className="px-3 py-3 font-medium">#</th>
                  <th className="px-3 py-3 font-medium">اسم المنتج</th>
                  <th className="px-3 py-3 font-medium">الباركود</th>
                  <th className="px-3 py-3 font-medium">سعر البيع</th>
                  <th className="px-3 py-3 font-medium">الكمية</th>
                  <th className="px-3 py-3 text-center font-medium">
                    العمليات
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-[var(--erp-border)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)]"
                  >
                    <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                      #{formatId(product.id)}
                    </td>

                    <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                      <span className="block truncate">{product.name}</span>
                    </td>

                    <td className="px-3 py-3">
                      <span
                        dir="ltr"
                        className="inline-flex items-center gap-1 text-sm text-[var(--erp-muted)] tabular-nums"
                      >
                        <Barcode className="size-3.5" />
                        {product.barcode || "—"}
                      </span>
                    </td>

                    <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                      {formatCurrency(product.sellingPrice)}
                    </td>

                    <td className="px-3 py-3 text-[var(--erp-text)]">
                      {formatNumber(product.quantityInStock)}
                    </td>

                    <td className="px-3 py-3 text-center">
                      <Link to={`/products/${product.id}`}>
                        <Button variant="outline" size="sm">
                          عرض المنتج
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: ReactNode
}) {
  return (
    <div className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="flex items-center justify-between">
        <span className="rounded-2xl bg-[var(--erp-nav-active-bg)] p-3 text-[var(--erp-brand-solid)]">
          {icon}
        </span>

        <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      </div>

      <p className="mt-3 text-2xl font-bold text-[var(--erp-text)]">{value}</p>
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: string | number }) {
  return (
    <p className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-3">
      <span className="text-[var(--erp-muted)]">{label}</span>
      <span className="font-medium text-[var(--erp-text)]">{value}</span>
    </p>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <p className="text-red-500 dark:text-red-300">{message}</p>

      <Link
        to="/categories"
        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
      >
        <ArrowRight className="size-4" />
        العودة إلى التصنيفات
      </Link>
    </div>
  )
}
