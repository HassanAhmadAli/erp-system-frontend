import { useState } from "react"
import { Eye, Megaphone, Pencil, Plus, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useAds, useDeleteAd } from "@/hooks/useAds"
import { getAdImageSrc } from "@/services/ads-service"
import { PERMISSIONS } from "@/auth/permissions"
import { useLocale } from "@/i18n/locale-provider"
import { localizedTitle } from "@/lib/localized"
import { usePermissions } from "@/hooks/usePermissions"
import { formatDateTime, formatNumber } from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"
import { EntityImage } from "@/view/components/common/entity-image"
import { PaginationControls } from "@/view/components/ui/pagination-controls"
import type { AdPlacement } from "@/validation/ad-schema"

const PAGE_SIZE = 10

function formatAdDate(date?: string | null) {
  return formatDateTime(date)
}

export function AdsPage() {
  const { t } = useTranslation(["common", "pages"])
  const navigate = useNavigate()
  const { language } = useLocale()
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.ADS_MANAGE)
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching } = useAds({
    activeOnly: false,
    page,
    limit: PAGE_SIZE,
  })
  const deleteAdMutation = useDeleteAd()

  const ads = data?.data ?? []

  function placementLabel(placement: string) {
    if (
      placement === "HOME" ||
      placement === "CHECKOUT" ||
      placement === "SIDEBAR"
    ) {
      return t(`ads.placements.${placement as AdPlacement}`, { ns: "pages" })
    }

    return placement
  }

  function handleDelete(id: number) {
    const confirmed = window.confirm(t("ads.confirmDelete", { ns: "pages" }))

    if (!confirmed) return

    deleteAdMutation.mutate(id)
  }

  return (
    <main className="space-y-6 text-[var(--erp-text)]">
      <section className="flex items-center justify-between gap-4">
        <div className="text-start">
          <h1 className="text-2xl font-bold text-[var(--erp-text)]">
            {t("ads.title", { ns: "pages" })}
          </h1>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">
            {t("ads.subtitle", { ns: "pages" })}
          </p>
        </div>

        {canManage && (
          <Button className="gap-2" onClick={() => navigate("/ads/create")}>
            <Plus className="size-4" />
            {t("ads.create", { ns: "pages" })}
          </Button>
        )}
      </section>

      <section className="rounded-[20px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
        {isLoading ? (
          <p className="text-sm text-[var(--erp-muted)]">
            {t("ads.loadingAds", { ns: "pages" })}
          </p>
        ) : isError ? (
          <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
            {t("ads.loadAdsFailed", { ns: "pages" })}
          </p>
        ) : ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Megaphone className="mb-3 size-10 text-[var(--erp-muted)]" />

            <h2 className="text-lg font-semibold text-[var(--erp-text)]">
              {t("ads.noAds", { ns: "pages" })}
            </h2>

            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              {t("ads.noAdsHint", { ns: "pages" })}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-[var(--erp-muted)]">
              {t("resultCountTotal", {
                count: formatNumber(ads.length),
                total:
                  data?.total != null
                    ? formatNumber(data.total)
                    : formatNumber(ads.length),
              })}
            </p>

            <div className="overflow-x-auto rounded-2xl border border-[var(--erp-border)]">
              <table className="w-full min-w-[860px] table-fixed text-start text-sm">
                <colgroup>
                  <col className="w-[10%]" />
                  <col className="w-[28%]" />
                  <col className="w-[14%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                  <col className="w-[10%]" />
                  <col className="w-[18%]" />
                </colgroup>

                <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
                  <tr>
                    <th className="px-3 py-3 font-medium">{t("image")}</th>
                    <th className="px-3 py-3 font-medium">{t("title")}</th>
                    <th className="px-3 py-3 font-medium">
                      {t("ads.placement", { ns: "pages" })}
                    </th>
                    <th className="px-3 py-3 text-center font-medium">
                      {t("status")}
                    </th>
                    <th className="px-3 py-3 font-medium">{t("startDate")}</th>
                    <th className="px-3 py-3 font-medium">{t("endDate")}</th>
                    <th className="px-3 py-3 text-center font-medium">
                      {t("actions")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {ads.map((ad) => {
                    const imageSrc = getAdImageSrc(ad.imageUrl, ad.storedFileId)
                    const displayTitle = localizedTitle(ad, language)

                    return (
                      <tr
                        key={ad.id}
                        className="border-b border-[var(--erp-border)] transition-colors last:border-0 hover:bg-[var(--erp-bg)]"
                      >
                        <td className="px-3 py-3">
                          <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl border border-[var(--erp-border)] bg-[var(--erp-bg)]">
                            <EntityImage
                              src={imageSrc}
                              alt={displayTitle}
                              className="size-full object-cover"
                            />
                          </div>
                        </td>

                        <td className="px-3 py-4 leading-6 font-medium text-[var(--erp-text)]">
                          {displayTitle}
                        </td>

                        <td className="px-3 py-4 text-sm text-[var(--erp-text)]">
                          {placementLabel(ad.placement)}
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
                              {ad.isActive ? t("active") : t("inactive")}
                            </span>
                          </div>
                        </td>

                        <td
                          dir="ltr"
                          className="px-3 py-4 text-start text-sm text-[var(--erp-muted)] tabular-nums"
                        >
                          {formatAdDate(ad.startDate)}
                        </td>

                        <td
                          dir="ltr"
                          className="px-3 py-4 text-start text-sm text-[var(--erp-muted)] tabular-nums"
                        >
                          {formatAdDate(ad.endDate)}
                        </td>

                        <td className="px-3 py-4">
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {canManage && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => navigate(`/ads/${ad.id}`)}
                              >
                                <Eye className="size-3.5" />
                                {t("view")}
                              </Button>
                            )}

                            {canManage && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => navigate(`/ads/${ad.id}/edit`)}
                              >
                                <Pencil className="size-3.5" />
                                {t("edit")}
                              </Button>
                            )}

                            {canManage && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(ad.id)}
                                disabled={deleteAdMutation.isPending}
                              >
                                <Trash2 className="size-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <PaginationControls
                page={page}
                isFinalPage={data?.isFinalPage ?? true}
                isLoading={isFetching}
                total={data?.total}
                onPrevious={() =>
                  setPage((current) => Math.max(1, current - 1))
                }
                onNext={() => setPage((current) => current + 1)}
              />
            </div>
          </>
        )}
      </section>
    </main>
  )
}
