import {
  ArrowRight,
  Calendar,
  ExternalLink,
  Hash,
  Image,
  LinkIcon,
  MapPin,
  Megaphone,
  ToggleLeft,
  Trash2,
} from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { useAdById, useDeleteAd } from "@/hooks/useAds"
import { PERMISSIONS } from "@/auth/permissions"
import { usePermissions } from "@/hooks/usePermissions"
import { isValidId } from "@/validation/helpers"
import { formatDateTime, formatId } from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"

function getPlacementLabel(placement: string) {
  if (placement === "HOME") return "الصفحة الرئيسية"

  return placement
}

export function AdDetailsPage() {
  const { id } = useParams()
  const adId = Number(id)
  const navigate = useNavigate()

  const { data: ad, isLoading, isError } = useAdById(adId)
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.ADS_MANAGE)
  const deleteAdMutation = useDeleteAd()

  function handleDelete() {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا الإعلان؟")

    if (!confirmed) return

    deleteAdMutation.mutate(adId, {
      onSuccess: () => {
        navigate("/ads")
      },
    })
  }

  if (!isValidId(adId)) {
    return <ErrorState message="رقم الإعلان غير صالح." />
  }

  if (isLoading) {
    return (
      <main className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
        <p className="text-sm text-[var(--erp-muted)]">
          جاري تحميل بيانات الإعلان...
        </p>
      </main>
    )
  }

  if (isError || !ad) {
    return <ErrorState message="تعذر تحميل بيانات الإعلان." />
  }

  return (
    <main className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h1 className="text-3xl font-bold text-[var(--erp-text)]">
              تفاصيل الإعلان
            </h1>

            <Megaphone className="size-7 text-[var(--erp-brand-solid)]" />
          </div>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            عرض معلومات الإعلان وروابطه وفترة ظهوره.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/ads"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
          >
            <ArrowRight className="size-4" />
            العودة إلى الإعلانات
          </Link>

          {canManage && (
            <Button
              type="button"
              variant="destructive"
              className="gap-2"
              disabled={deleteAdMutation.isPending}
              onClick={handleDelete}
            >
              <Trash2 className="size-4" />
              حذف الإعلان
            </Button>
          )}
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="رقم الإعلان"
          value={`#${formatId(ad.id)}`}
          icon={<Hash className="size-5" />}
        />

        <SummaryCard
          label="مكان الظهور"
          value={getPlacementLabel(ad.placement)}
          icon={<MapPin className="size-5" />}
        />

        <SummaryCard
          label="الحالة"
          value={ad.isActive ? "نشط" : "غير نشط"}
          icon={<ToggleLeft className="size-5" />}
        />

        <SummaryCard
          label="تاريخ البداية"
          value={formatDateTime(ad.startDate)}
          icon={<Calendar className="size-5" />}
          ltr
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
          <div className="mb-5 flex items-center justify-end gap-2">
            <h2 className="text-xl font-semibold text-[var(--erp-text)]">
              محتوى الإعلان
            </h2>

            <Megaphone className="size-5 text-[var(--erp-brand-solid)]" />
          </div>

          <div className="space-y-4">
            <InfoRow label="العنوان" value={ad.title} />

            <InfoRow
              label="الوصف"
              value={ad.description || "لا يوجد وصف"}
              multiline
            />

            <InfoRow
              label="تاريخ البداية"
              value={formatDateTime(ad.startDate)}
              ltr
            />

            <InfoRow
              label="تاريخ النهاية"
              value={formatDateTime(ad.endDate)}
              ltr
            />

            <InfoRow
              label="تاريخ الإنشاء"
              value={formatDateTime(ad.createdAt)}
              ltr
            />

            <InfoRow
              label="آخر تحديث"
              value={formatDateTime(ad.updatedAt)}
              ltr
            />
          </div>
        </section>

        <section className="space-y-6">
          <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
            <div className="mb-5 flex items-center justify-end gap-2">
              <h2 className="text-xl font-semibold text-[var(--erp-text)]">
                صورة الإعلان
              </h2>

              <Image className="size-5 text-[var(--erp-brand-solid)]" />
            </div>

            {ad.imageUrl ? (
              <div className="space-y-3">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="max-h-[260px] w-full rounded-2xl border border-[var(--erp-border)] object-cover"
                />

                <a
                  href={ad.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[var(--erp-brand-solid)] hover:underline"
                >
                  فتح الصورة
                  <ExternalLink className="size-4" />
                </a>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)] p-8 text-center text-sm text-[var(--erp-muted)]">
                لا توجد صورة لهذا الإعلان
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
            <div className="mb-5 flex items-center justify-end gap-2">
              <h2 className="text-xl font-semibold text-[var(--erp-text)]">
                رابط الإعلان
              </h2>

              <LinkIcon className="size-5 text-[var(--erp-brand-solid)]" />
            </div>

            {ad.linkUrl ? (
              <a
                href={ad.linkUrl}
                target="_blank"
                rel="noreferrer"
                dir="ltr"
                className="block rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4 text-left text-sm break-all text-[var(--erp-brand-solid)] hover:underline"
              >
                {ad.linkUrl}
              </a>
            ) : (
              <p className="rounded-2xl border border-dashed border-[var(--erp-border)] bg-[var(--erp-bg)] p-4 text-sm text-[var(--erp-muted)]">
                لا يوجد رابط مرفق
              </p>
            )}
          </section>
        </section>
      </section>
    </main>
  )
}

function SummaryCard({
  label,
  value,
  icon,
  ltr = false,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  ltr?: boolean
}) {
  return (
    <div className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div className="flex items-center justify-between">
        <span className="rounded-2xl bg-[var(--erp-nav-active-bg)] p-3 text-[var(--erp-brand-solid)]">
          {icon}
        </span>

        <p className="text-sm text-[var(--erp-muted)]">{label}</p>
      </div>

      <p
        dir={ltr ? "ltr" : "rtl"}
        className="mt-3 text-lg font-bold text-[var(--erp-text)]"
      >
        {value}
      </p>
    </div>
  )
}

function InfoRow({
  label,
  value,
  multiline = false,
  ltr = false,
}: {
  label: string
  value: string | number
  multiline?: boolean
  ltr?: boolean
}) {
  return (
    <div className="rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
      <p className="mb-1 text-sm text-[var(--erp-muted)]">{label}</p>

      <p
        dir={ltr ? "ltr" : "rtl"}
        className={
          multiline
            ? "leading-7 whitespace-pre-wrap text-[var(--erp-text)]"
            : "font-medium text-[var(--erp-text)]"
        }
      >
        {value}
      </p>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <p className="text-red-500 dark:text-red-300">{message}</p>

      <Link
        to="/ads"
        className="inline-flex items-center gap-2 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-card)] px-4 py-2 text-sm font-medium text-[var(--erp-text)] transition hover:bg-[var(--erp-bg)]"
      >
        <ArrowRight className="size-4" />
        العودة إلى الإعلانات
      </Link>
    </main>
  )
}
