import { Megaphone, Plus, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { useAds, useDeleteAd } from "@/hooks/useAds"
import { Button } from "@/view/components/ui/button"

function formatDate(date: string) {
  if (!date) return "-"

  return new Date(date).toLocaleDateString("ar-SY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
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
    <main className="space-y-6" dir="rtl">
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

      <section className="rounded-[20px] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)]">
        {isLoading ? (
          <p className="text-sm text-[var(--erp-muted)]">
            جاري تحميل الإعلانات...
          </p>
        ) : isError ? (
          <p className="text-sm text-red-500">
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-right">
              <thead>
                <tr className="border-b border-[var(--erp-border)] text-sm text-[var(--erp-muted)]">
                  <th className="py-3 font-medium">العنوان</th>
                  <th className="py-3 font-medium">الوصف</th>
                  <th className="py-3 font-medium">المكان</th>
                  <th className="py-3 font-medium">الحالة</th>
                  <th className="py-3 font-medium">تاريخ البداية</th>
                  <th className="py-3 font-medium">تاريخ النهاية</th>
                  <th className="py-3 font-medium">الإجراءات</th>
                </tr>
              </thead>

              <tbody>
                {ads.map((ad) => (
                  <tr
                    key={ad.id}
                    className="border-b border-[var(--erp-border)] last:border-0"
                  >
                    <td className="py-4 font-medium text-[var(--erp-text)]">
                      {ad.title}
                    </td>

                    <td className="max-w-[260px] truncate py-4 text-sm text-[var(--erp-muted)]">
                      {ad.description || "-"}
                    </td>

                    <td className="py-4 text-sm text-[var(--erp-text)]">
                      {ad.placement === "HOME"
                        ? "الصفحة الرئيسية"
                        : ad.placement}
                    </td>

                    <td className="py-4">
                      <span
                        className={
                          ad.isActive
                            ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                            : "rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                        }
                      >
                        {ad.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </td>

                    <td className="py-4 text-sm text-[var(--erp-muted)]">
                      {formatDate(ad.startDate)}
                    </td>

                    <td className="py-4 text-sm text-[var(--erp-muted)]">
                      {formatDate(ad.endDate)}
                    </td>

                    <td className="py-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(ad.id)}
                        disabled={deleteAdMutation.isPending}
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
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