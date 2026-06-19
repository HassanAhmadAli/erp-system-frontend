type FormatValue = string | number | null | undefined

export function toEnglishDigits(value: FormatValue) {
  if (value === null || value === undefined) {
    return ""
  }

  return String(value)
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
}

function normalizeNumericValue(value: FormatValue) {
  return toEnglishDigits(value).trim().replace(/[٬,]/g, "").replace(/٫/g, ".")
}

export function formatId(value: FormatValue) {
  return toEnglishDigits(value)
}

export function formatNumber(value: FormatValue) {
  const englishValue = normalizeNumericValue(value)

  if (!englishValue) {
    return ""
  }

  const numberValue = Number(englishValue)

  if (Number.isNaN(numberValue)) {
    return toEnglishDigits(value)
  }

  return new Intl.NumberFormat("en-US", {
    numberingSystem: "latn",
    maximumFractionDigits: 2,
  }).format(numberValue)
}

export function formatInteger(value: FormatValue) {
  const englishValue = normalizeNumericValue(value)

  if (!englishValue) {
    return ""
  }

  const numberValue = Number(englishValue)

  if (Number.isNaN(numberValue)) {
    return toEnglishDigits(value)
  }

  return new Intl.NumberFormat("en-US", {
    numberingSystem: "latn",
    maximumFractionDigits: 0,
  }).format(numberValue)
}

export function formatPrice(value: FormatValue) {
  const englishValue = normalizeNumericValue(value)

  if (!englishValue) {
    return "0"
  }

  const numberValue = Number(englishValue)

  if (Number.isNaN(numberValue)) {
    return toEnglishDigits(value)
  }

  return new Intl.NumberFormat("en-US", {
    numberingSystem: "latn",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numberValue)
}

export function formatCurrency(value: FormatValue) {
  return `${formatPrice(value)} SYP`
}

export function getProductPrice(product: { sellingPrice: FormatValue }) {
  const price = Number(normalizeNumericValue(product.sellingPrice))

  if (Number.isNaN(price)) {
    return 0
  }

  return price
}

function padDatePart(value: number) {
  return String(value).padStart(2, "0")
}

function parseDateValue(value: string | Date | null | undefined) {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  /**
   * Handles date-only strings like "2026-06-19" as local dates
   * instead of letting JS parse them as UTC.
   */
  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch
    const localDate = new Date(Number(year), Number(month) - 1, Number(day))

    return Number.isNaN(localDate.getTime()) ? null : localDate
  }

  /**
   * For ISO strings with time, JS automatically converts them
   * to the browser/local PC timezone.
   */
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

function getTwoDigitYear(date: Date) {
  return String(date.getFullYear()).slice(-2)
}

export function formatDate(value: string | Date | null | undefined) {
  const date = parseDateValue(value)

  if (!date) {
    return "—"
  }

  const day = padDatePart(date.getDate())
  const month = padDatePart(date.getMonth() + 1)
  const year = getTwoDigitYear(date)

  return toEnglishDigits(`${day}/${month}/${year}`)
}

export function formatDateTime(value: string | Date | null | undefined) {
  const date = parseDateValue(value)

  if (!date) {
    return "—"
  }

  const day = padDatePart(date.getDate())
  const month = padDatePart(date.getMonth() + 1)
  const year = getTwoDigitYear(date)
  const hours = padDatePart(date.getHours())
  const minutes = padDatePart(date.getMinutes())

  return toEnglishDigits(`${day}/${month}/${year} ${hours}:${minutes}`)
}

export function formatTime(value: string | Date | null | undefined) {
  const date = parseDateValue(value)

  if (!date) {
    return "—"
  }

  const hours = padDatePart(date.getHours())
  const minutes = padDatePart(date.getMinutes())

  return toEnglishDigits(`${hours}:${minutes}`)
}
