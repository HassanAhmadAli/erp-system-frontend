export function toEnglishDigits(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return ""
  }

  return String(value)
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
}

export function formatId(value: string | number) {
  return toEnglishDigits(value)
}

export function formatNumber(value: number | string) {
  const englishValue = toEnglishDigits(value)
  const numberValue = Number(englishValue)

  if (Number.isNaN(numberValue)) {
    return englishValue
  }

  return new Intl.NumberFormat("en-US", {
    numberingSystem: "latn",
    maximumFractionDigits: 2,
  }).format(numberValue)
}

export function formatPrice(value: number | string) {
  return formatNumber(value)
}

export function formatCurrency(value: number | string) {
  return `${formatPrice(value)} SYP`
}

export function getProductPrice(product: { sellingPrice: number | string }) {
  const price = Number(toEnglishDigits(product.sellingPrice))

  if (Number.isNaN(price)) {
    return 0
  }

  return price
}
