import { useTranslation } from "react-i18next"

const bars = [0.68, 0.52, 0.62, 0.56, 0.73, 0.58, 0.51]
const dayKeys = ["fri", "thu", "wed", "tue", "mon", "sun", "sat"] as const

export function SalesChartCard() {
  const { t } = useTranslation(["common", "pages"])

  return (
    <section className="rounded-[20px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <h3 className="mb-6 text-center text-xl font-bold">
        {t("overview.salesChart", { ns: "pages" })}
      </h3>

      <div className="overflow-x-auto">
        <div className="grid min-w-[420px] grid-cols-7 items-end gap-3">
          {bars.map((height, index) => (
            <div
              key={dayKeys[index]}
              className="flex flex-col items-center gap-3"
            >
              <div
                className="w-8 rounded-full bg-[var(--erp-brand-solid)]"
                style={{ height: `${Math.round(height * 200)}px` }}
              />

              <span className="text-xs font-medium text-[var(--erp-muted)]">
                {t(`overview.weekdays.${dayKeys[index]}`, { ns: "pages" })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
