import type { ComponentType, ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Loader2 } from "lucide-react"

type ReportLayoutProps = {
  title: string
  description: string
  backTo?: string
  backLabel?: string
  actions?: ReactNode
  filters?: ReactNode
  loading?: boolean
  error?: boolean
  errorMessage?: string
  children: ReactNode
}

export function ReportLayout({
  title,
  description,
  backTo,
  backLabel = "رجوع",
  actions,
  filters,
  loading,
  error,
  errorMessage = "تعذر تحميل البيانات. تحقق من الاتصال بالخادم.",
  children,
}: ReportLayoutProps) {
  return (
    <div className="space-y-6" dir="rtl">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="text-right">
          {backTo && (
            <Link
              to={backTo}
              className="mb-2 inline-flex items-center gap-1 text-sm text-[var(--erp-muted)] hover:text-[var(--erp-brand)]"
            >
              <ArrowRight className="size-4" />
              {backLabel}
            </Link>
          )}
          <h1 className="text-2xl font-bold text-[var(--erp-text)]">{title}</h1>
          <p className="mt-1 text-sm text-[var(--erp-muted)]">{description}</p>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </header>

      {filters}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border bg-[var(--erp-card)] p-12 text-[var(--erp-muted)]">
          <Loader2 className="size-5 animate-spin" />
          جاري تحميل التقرير...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
          {errorMessage}
        </div>
      ) : (
        children
      )}
    </div>
  )
}

export function ReportHubCard({
  title,
  description,
  to,
  icon: Icon,
}: {
  title: string
  description: string
  to: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <Link
      to={to}
      className="group rounded-[20px] border border-transparent bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)] transition hover:border-[var(--erp-brand)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-right">
          <h2 className="text-lg font-semibold text-[var(--erp-text)] group-hover:text-[var(--erp-brand)]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[var(--erp-muted)]">{description}</p>
        </div>
        <div className="rounded-2xl bg-[var(--erp-nav-active-bg)] p-3 text-[var(--erp-brand)]">
          <Icon className="size-5" />
        </div>
      </div>
    </Link>
  )
}
