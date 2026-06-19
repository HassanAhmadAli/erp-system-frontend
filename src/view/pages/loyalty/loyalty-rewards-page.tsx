import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react"
import { Gift, Plus, Settings, Star, Trash2 } from "lucide-react"

import {
  useCreateLoyaltyReward,
  useDeleteLoyaltyReward,
  useLoyaltyPolicy,
  useLoyaltyRewards,
  useUpdateLoyaltyPolicy,
  useUpdateLoyaltyReward,
} from "@/hooks/Loyalty/useLoyaltyRewards"
import { formatNumber } from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"

const inputClass =
  "w-full rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] px-4 py-2.5 text-right text-sm text-[var(--erp-text)] outline-none transition placeholder:text-[var(--erp-muted)] focus:border-[var(--erp-brand-solid)] focus:ring-2 focus:ring-[var(--erp-brand-solid)]/20"

const labelClass = "mb-2 block text-sm font-medium text-[var(--erp-text)]"

function formatSyp(value: string | number) {
  return `${formatNumber(value)} SYP`
}

export function LoyaltyRewardsPage() {
  const { data: policy, isLoading: policyLoading } = useLoyaltyPolicy()
  const updatePolicy = useUpdateLoyaltyPolicy()

  const { data: rewards = [], isLoading, isError } = useLoyaltyRewards()
  const createReward = useCreateLoyaltyReward()
  const updateReward = useUpdateLoyaltyReward()
  const deleteReward = useDeleteLoyaltyReward()

  const [pointsPerCurrency, setPointsPerCurrency] = useState("")
  const [currencyPerPoint, setCurrencyPerPoint] = useState("")
  const [policyMessage, setPolicyMessage] = useState("")
  const [policyError, setPolicyError] = useState("")

  const [threshold, setThreshold] = useState("")
  const [description, setDescription] = useState("")
  const [discountValue, setDiscountValue] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [rewardError, setRewardError] = useState("")

  useEffect(() => {
    if (!policy) return

    setPointsPerCurrency(String(policy.pointsPerCurrency ?? ""))
    setCurrencyPerPoint(String(policy.currencyPerPoint ?? ""))
  }, [policy])

  const activeRewardsCount = useMemo(
    () => rewards.filter((reward) => reward.isActive).length,
    [rewards]
  )

  const highestThreshold = useMemo(() => {
    if (rewards.length === 0) return 0

    return Math.max(
      ...rewards.map((reward) => Number(reward.pointsThreshold) || 0)
    )
  }, [rewards])

  async function handlePolicySave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPolicyMessage("")
    setPolicyError("")

    const parsedPointsPerCurrency = Number(pointsPerCurrency)
    const parsedCurrencyPerPoint = Number(currencyPerPoint)

    if (
      !Number.isFinite(parsedPointsPerCurrency) ||
      parsedPointsPerCurrency <= 0
    ) {
      setPolicyError("نقاط كل عملة يجب أن تكون أكبر من صفر")
      return
    }

    if (!Number.isFinite(parsedCurrencyPerPoint) || parsedCurrencyPerPoint <= 0) {
      setPolicyError("قيمة كل نقطة يجب أن تكون أكبر من صفر")
      return
    }

    try {
      await updatePolicy.mutateAsync({
        pointsPerCurrency: parsedPointsPerCurrency,
        currencyPerPoint: parsedCurrencyPerPoint,
      })

      setPolicyMessage("تم حفظ سياسة النقاط بنجاح")
    } catch {
      setPolicyError("فشل تحديث السياسة")
    }
  }

  async function handleCreateReward(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRewardError("")

    const parsedThreshold = Number(threshold)
    const parsedDiscountValue = Number(discountValue)

    if (!Number.isFinite(parsedThreshold) || parsedThreshold <= 0) {
      setRewardError("حد النقاط يجب أن يكون أكبر من صفر")
      return
    }

    if (!description.trim()) {
      setRewardError("وصف المكافأة مطلوب")
      return
    }

    if (!Number.isFinite(parsedDiscountValue) || parsedDiscountValue <= 0) {
      setRewardError("قيمة الخصم يجب أن تكون أكبر من صفر")
      return
    }

    try {
      await createReward.mutateAsync({
        pointsThreshold: parsedThreshold,
        rewardDescription: description.trim(),
        discountValue: parsedDiscountValue,
        isActive,
      })

      setThreshold("")
      setDescription("")
      setDiscountValue("")
      setIsActive(true)
    } catch {
      setRewardError("فشل إنشاء المكافأة")
    }
  }

  function handleToggleReward(id: string, currentStatus: boolean) {
    updateReward.mutate({
      id,
      data: { isActive: !currentStatus },
    })
  }

  function handleDeleteReward(id: string) {
    const shouldDelete = window.confirm("هل أنت متأكد من حذف هذه المكافأة؟")

    if (!shouldDelete) return

    deleteReward.mutate(id)
  }

  return (
    <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <header>
        <div className="flex items-center justify-end gap-2">
          <h1 className="text-3xl font-bold text-[var(--erp-text)]">
            مكافآت الولاء
          </h1>

          <Gift className="size-7 text-[var(--erp-brand-solid)]" />
        </div>

        <p className="mt-1 text-sm text-[var(--erp-muted)]">
          إدارة سياسة النقاط والمكافآت التي يحصل عليها العملاء.
        </p>
      </header>

      {!isLoading && !isError && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            label="عدد المكافآت"
            value={formatNumber(rewards.length)}
            icon={<Gift className="size-5" />}
          />

          <SummaryCard
            label="المكافآت النشطة"
            value={formatNumber(activeRewardsCount)}
            icon={<Star className="size-5" />}
          />

          <SummaryCard
            label="أعلى حد نقاط"
            value={formatNumber(highestThreshold)}
            icon={<Settings className="size-5" />}
          />
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-[var(--erp-text)]">
              سياسة النقاط
            </h2>

            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              حدد كيف يتم تحويل المشتريات إلى نقاط وكيف يتم حساب قيمة النقطة.
            </p>
          </div>

          {policyLoading ? (
            <p className="text-sm text-[var(--erp-muted)]">جاري التحميل...</p>
          ) : (
            <form onSubmit={handlePolicySave} className="space-y-4">
              <div>
                <label htmlFor="points-per-currency" className={labelClass}>
                  نقاط لكل عملة
                </label>

                <input
                  id="points-per-currency"
                  type="number"
                  value={pointsPerCurrency}
                  onChange={(event) => setPointsPerCurrency(event.target.value)}
                  placeholder="مثال: 1"
                  className={inputClass}
                />

                <p className="mt-1 text-xs text-[var(--erp-muted)]">
                  مثال: كل 1 SYP يعطي 1 نقطة.
                </p>
              </div>

              <div>
                <label htmlFor="currency-per-point" className={labelClass}>
                  قيمة كل نقطة
                </label>

                <input
                  id="currency-per-point"
                  type="number"
                  value={currencyPerPoint}
                  onChange={(event) => setCurrencyPerPoint(event.target.value)}
                  placeholder="مثال: 10"
                  className={inputClass}
                />

                <p className="mt-1 text-xs text-[var(--erp-muted)]">
                  مثال: كل نقطة تساوي 10 SYP عند الاستبدال.
                </p>
              </div>

              {policyError && (
                <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
                  {policyError}
                </p>
              )}

              {policyMessage && (
                <p className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  {policyMessage}
                </p>
              )}

              <div className="flex justify-end border-t border-[var(--erp-border)] pt-4">
                <Button type="submit" disabled={updatePolicy.isPending}>
                  {updatePolicy.isPending ? "جاري الحفظ..." : "حفظ السياسة"}
                </Button>
              </div>
            </form>
          )}
        </section>

        <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-[var(--erp-text)]">
              إضافة مكافأة
            </h2>

            <p className="mt-1 text-sm text-[var(--erp-muted)]">
              أنشئ مكافأة جديدة يحصل عليها العميل عند الوصول إلى حد معين من
              النقاط.
            </p>
          </div>

          <form onSubmit={handleCreateReward} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="reward-threshold" className={labelClass}>
                  حد النقاط
                </label>

                <input
                  id="reward-threshold"
                  type="number"
                  placeholder="مثال: 1000"
                  className={inputClass}
                  value={threshold}
                  onChange={(event) => setThreshold(event.target.value)}
                />
              </div>

              <div>
                <label htmlFor="reward-discount" className={labelClass}>
                  قيمة الخصم
                </label>

                <input
                  id="reward-discount"
                  type="number"
                  placeholder="مثال: 5000"
                  className={inputClass}
                  value={discountValue}
                  onChange={(event) => setDiscountValue(event.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="reward-description" className={labelClass}>
                  وصف المكافأة
                </label>

                <input
                  id="reward-description"
                  placeholder="مثال: خصم عند الوصول إلى 1000 نقطة"
                  className={inputClass}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
            </div>

            <label className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--erp-border)] bg-[var(--erp-bg)] p-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-[var(--erp-text)]">
                  تفعيل المكافأة
                </p>

                <p className="mt-1 text-xs text-[var(--erp-muted)]">
                  المكافأة ستكون متاحة للعملاء فور إنشائها.
                </p>
              </div>

              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="size-5 accent-[var(--erp-brand-solid)]"
              />
            </label>

            {rewardError && (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:bg-red-500/15 dark:text-red-300">
                {rewardError}
              </p>
            )}

            <div className="flex justify-end border-t border-[var(--erp-border)] pt-4">
              <Button
                type="submit"
                disabled={createReward.isPending}
                className="gap-2"
              >
                <Plus className="size-4" />
                {createReward.isPending ? "جاري الإضافة..." : "إضافة مكافأة"}
              </Button>
            </div>
          </form>
        </section>
      </section>

      <RewardsTable
        rewards={rewards}
        isLoading={isLoading}
        isError={isError}
        isUpdating={updateReward.isPending}
        isDeleting={deleteReward.isPending}
        onToggleReward={handleToggleReward}
        onDeleteReward={handleDeleteReward}
      />
    </div>
  )
}

function RewardsTable({
  rewards,
  isLoading,
  isError,
  isUpdating,
  isDeleting,
  onToggleReward,
  onDeleteReward,
}: {
  rewards: Array<{
    id: string
    pointsThreshold: number | string
    rewardDescription: string
    discountValue: number | string
    isActive: boolean
  }>
  isLoading: boolean
  isError: boolean
  isUpdating: boolean
  isDeleting: boolean
  onToggleReward: (id: string, currentStatus: boolean) => void
  onDeleteReward: (id: string) => void
}) {
  if (isLoading) {
    return (
      <section className="rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-muted)] shadow-[var(--erp-shadow)]">
        جاري تحميل المكافآت...
      </section>
    )
  }

  if (isError) {
    return (
      <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-700 shadow-[var(--erp-shadow)] dark:bg-red-500/15 dark:text-red-300">
        حدث خطأ أثناء تحميل المكافآت
      </section>
    )
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-6 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <div>
        <h2 className="text-xl font-semibold text-[var(--erp-text)]">
          قائمة المكافآت
        </h2>

        <p className="mt-1 text-sm text-[var(--erp-muted)]">
          عدد المكافآت: {formatNumber(rewards.length)}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--erp-border)]">
        <table className="w-full table-fixed text-right text-sm">
          <colgroup>
            <col className="w-[16%]" />
            <col className="w-[36%]" />
            <col className="w-[16%]" />
            <col className="w-[14%]" />
            <col className="w-[18%]" />
          </colgroup>

          <thead className="border-b border-[var(--erp-border)] bg-[var(--erp-bg)] text-[var(--erp-muted)]">
            <tr>
              <th className="px-3 py-3 font-medium">حد النقاط</th>
              <th className="px-3 py-3 font-medium">الوصف</th>
              <th className="px-3 py-3 font-medium">الخصم</th>
              <th className="px-3 py-3 text-center font-medium">الحالة</th>
              <th className="px-3 py-3 text-center font-medium">العمليات</th>
            </tr>
          </thead>

          <tbody>
            {rewards.map((reward) => (
              <tr
                key={reward.id}
                className="border-b border-[var(--erp-border)] transition-colors last:border-b-0 hover:bg-[var(--erp-bg)]"
              >
                <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                  {formatNumber(reward.pointsThreshold)}
                </td>

                <td className="px-3 py-3 text-[var(--erp-text)]">
                  <span className="block truncate">
                    {reward.rewardDescription}
                  </span>
                </td>

                <td className="px-3 py-3 font-medium text-[var(--erp-text)]">
                  {formatSyp(reward.discountValue)}
                </td>

                <td className="px-3 py-3">
                  <div className="flex justify-center">
                    <StatusBadge active={reward.isActive} />
                  </div>
                </td>

                <td className="px-3 py-3">
                  <div className="flex flex-wrap justify-center gap-1.5">
                    <Button
                      variant={reward.isActive ? "destructive" : "success"}
                      size="sm"
                      disabled={isUpdating}
                      onClick={() =>
                        onToggleReward(reward.id, reward.isActive)
                      }
                    >
                      {reward.isActive ? "تعطيل" : "تفعيل"}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isDeleting}
                      onClick={() => onDeleteReward(reward.id)}
                      className="gap-1"
                    >
                      <Trash2 className="size-3.5" />
                      حذف
                    </Button>
                  </div>
                </td>
              </tr>
            ))}

            {rewards.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-[var(--erp-muted)]"
                >
                  لا توجد مكافآت
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
  return (
    <span
      className={
        active
          ? "rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-500/15 dark:text-red-300"
      }
    >
      {active ? "نشط" : "غير نشط"}
    </span>
  )
}