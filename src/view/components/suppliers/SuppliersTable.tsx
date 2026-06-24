import { Link } from "react-router-dom"

import { useDeleteSupplier } from "@/hooks/Suppliers/useDeleteSupplier"
import { useSuppliers } from "@/hooks/Suppliers/useSuppliers"
import { PERMISSIONS } from "@/auth/permissions"
import { Can } from "@/view/components/auth/can"
import { formatNumber } from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"

export function SuppliersTable() {
  const { data, isLoading, error } = useSuppliers()
  const deleteMutation = useDeleteSupplier()

  const suppliers = data?.data ?? []

  function handleDeleteSupplier(id: number) {
    const shouldDelete = window.confirm("هل أنت متأكد من حذف هذا المورد؟")

    if (!shouldDelete) return

    deleteMutation.mutate(id)
  }

  return (
    <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--erp-text)]">
            قائمة الموردين
          </h2>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            عدد الموردين: {formatNumber(suppliers.length)}
          </p>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-[var(--erp-muted)]">جاري التحميل...</p>
      )}

      {error && (
        <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
          حدث خطأ في تحميل الموردين
        </p>
      )}

      {!isLoading && !error && suppliers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)] p-8 text-center">
          <p className="text-sm text-[var(--erp-muted)]">
            لا يوجد موردون حالياً.
          </p>

          <Can permission={PERMISSIONS.SUPPLIER_MANAGE}>
            <Link
              to="/suppliers/create"
              className="mt-4 inline-flex rounded-2xl bg-[var(--erp-brand-solid)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 dark:!text-[#24114f]"
            >
              إضافة أول مورد
            </Link>
          </Can>
        </div>
      )}

      {!isLoading && !error && suppliers.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-[var(--erp-border)]">
          <table className="w-full table-fixed text-right text-sm">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[17%]" />
              <col className="w-[23%]" />
              <col className="w-[20%]" />
              <col className="w-[18%]" />
            </colgroup>

            <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
              <tr>
                <th className="px-3 py-3 font-medium">الاسم</th>
                <th className="px-3 py-3 font-medium">الهاتف</th>
                <th className="px-3 py-3 font-medium">الإيميل</th>
                <th className="px-3 py-3 font-medium">العنوان</th>
                <th className="px-3 py-3 text-center font-medium">إجراءات</th>
              </tr>
            </thead>

            <tbody>
              {suppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="border-b border-[var(--erp-border)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)]"
                >
                  <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                    <span className="block truncate">{supplier.fullName}</span>
                  </td>

                  <td className="px-3 py-3 text-[var(--erp-muted)]">
                    <span className="block truncate">{supplier.phone}</span>
                  </td>

                  <td className="px-3 py-3 text-[var(--erp-muted)]">
                    <span className="block truncate">{supplier.email}</span>
                  </td>

                  <td className="px-3 py-3 text-[var(--erp-muted)]">
                    <span className="block truncate">
                      {supplier.address || "—"}
                    </span>
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex flex-wrap justify-center gap-1.5">
                      <Link to={`/suppliers/${supplier.id}`}>
                        <Button variant="outline" size="xs">
                          عرض
                        </Button>
                      </Link>

                      <Can permission={PERMISSIONS.SUPPLIER_MANAGE}>
                        <Link to={`/suppliers/${supplier.id}/edit`}>
                          <Button variant="outline" size="xs">
                            تعديل
                          </Button>
                        </Link>

                        <Button
                          variant="destructive"
                          size="xs"
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          disabled={deleteMutation.isPending}
                        >
                          حذف
                        </Button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
