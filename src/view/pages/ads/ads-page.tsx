import { Eye, Loader2, Megaphone, Plus, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { useAds, useDeleteAd } from "@/hooks/useAds"
import { formatDateTime } from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"

function formatAdDate(date?: string | null) {
  return formatDateTime(date)
}

function formatPlacement(placement: string) {
  if (placement === "HOME") {
    return "الصفحة الرئيسية"
  }

  return placement
}

function AdStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={
        isActive
          ? "inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-500/15 dark:text-red-300"
      }
    >
      {isActive ? "نشط" : "غير نشط"}
    </span>
  )
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
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-[var(--erp-text)]">
            الإعلانات
          </h1>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            إدارة الإعلانات والعروض الظاهرة داخل النظام.
          </p>
        </div>

        <Button
          className="w-full gap-2 sm:w-auto"
          onClick={() => navigate("/ads/create")}
        >
          <Plus className="size-4" />
          إضافة إعلان
        </Button>
      </section>

      <section className="rounded-[20px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-4 text-[var(--erp-text)] shadow-[var(--erp-shadow)] sm:p-5">
        {isLoading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-[var(--erp-accent)]" />
          </div>
        ) : isError ? (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
            حدث خطأ أثناء تحميل الإعلانات.
          </p>
        ) : ads.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center py-12 text-center">
            <Megaphone className="mb-3 size-10 text-[var(--erp-muted)]" />

            <h2 className="text-lg font-semibold text-[var(--erp-text)]">
              لا توجد إعلانات
            </h2>

            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              ابدأ بإضافة إعلان جديد ليظهر هنا.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {ads.map((ad) => (
                <article
                  key={ad.id}
                  className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 text-right">
                      <h2 className="line-clamp-2 text-base font-semibold leading-6 text-[var(--erp-text)]">
                        {ad.title}
                      </h2>

                      <p className="mt-1 text-sm text-[var(--erp-muted)]">
                        {formatPlacement(ad.placement)}
                      </p>
                    </div>

                    <AdStatusBadge isActive={ad.isActive} />
                  </div>

                  <div className="mt-4 grid gap-3 rounded-2xl bg-[var(--erp-bg)] p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[var(--erp-muted)]">
                        تاريخ البداية
                      </span>

                      <span
                        dir="ltr"
                        className="text-left tabular-nums text-[var(--erp-text)]"
                      >
                        {formatAdDate(ad.startDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[var(--erp-muted)]">
                        تاريخ النهاية
                      </span>

                      <span
                        dir="ltr"
                        className="text-left tabular-nums text-[var(--erp-text)]"
                      >
                        {formatAdDate(ad.endDate)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => navigate(`/ads/${ad.id}`)}
                    >
                      <Eye className="size-3.5" />
                      عرض التفاصيل
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
                </article>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded-2xl border border-[var(--erp-border)] md:block">
              <table className="w-full min-w-[920px] text-right text-sm">
                <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">العنوان</th>
                    <th className="px-4 py-3 font-medium">المكان</th>
                    <th className="px-4 py-3 text-center font-medium">
                      الحالة
                    </th>
                    <th className="px-4 py-3 font-medium">تاريخ البداية</th>
                    <th className="px-4 py-3 font-medium">تاريخ النهاية</th>
                    <th className="px-4 py-3 text-center font-medium">
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
                      <td className="max-w-[280px] px-4 py-4">
                        <p className="line-clamp-2 leading-6 font-medium text-[var(--erp-text)]">
                          {ad.title}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm text-[var(--erp-text)]">
                        {formatPlacement(ad.placement)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <AdStatusBadge isActive={ad.isActive} />
                        </div>
                      </td>

                      <td
                        dir="ltr"
                        className="px-4 py-4 text-left text-sm text-[var(--erp-muted)] tabular-nums"
                      >
                        {formatAdDate(ad.startDate)}
                      </td>

                      <td
                        dir="ltr"
                        className="px-4 py-4 text-left text-sm text-[var(--erp-muted)] tabular-nums"
                      >
                        {formatAdDate(ad.endDate)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
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
          </>
        )}
      </section>
    </main>
  )
}