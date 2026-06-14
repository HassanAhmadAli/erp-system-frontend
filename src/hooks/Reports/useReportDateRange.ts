import { useMemo, useState } from "react"

import { toApiDateRange } from "@/lib/report-parsers"

export function useReportDateRange() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const range = useMemo(() => toApiDateRange(from, to), [from, to])

  return { from, to, setFrom, setTo, range }
}
