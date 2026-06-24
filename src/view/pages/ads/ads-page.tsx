import { Eye, Megaphone, Plus, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { useAds, useDeleteAd } from "@/hooks/useAds"
import { formatDateTime } from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"

function formatAdDate(date?: string | null) {
  return formatDateTime(date)
}

export function AdsPage() {
  const navigate = useNavigate()
  const { data: ads = [], isLoading, isError } = useAds(false)
  const deleteAdMutation = useDeleteAd()

  function handleDelete(id: number) {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا الإعلان؟")

    if (!confirmed) return

    deleteAdMutation.mutate(id)
  }

  return (
    <main className="space-y-6 text-[var(--erp-text)]" dir="rtl">
      <section className="flex items-center justify-between gap-4">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-[var(--erp-text)]">
            الإعلانات
          </h1>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            إدارة الإعلانات والعروض الظاهرة داخل النظام.
          </p>
        </div>

        <Button className="gap-2" onClick={() => navigate("/ads/create")}>
          <Plus className="size-4" />
          إضافة إعلان
        </Button>
      </section>

      <section className="rounded-[20px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        {isLoading ? (
          <p className="text-sm text-[var(--erp-muted)]">
            جاري تحميل الإعلانات...
          </p>
        ) : isError ? (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
            حدث خطأ أثناء تحميل الإعلانات.
          </p>
        ) : ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Megaphone className="mb-3 size-10 text-[var(--erp-muted)]" />

            <h2 className="text-lg font-semibold text-[var(--erp-text)]">
              لا توجد إعلانات
            </h2>

            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              ابدأ بإضافة إعلان جديد ليظهر هنا.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--erp-border)]">
            <table className="w-full table-fixed text-right text-sm">
              <colgroup>
                <col className="w-[28%]" />
                <col className="w-[14%]" />
                <col className="w-[12%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
                <col className="w-[10%]" />
              </colgroup>

              <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
                <tr>
                  <th className="px-3 py-3 font-medium">العنوان</th>
                  <th className="px-3 py-3 font-medium">المكان</th>
                  <th className="px-3 py-3 text-center font-medium">الحالة</th>
                  <th className="px-3 py-3 font-medium">تاريخ البداية</th>
                  <th className="px-3 py-3 font-medium">تاريخ النهاية</th>
                  <th className="px-3 py-3 text-center font-medium">
                    الإجراءات
                  </th>
                </tr>
              </thead>

              <tbody>
                {ads.map((ad) => (
                  <tr
                    key={ad.id}
                    className="border-b border-[var(--erp-border)] transition-colors last:border-0 hover:bg-[var(--erp-bg)]"
                  >
                    <td className="px-3 py-4 leading-6 font-medium text-[var(--erp-text)]">
                      {ad.title}
                    </td>

                    <td className="px-3 py-4 text-sm text-[var(--erp-text)]">
                      {ad.placement === "HOME"
                        ? "الصفحة الرئيسية"
                        : ad.placement}
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex justify-center">
                        <span
                          className={
                            ad.isActive
                              ? "rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                              : "rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-500/15 dark:text-red-300"
                          }
                        >
                          {ad.isActive ? "نشط" : "غير نشط"}
                        </span>
                      </div>
                    </td>

                    <td
                      dir="ltr"
                      className="px-3 py-4 text-right text-sm text-[var(--erp-muted)] tabular-nums"
                    >
                      {formatAdDate(ad.startDate)}
                    </td>

                    <td
                      dir="ltr"
                      className="px-3 py-4 text-right text-sm text-[var(--erp-muted)] tabular-nums"
                    >
                      {formatAdDate(ad.endDate)}
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex flex-wrap justify-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => navigate(`/ads/${ad.id}`)}
                        >
                          <Eye className="size-3.5" />
                          عرض
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(ad.id)}
                          disabled={deleteAdMutation.isPending}
                        >
                          <Trash2 className="size-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
