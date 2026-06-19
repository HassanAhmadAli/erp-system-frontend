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
  return toEnglishDigits(value)
    .trim()
    .replace(/[٬,]/g, "")
    .replace(/٫/g, ".")
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

export function formatDate(value: string | Date | null | undefined) {
  if (!value) {
    return "—"
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return toEnglishDigits(
    date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  )
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) {
    return "—"
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return toEnglishDigits(
    date.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  )
}

export function formatTime(value: string | Date | null | undefined) {
  if (!value) {
    return "—"
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return toEnglishDigits(
    date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  )
}