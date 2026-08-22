import { toEnglishDigits } from "@/utils/number-formatters"

export type CsvValue = string | number | boolean | null | undefined

function escapeCsvValue(value: CsvValue) {
  if (value === null || value === undefined) {
    return ""
  }

  const text = toEnglishDigits(String(value))

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

export function toCsv(rows: CsvValue[][]) {
  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\r\n")
}

export function downloadCsv(filename: string, rows: CsvValue[][]) {
  const csv = `\uFEFF${toCsv(rows)}`
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function csvNumber(value: CsvValue) {
  if (value === null || value === undefined || value === "") {
    return ""
  }

  const normalized = toEnglishDigits(String(value))
    .trim()
    .replace(/[٬,]/g, "")
    .replace(/٫/g, ".")
  const numberValue = Number(normalized)

  return Number.isNaN(numberValue)
    ? toEnglishDigits(String(value))
    : String(numberValue)
}
