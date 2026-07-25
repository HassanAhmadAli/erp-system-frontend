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
    <div className="space-y-6 text-right text-[var(--erp-text)]" dir="rtl">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          {backTo && (
            <Link
              to={backTo}
              className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-[var(--erp-muted)] transition hover:text-[var(--erp-brand-solid)]"
            >
              <ArrowRight className="size-4" />
              {backLabel}
            </Link>
          )}

          <h1 className="text-3xl font-bold text-[var(--erp-text)]">{title}</h1>

          <p className="mt-1 text-sm text-[var(--erp-muted)]">{description}</p>
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </header>

      {filters}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-12 text-sm text-[var(--erp-muted)] shadow-[var(--erp-shadow)]">
          <Loader2 className="size-5 animate-spin text-[var(--erp-brand-solid)]" />
          جاري تحميل التقرير...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-center text-sm text-red-700 shadow-[var(--erp-shadow)] dark:bg-red-500/15 dark:text-red-300">
          {errorMessage}
        </div>
      ) : (
        <div className="space-y-6">{children}</div>
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
      className="group rounded-3xl border border-[var(--erp-border)] bg-[var(--erp-card)] p-5 shadow-[var(--erp-shadow)] transition hover:border-[var(--erp-brand-solid)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-right">
          <h2 className="text-lg font-semibold text-[var(--erp-text)] transition group-hover:text-[var(--erp-brand-solid)]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[var(--erp-muted)]">{description}</p>
        </div>

        <div className="rounded-2xl bg-[var(--erp-nav-active-bg)] p-3 text-[var(--erp-brand-solid)]">
          <Icon className="size-5" />
        </div>
      </div>
    </Link>
  )
}
