import { formatNumber } from "@/utils/number-formatters"
import { Button } from "@/view/components/ui/button"

type PaginationControlsProps = {
  page: number
  isFinalPage: boolean
  isLoading?: boolean
  total?: number
  onPrevious: () => void
  onNext: () => void
}

export function PaginationControls({
  page,
  isFinalPage,
  isLoading = false,
  total,
  onPrevious,
  onNext,
}: PaginationControlsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Button
        type="button"
        variant="outline"
        disabled={page <= 1 || isLoading}
        onClick={onPrevious}
      >
        السابق
      </Button>

      <span className="text-center text-sm text-[var(--erp-muted)]">
        صفحة {formatNumber(page)}
        {total != null ? ` · الإجمالي ${formatNumber(total)}` : ""}
      </span>

      <Button
        type="button"
        variant="outline"
        disabled={isFinalPage || isLoading}
        onClick={onNext}
      >
        التالي
      </Button>
    </div>
  )
}
