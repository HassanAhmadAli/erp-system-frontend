import { type FormEvent, type ReactNode, useMemo, useState } from "react"
import { Gift, Pencil, Plus, Star, Trash2, X } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  useCreateLoyaltyReward,
  useDeleteLoyaltyReward,
  useLoyaltyRewards,
  useUpdateLoyaltyReward,
} from "@/hooks/Loyalty/useLoyaltyRewards"
import { useLocale } from "@/i18n/locale-provider"
import { localizedDescription, localizedName } from "@/lib/localized"
import {
  LOYALTY_DISCOUNT_TYPES,
  loyaltyRewardSchema,
  loyaltyRewardValuesToPayload,
  loyaltyRewardZodErrorToFormErrors,
  type LoyaltyDiscountType,
  type LoyaltyRewardFormErrors,
} from "@/validation/loyalty-schema"
import { isValidUuid, parsePositiveInteger } from "@/validation/helpers"
import { formatNumber } from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"
import { PaginationControls } from "@/view/components/ui/pagination-controls"
import type { LoyaltyReward } from "@/services/loyalty-rewards-service"

const PAGE_SIZE = 10

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-start text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

function formatDiscountValue(
  type: LoyaltyDiscountType | string,
  value: string | number
) {
  if (type === "PERCENTAGE") {
    return `${formatNumber(value)}%`
  }

  return `${formatNumber(value)} SYP`
}

function resolveDiscountType(value: string): LoyaltyDiscountType {
  return value === "PERCENTAGE" ? "PERCENTAGE" : "FIXED_AMOUNT"
}

function discountTypeLabel(
  type: LoyaltyDiscountType | string,
  t: (key: string) => string
) {
  return type === "PERCENTAGE" ? t("percentage") : t("fixedAmount")
}

export function LoyaltyRewardsPage() {
  const { t } = useTranslation(["common", "pages"])
  const { language } = useLocale()
  const [rewardsPage, setRewardsPage] = useState(1)
  const {
    data: rewardsData,
    isLoading,
    isError,
    isFetching: rewardsFetching,
  } = useLoyaltyRewards({
    page: rewardsPage,
    limit: PAGE_SIZE,
  })
  const rewards = rewardsData?.data ?? []
  const createReward = useCreateLoyaltyReward()
  const updateReward = useUpdateLoyaltyReward()
  const deleteReward = useDeleteLoyaltyReward()

  const [editingReward, setEditingReward] = useState<LoyaltyReward | null>(null)
  const [name, setName] = useState("")
  const [nameAr, setNameAr] = useState("")
  const [description, setDescription] = useState("")
  const [descriptionAr, setDescriptionAr] = useState("")
  const [pointsCost, setPointsCost] = useState("")
  const [discountType, setDiscountType] =
    useState<LoyaltyDiscountType>("FIXED_AMOUNT")
  const [discountValue, setDiscountValue] = useState("")
  const [maxUses, setMaxUses] = useState("1")
  const [validityDays, setValidityDays] = useState("7")
  const [isActive, setIsActive] = useState(true)
  const [rewardFormErrors, setRewardFormErrors] =
    useState<LoyaltyRewardFormErrors>({})
  const [rewardError, setRewardError] = useState("")
  const [rewardMessage, setRewardMessage] = useState("")

  const isEditing = editingReward != null
  const isSaving = createReward.isPending || updateReward.isPending

  const activeRewardsCount = useMemo(
    () => rewards.filter((reward) => reward.isActive).length,
    [rewards]
  )

  const highestPointsCost = useMemo(() => {
    if (rewards.length === 0) return 0

    return Math.max(
      ...rewards.map((reward) => parsePositiveInteger(reward.pointsCost) ?? 0)
    )
  }, [rewards])

  function resetForm() {
    setEditingReward(null)
    setName("")
    setNameAr("")
    setDescription("")
    setDescriptionAr("")
    setPointsCost("")
    setDiscountType("FIXED_AMOUNT")
    setDiscountValue("")
    setMaxUses("1")
    setValidityDays("7")
    setIsActive(true)
    setRewardFormErrors({})
  }

  function fillFormFromReward(reward: LoyaltyReward) {
    setEditingReward(reward)
    setName(reward.name ?? "")
    setNameAr(reward.nameAr ?? "")
    setDescription(reward.description ?? "")
    setDescriptionAr(reward.descriptionAr ?? "")
    setPointsCost(String(reward.pointsCost ?? ""))
    setDiscountType(resolveDiscountType(reward.discountType))
    setDiscountValue(String(reward.discountValue ?? ""))
    setMaxUses(String(reward.maxUses ?? 1))
    setValidityDays(String(reward.validityDays ?? 7))
    setIsActive(Boolean(reward.isActive))
    setRewardFormErrors({})
    setRewardError("")
    setRewardMessage("")
  }

  function handleStartEdit(reward: LoyaltyReward) {
    fillFormFromReward(reward)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleCancelEdit() {
    resetForm()
    setRewardError("")
    setRewardMessage("")
  }

  async function handleSubmitReward(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRewardError("")
    setRewardMessage("")
    setRewardFormErrors({})

    const validation = loyaltyRewardSchema.safeParse({
      name,
      nameAr,
      description,
      descriptionAr,
      pointsCost,
      discountType,
      discountValue,
      maxUses,
      validityDays,
      isActive,
    })

    if (!validation.success) {
      setRewardFormErrors(loyaltyRewardZodErrorToFormErrors(validation.error))
      return
    }

    const payload = loyaltyRewardValuesToPayload(validation.data)

    try {
      if (isEditing) {
        if (!isValidUuid(editingReward.id)) {
          setRewardError(t("loyalty.invalidRewardId", { ns: "pages" }))
          return
        }

        await updateReward.mutateAsync({
          id: editingReward.id,
          data: payload,
        })

        resetForm()
        setRewardMessage(t("loyalty.updateSuccess", { ns: "pages" }))
      } else {
        await createReward.mutateAsync(payload)
        resetForm()
        setRewardMessage(t("loyalty.createSuccess", { ns: "pages" }))
        setRewardsPage(1)
      }
    } catch {
      setRewardError(
        isEditing
          ? t("loyalty.updateFailed", { ns: "pages" })
          : t("loyalty.createFailed", { ns: "pages" })
      )
    }
  }

  function handleToggleReward(reward: LoyaltyReward) {
    setRewardError("")
    setRewardMessage("")

    if (!isValidUuid(reward.id)) {
      setRewardError(t("loyalty.invalidRewardId", { ns: "pages" }))
      return
    }

    updateReward.mutate({
      id: reward.id,
      data: {
        pointsCost: reward.pointsCost,
        isActive: !reward.isActive,
      },
    })
  }

  function handleDeleteReward(id: string) {
    setRewardError("")
    setRewardMessage("")

    if (!isValidUuid(id)) {
      setRewardError(t("loyalty.invalidRewardId", { ns: "pages" }))
      return
    }

    const shouldDelete = window.confirm(
      t("loyalty.confirmDelete", { ns: "pages" })
    )

    if (!shouldDelete) return

    if (editingReward?.id === id) {
      resetForm()
    }

    deleteReward.mutate(id)
  }

  return (
    <div className="space-y-6 text-start text-[var(--erp-text)]">
      <header>
        <div className="flex items-center justify-end gap-2">
          <h1 className="text-3xl font-bold text-[var(--erp-text)]">
            {t("loyalty.title", { ns: "pages" })}
          </h1>

          <Gift className="size-7 text-[var(--erp-brand-solid)]" />
        </div>

        <p className="mt-1 text-sm text-[var(--erp-muted)]">
          {t("loyalty.subtitle", { ns: "pages" })}
        </p>
      </header>

      {!isLoading && !isError && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            label={t("loyalty.rewardsCount", { ns: "pages" })}
            value={formatNumber(rewardsData?.total ?? rewards.length)}
            icon={<Gift className="size-5" />}
          />

          <SummaryCard
            label={t("loyalty.activeRewardsPage", { ns: "pages" })}
            value={formatNumber(activeRewardsCount)}
            icon={<Star className="size-5" />}
          />

          <SummaryCard
            label={t("loyalty.highestPointsPage", { ns: "pages" })}
            value={formatNumber(highestPointsCost)}
            icon={<Plus className="size-5" />}
          />
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[var(--erp-text)]">
                {isEditing
                  ? t("loyalty.editReward", { ns: "pages" })
                  : t("loyalty.createReward", { ns: "pages" })}
              </h2>

              <p className="mt-1 text-sm text-[var(--erp-muted)]">
                {isEditing
                  ? t("loyalty.editSubtitle", { ns: "pages" })
                  : t("loyalty.createSubtitle", { ns: "pages" })}
              </p>
            </div>

            {isEditing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={handleCancelEdit}
              >
                <X className="size-3.5" />
                {t("cancel")}
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmitReward} className="space-y-4" noValidate>
            <div>
              <label htmlFor="loyalty-name" className={labelClass}>
                {t("loyalty.rewardName", { ns: "pages" })}
              </label>

              <input
                id="loyalty-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t("loyalty.namePlaceholder", { ns: "pages" })}
                className={inputClass}
              />

              {rewardFormErrors.name && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-300">
                  {rewardFormErrors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="loyalty-name-ar" className={labelClass}>
                {t("nameAr")}
              </label>

              <input
                id="loyalty-name-ar"
                value={nameAr}
                onChange={(event) => setNameAr(event.target.value)}
                className={inputClass}
              />

              {rewardFormErrors.nameAr && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-300">
                  {rewardFormErrors.nameAr}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="loyalty-description" className={labelClass}>
                {t("loyalty.descriptionOptional", { ns: "pages" })}
              </label>

              <textarea
                id="loyalty-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                placeholder={t("loyalty.descriptionPlaceholder", {
                  ns: "pages",
                })}
                className={inputClass}
              />

              {rewardFormErrors.description && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-300">
                  {rewardFormErrors.description}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="loyalty-description-ar" className={labelClass}>
                {t("descriptionAr")}
              </label>

              <textarea
                id="loyalty-description-ar"
                value={descriptionAr}
                onChange={(event) => setDescriptionAr(event.target.value)}
                rows={3}
                className={inputClass}
              />

              {rewardFormErrors.descriptionAr && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-300">
                  {rewardFormErrors.descriptionAr}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="loyalty-points-cost" className={labelClass}>
                {t("loyalty.pointsCost", { ns: "pages" })}
              </label>

              <input
                id="loyalty-points-cost"
                type="number"
                min={1}
                value={pointsCost}
                onChange={(event) => setPointsCost(event.target.value)}
                placeholder={t("loyalty.pointsPlaceholder", { ns: "pages" })}
                className={inputClass}
              />

              {rewardFormErrors.pointsCost && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-300">
                  {rewardFormErrors.pointsCost}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="loyalty-discount-type" className={labelClass}>
                  {t("loyalty.discountType", { ns: "pages" })}
                </label>

                <select
                  id="loyalty-discount-type"
                  value={discountType}
                  onChange={(event) =>
                    setDiscountType(event.target.value as LoyaltyDiscountType)
                  }
                  className={inputClass}
                >
                  {LOYALTY_DISCOUNT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {discountTypeLabel(type, t)}
                    </option>
                  ))}
                </select>

                {rewardFormErrors.discountType && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-300">
                    {rewardFormErrors.discountType}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="loyalty-discount-value" className={labelClass}>
                  {t("loyalty.discountValue", { ns: "pages" })}
                </label>

                <input
                  id="loyalty-discount-value"
                  type="number"
                  min={0}
                  step="0.01"
                  value={discountValue}
                  onChange={(event) => setDiscountValue(event.target.value)}
                  placeholder={
                    discountType === "PERCENTAGE"
                      ? t("loyalty.percentPlaceholder", { ns: "pages" })
                      : t("loyalty.amountPlaceholder", { ns: "pages" })
                  }
                  className={inputClass}
                />

                {rewardFormErrors.discountValue && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-300">
                    {rewardFormErrors.discountValue}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="loyalty-max-uses" className={labelClass}>
                  {t("loyalty.maxUses", { ns: "pages" })}
                </label>

                <input
                  id="loyalty-max-uses"
                  type="number"
                  min={1}
                  value={maxUses}
                  onChange={(event) => setMaxUses(event.target.value)}
                  className={inputClass}
                />

                {rewardFormErrors.maxUses && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-300">
                    {rewardFormErrors.maxUses}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="loyalty-validity-days" className={labelClass}>
                  {t("loyalty.validityDays", { ns: "pages" })}
                </label>

                <input
                  id="loyalty-validity-days"
                  type="number"
                  min={1}
                  value={validityDays}
                  onChange={(event) => setValidityDays(event.target.value)}
                  className={inputClass}
                />

                {rewardFormErrors.validityDays && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-300">
                    {rewardFormErrors.validityDays}
                  </p>
                )}
              </div>
            </div>

            <label className="flex items-center justify-end gap-2 text-sm text-[var(--erp-text)]">
              <span>{t("loyalty.rewardActive", { ns: "pages" })}</span>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="size-4 accent-[var(--erp-brand-solid)]"
              />
            </label>

            {rewardMessage && (
              <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                {rewardMessage}
              </p>
            )}

            {rewardError && (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
                {rewardError}
              </p>
            )}

            <Button type="submit" className="w-full gap-2" disabled={isSaving}>
              {isEditing ? (
                <Pencil className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
              {isSaving
                ? isEditing
                  ? t("saving")
                  : t("loyalty.creating", { ns: "pages" })
                : isEditing
                  ? t("saveChanges")
                  : t("loyalty.createRewardButton", { ns: "pages" })}
            </Button>
          </form>
        </section>

        <RewardsTable
          rewards={rewards}
          isLoading={isLoading}
          isError={isError}
          isUpdating={updateReward.isPending}
          isDeleting={deleteReward.isPending}
          editingId={editingReward?.id}
          page={rewardsPage}
          isFinalPage={rewardsData?.isFinalPage ?? true}
          isFetching={rewardsFetching}
          total={rewardsData?.total}
          onPrevious={() =>
            setRewardsPage((current) => Math.max(1, current - 1))
          }
          onNext={() => setRewardsPage((current) => current + 1)}
          onEditReward={handleStartEdit}
          onToggleReward={handleToggleReward}
          onDeleteReward={handleDeleteReward}
        />
      </section>
    </div>
  )
}

function RewardsTable({
  rewards,
  isLoading,
  isError,
  isUpdating,
  isDeleting,
  editingId,
  page,
  isFinalPage,
  isFetching,
  total,
  onPrevious,
  onNext,
  onEditReward,
  onToggleReward,
  onDeleteReward,
}: {
  rewards: LoyaltyReward[]
  isLoading: boolean
  isError: boolean
  isUpdating: boolean
  isDeleting: boolean
  editingId?: string
  page: number
  isFinalPage: boolean
  isFetching: boolean
  total?: number
  onPrevious: () => void
  onNext: () => void
  onEditReward: (reward: LoyaltyReward) => void
  onToggleReward: (reward: LoyaltyReward) => void
  onDeleteReward: (id: string) => void
}) {
  const { t } = useTranslation(["common", "pages"])
  const { language } = useLocale()

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-muted)] shadow-[var(--erp-shadow)]">
        {t("loyalty.loadingRewards", { ns: "pages" })}
      </section>
    )
  }

  if (isError) {
    return (
      <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-700 shadow-[var(--erp-shadow)] dark:bg-red-500/15 dark:text-red-300">
        {t("loyalty.loadRewardsFailed", { ns: "pages" })}
      </section>
    )
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div>
        <h2 className="text-xl font-semibold text-[var(--erp-text)]">
          {t("loyalty.rewardsList", { ns: "pages" })}
        </h2>

        <p className="mt-1 text-sm text-[var(--erp-muted)]">
          {t("resultCountTotal", {
            count: formatNumber(rewards.length),
            total:
              total != null
                ? formatNumber(total)
                : formatNumber(rewards.length),
          })}
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--erp-border)]">
        <table className="w-full min-w-[920px] table-fixed text-start text-sm">
          <colgroup>
            <col className="w-[20%]" />
            <col className="w-[10%]" />
            <col className="w-[14%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[26%]" />
          </colgroup>

          <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
            <tr>
              <th className="px-3 py-3 font-medium">{t("name")}</th>
              <th className="px-3 py-3 font-medium">{t("points")}</th>
              <th className="px-3 py-3 font-medium">{t("discount")}</th>
              <th className="px-3 py-3 font-medium">{t("usage")}</th>
              <th className="px-3 py-3 font-medium">{t("validity")}</th>
              <th className="px-3 py-3 text-center font-medium">
                {t("status")}
              </th>
              <th className="px-3 py-3 text-center font-medium">
                {t("operations")}
              </th>
            </tr>
          </thead>

          <tbody>
            {rewards.map((reward) => (
              <tr
                key={reward.id}
                className={`border-b border-[var(--erp-border)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)] ${
                  editingId === reward.id
                    ? "bg-[color-mix(in_srgb,var(--erp-brand-solid)_8%,var(--erp-bg))]"
                    : ""
                }`}
              >
                <td className="px-3 py-3">
                  <p className="truncate font-medium text-[var(--erp-text)]">
                    {localizedName(reward, language)}
                  </p>
                  {localizedDescription(reward, language) ? (
                    <p className="mt-1 truncate text-xs text-[var(--erp-muted)]">
                      {localizedDescription(reward, language)}
                    </p>
                  ) : null}
                </td>

                <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                  {formatNumber(reward.pointsCost)}
                </td>

                <td className="px-3 py-3 text-[var(--erp-text)]">
                  <span className="block truncate">
                    {formatDiscountValue(
                      reward.discountType,
                      reward.discountValue
                    )}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--erp-muted)]">
                    {discountTypeLabel(reward.discountType, t)}
                  </span>
                </td>

                <td className="px-3 py-3 text-[var(--erp-muted)]">
                  {formatNumber(reward.maxUses)}
                </td>

                <td className="px-3 py-3 text-[var(--erp-muted)]">
                  {t("daysCount", { count: formatNumber(reward.validityDays) })}
                </td>

                <td className="px-3 py-3">
                  <div className="flex justify-center">
                    <StatusBadge active={reward.isActive} />
                  </div>
                </td>

                <td className="px-3 py-3">
                  <div className="flex flex-wrap justify-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => onEditReward(reward)}
                    >
                      <Pencil className="size-3.5" />
                      {t("edit")}
                    </Button>

                    <Button
                      variant={reward.isActive ? "destructive" : "success"}
                      size="sm"
                      disabled={isUpdating}
                      onClick={() => onToggleReward(reward)}
                    >
                      {reward.isActive ? t("disable") : t("enable")}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isDeleting}
                      onClick={() => onDeleteReward(reward.id)}
                      className="gap-1"
                    >
                      <Trash2 className="size-3.5" />
                      {t("delete")}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {rewards.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-[var(--erp-muted)]"
                >
                  {t("loyalty.noRewards", { ns: "pages" })}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        page={page}
        isFinalPage={isFinalPage}
        isLoading={isFetching}
        total={total}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </section>
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

function StatusBadge({ active }: { active: boolean }) {
  const { t } = useTranslation("common")

  return (
    <span
      className={
        active
          ? "rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-500/15 dark:text-red-300"
      }
    >
      {active ? t("active") : t("inactive")}
    </span>
  )
}
