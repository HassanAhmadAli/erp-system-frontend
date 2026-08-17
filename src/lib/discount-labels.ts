import type { TFunction } from "i18next"

import type { DiscountScope, DiscountType } from "@/services/discount-service"
import { formatNumber } from "@/utils/number-formatters"

export function getDiscountTypeLabel(type: DiscountType, t: TFunction) {
  return type === "PERCENTAGE"
    ? t("common:percentage")
    : t("common:fixedAmount")
}

export function getDiscountScopeLabel(scope: DiscountScope, t: TFunction) {
  const labels: Record<DiscountScope, string> = {
    GLOBAL: t("common:global"),
    CATEGORY: t("common:scopeCategoryShort"),
    PRODUCT: t("common:scopeProductShort"),
  }

  return labels[scope]
}

export function formatDiscountValue(type: DiscountType, value: string) {
  const formattedValue = formatNumber(value)

  return type === "PERCENTAGE" ? `${formattedValue}%` : `${formattedValue} SYP`
}
