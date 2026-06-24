const bars = [0.68, 0.52, 0.62, 0.56, 0.73, 0.58, 0.51]
const days = ["جمعة", "الخميس", "أربعاء", "ثلاثاء", "الإثنين", "أحد", "السبت"]

export function SalesChartCard() {
  return (
    <section className="rounded-[20px] border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 text-[var(--erp-text)] shadow-[var(--erp-shadow)]">
      <h3 className="mb-6 text-center text-xl font-bold">مخطط المبيعات</h3>

      <div className="grid grid-cols-7 items-end gap-3">
        {bars.map((height, index) => (
          <div key={days[index]} className="flex flex-col items-center gap-3">
            <div
              className="w-8 rounded-full bg-[var(--erp-brand-solid)]"
              style={{ height: `${Math.round(height * 200)}px` }}
            />

            <span className="text-xs font-medium text-[var(--erp-muted)]">
              {days[index]}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
