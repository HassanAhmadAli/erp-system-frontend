import {
  AlertTriangle,
  ArrowRight,
  Barcode,
  Boxes,
  CalendarClock,
  Package,
  Pencil,
  Tag,
  Truck,
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { useProductById } from "@/hooks/Products/useProductById"
import type { Product } from "@/services/product-service"
import {
  formatCurrency,
  formatInteger,
  formatDateTime,
  toEnglishDigits,
} from "@/utils/number-formatters"
import { StatusBadge } from "@/view/components/common/status-badge"
import { Button } from "@/view/components/ui/button"

type StockStatus = "متوفر" | "منخفض" | "نافد"

function getStockStatus(product: Product): StockStatus {
  const quantity = product.quantityInStock ?? 0
  const minQuantity = product.minQuantity ?? 0

  if (quantity <= 0) return "نافد"
  if (minQuantity > 0 && quantity <= minQuantity) return "منخفض"

  return "متوفر"
}

function formatText(value?: string | number | null) {
  const text = value === null || value === undefined ? "" : String(value).trim()

  return text ? toEnglishDigits(text) : "-"
}

function ProductDetailItem({
  label,
  value,
  ltr = false,
}: {
  label: string
  value?: string
  ltr?: boolean
}) {
  return (
    <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
      <p className="text-sm text-[var(--erp-muted)]">{label}</p>

      <p
        dir={ltr ? "ltr" : "rtl"}
        className={`mt-2 font-semibold text-[var(--erp-text)] ${
          ltr ? "text-left tabular-nums" : "text-right"
        }`}
      >
        {value || "-"}
      </p>
    </div>
  )
}

function ProductInfoCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <article className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
      <div className="mb-4 flex items-center gap-2 text-right">
        <div className="flex size-9 items-center justify-center rounded-2xl bg-[var(--erp-accent)]/10 text-[var(--erp-accent)]">
          {icon}
        </div>

        <h2 className="text-lg font-bold text-[var(--erp-text)]">{title}</h2>
      </div>

      <div className="grid gap-3">{children}</div>
    </article>
  )
}

export function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const productId = id ? Number(id) : null
  const isValidProductId =
    productId !== null && Number.isFinite(productId) && productId > 0

  const { data: product, isLoading, error } = useProductById(
    isValidProductId ? productId : null
  )

  if (!isValidProductId) {
    return (
      <main className="space-y-6 text-[var(--erp-text)]" dir="rtl">
        <section className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-6 text-right shadow-[var(--erp-shadow)] dark:bg-red-500/15">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-300" />

            <div>
              <h1 className="text-lg font-bold text-red-700 dark:text-red-300">
                معرف المنتج غير صالح
              </h1>

              <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/80">
                لا يمكن عرض تفاصيل المنتج لأن الرقم غير صحيح.
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/products")}
              >
                <ArrowRight className="size-4" />
                رجوع للمنتجات
              </Button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="space-y-6 text-[var(--erp-text)]" dir="rtl">
        <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-center shadow-[var(--erp-shadow)]">
          <p className="text-sm text-[var(--erp-muted)]">
            جاري تحميل تفاصيل المنتج...
          </p>
        </section>
      </main>
    )
  }

  if (!product || error) {
    return (
      <main className="space-y-6 text-[var(--erp-text)]" dir="rtl">
        <section className="rounded-[24px] border border-red-500/20 bg-red-500/10 p-6 text-right shadow-[var(--erp-shadow)] dark:bg-red-500/15">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-300" />

            <div>
              <h1 className="text-lg font-bold text-red-700 dark:text-red-300">
                حدث خطأ أثناء تحميل المنتج
              </h1>

              <p className="mt-1 text-sm text-red-700/80 dark:text-red-300/80">
                تأكد من أن المنتج موجود ثم حاول مرة أخرى.
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => navigate("/products")}
              >
                <ArrowRight className="size-4" />
                رجوع للمنتجات
              </Button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  const status = getStockStatus(product)

  return (
    <main className="space-y-6 text-[var(--erp-text)]" dir="rtl">
      <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Package className="size-6 text-[var(--erp-accent)]" />

              <h1 className="text-2xl font-bold text-[var(--erp-text)]">
                تفاصيل المنتج
              </h1>
            </div>

            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              عرض بيانات المنتج فقط. التعديل يتم من صفحة التعديل.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 sm:w-auto"
              onClick={() => navigate("/products")}
            >
              <ArrowRight className="size-4" />
              رجوع للمنتجات
            </Button>


            <Button
              type="button"
              className="w-full gap-2 sm:w-auto"
              onClick={() => navigate(`/products/${product.id}/edit`)}
            >
              <Pencil className="size-4" />
              تعديل المنتج
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="text-right">
            <h2 className="text-2xl font-bold text-[var(--erp-text)]">
              {formatText(product.name)}
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--erp-muted)]">
              {formatText(product.description) === "-"
                ? "لا يوجد وصف لهذا المنتج."
                : formatText(product.description)}
            </p>
          </div>

          <StatusBadge status={status} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ProductInfoCard title="معلومات المنتج" icon={<Barcode className="size-5" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <ProductDetailItem
              label="رقم المنتج"
              value={`#${formatInteger(product.id)}`}
              ltr
            />

            <ProductDetailItem
              label="الباركود"
              value={formatText(product.barcode)}
              ltr
            />

            <ProductDetailItem
              label="رابط الصورة"
              value={formatText(product.imageUrl)}
              ltr
            />

            <ProductDetailItem
              label="الحالة"
              value={status}
            />
          </div>
        </ProductInfoCard>

        <ProductInfoCard title="الأسعار والمخزون" icon={<Boxes className="size-5" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <ProductDetailItem
              label="سعر الشراء"
              value={formatCurrency(product.purchasePrice ?? 0)}
              ltr
            />

            <ProductDetailItem
              label="سعر البيع"
              value={formatCurrency(product.sellingPrice ?? 0)}
              ltr
            />

            <ProductDetailItem
              label="الكمية الحالية"
              value={formatInteger(product.quantityInStock ?? 0)}
              ltr
            />

            <ProductDetailItem
              label="الحد الأدنى"
              value={formatInteger(product.minQuantity ?? 0)}
              ltr
            />
          </div>
        </ProductInfoCard>

        <ProductInfoCard title="التصنيف" icon={<Tag className="size-5" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <ProductDetailItem
              label="رقم التصنيف"
              value={
                product.categoryId
                  ? `#${formatInteger(product.categoryId)}`
                  : "-"
              }
              ltr
            />

            <ProductDetailItem
              label="اسم التصنيف"
              value={formatText(product.category?.name)}
            />

            <ProductDetailItem
              label="وصف التصنيف"
              value={formatText(product.category?.description)}
            />
          </div>
        </ProductInfoCard>

        <ProductInfoCard title="المورد" icon={<Truck className="size-5" />}>
          <div className="grid gap-3 sm:grid-cols-2">
            <ProductDetailItem
              label="رقم المورد"
              value={
                product.supplierId
                  ? `#${formatInteger(product.supplierId)}`
                  : "-"
              }
              ltr
            />

            <ProductDetailItem
              label="اسم المورد"
              value={formatText(product.supplier?.fullName)}
            />

            <ProductDetailItem
              label="الهاتف"
              value={formatText(product.supplier?.phone)}
              ltr
            />

            <ProductDetailItem
              label="البريد الإلكتروني"
              value={formatText(product.supplier?.email)}
              ltr
            />

            <ProductDetailItem
              label="العنوان"
              value={formatText(product.supplier?.address)}
            />
          </div>
        </ProductInfoCard>

        <ProductInfoCard
          title="تواريخ السجل"
          icon={<CalendarClock className="size-5" />}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ProductDetailItem
              label="تاريخ الإنشاء"
              value={formatDateTime(product.createdAt)}
              ltr
            />

            <ProductDetailItem
              label="آخر تحديث"
              value={formatDateTime(product.updatedAt)}
              ltr
            />
          </div>
        </ProductInfoCard>
      </section>
    </main>
  )
}