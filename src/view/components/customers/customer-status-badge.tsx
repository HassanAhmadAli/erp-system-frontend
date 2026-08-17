import { useTranslation } from "react-i18next"

export function CustomerStatusBadge({ isActive }: { isActive: boolean }) {
  const { t } = useTranslation("common")

  return (
    <span
      className={
        isActive
          ? "rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-500/15 dark:text-red-300"
      }
    >
      {isActive ? t("active") : t("inactive")}
    </span>
  )
}
