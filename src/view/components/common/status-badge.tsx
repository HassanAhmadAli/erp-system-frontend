import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"

export type StockStatusKey = "inStock" | "lowStock" | "outOfStock"

const LEGACY_STATUS_MAP: Record<string, StockStatusKey> = {
  inStock: "inStock",
  lowStock: "lowStock",
  outOfStock: "outOfStock",
  "\u0645\u062a\u0648\u0641\u0631": "inStock",
  "\u0645\u0646\u062e\u0641\u0636": "lowStock",
  "\u0646\u0627\u0641\u062f": "outOfStock",
}

const styles: Record<StockStatusKey, string> = {
  inStock:
    "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  lowStock:
    "border border-amber-500/20 bg-amber-500/15 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  outOfStock:
    "border border-red-500/20 bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300",
}

const labelKeys: Record<StockStatusKey, string> = {
  inStock: "inStock",
  lowStock: "lowStock",
  outOfStock: "outOfStock",
}

function normalizeStatus(status: string): StockStatusKey {
  return LEGACY_STATUS_MAP[status] ?? "inStock"
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation("common")
  const key = normalizeStatus(status)

  return (
    <span
      className={cn(
        "inline-flex min-w-16 items-center justify-center rounded-full px-3 py-1 text-xs font-semibold",
        styles[key]
      )}
    >
      {t(labelKeys[key])}
    </span>
  )
}
