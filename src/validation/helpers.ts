export type FormErrorMap<TField extends string = string> = Partial<
    Record<TField, string>
>

const EASTERN_ARABIC_DIGITS: Record<string, string> = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
}

const PERSIAN_DIGITS: Record<string, string> = {
    "۰": "0",
    "۱": "1",
    "۲": "2",
    "۳": "3",
    "۴": "4",
    "۵": "5",
    "۶": "6",
    "۷": "7",
    "۸": "8",
    "۹": "9",
}

export function toEnglishDigits(value: string) {
    return value.replace(/[٠-٩۰-۹]/g, (digit) => {
        return EASTERN_ARABIC_DIGITS[digit] ?? PERSIAN_DIGITS[digit] ?? digit
    })
}

export function normalizeText(value: string) {
    return value.trim().replace(/\s+/g, " ")
}

export function optionalText(value: string | null | undefined) {
    const normalized = normalizeText(value ?? "")
    return normalized || undefined
}

export function optionalTextOrNull(value: string | null | undefined) {
    return optionalText(value) ?? null
}

export function normalizeNumberText(value: string | number | null | undefined) {
    return toEnglishDigits(String(value ?? ""))
        .trim()
        .replace(/\u066B/g, ".") // Arabic decimal separator
}

export function parseFiniteNumber(value: string | number | null | undefined) {
    const normalized = normalizeNumberText(value)
    if (!normalized) return null

    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
}

export function parsePositiveNumber(value: string | number | null | undefined) {
    const parsed = parseFiniteNumber(value)
    return parsed != null && parsed > 0 ? parsed : null
}

export function parseNonNegativeNumber(
    value: string | number | null | undefined
) {
    const parsed = parseFiniteNumber(value)
    return parsed != null && parsed >= 0 ? parsed : null
}

export function parsePositiveInteger(value: string | number | null | undefined) {
    const parsed = parseFiniteNumber(value)
    return parsed != null && Number.isSafeInteger(parsed) && parsed > 0
        ? parsed
        : null
}

export function parseNonNegativeInteger(
    value: string | number | null | undefined
) {
    const parsed = parseFiniteNumber(value)
    return parsed != null && Number.isSafeInteger(parsed) && parsed >= 0
        ? parsed
        : null
}

export function isValidId(value: string | number | null | undefined) {
    return parsePositiveInteger(value) != null
}

export function requireFiniteNumber(
    value: string | number | null | undefined,
    fieldName = "number"
) {
    const parsed = parseFiniteNumber(value)
    if (parsed == null) throw new Error(`Invalid ${fieldName}`)
    return parsed
}

export function requirePositiveNumber(
    value: string | number | null | undefined,
    fieldName = "number"
) {
    const parsed = parsePositiveNumber(value)
    if (parsed == null) throw new Error(`Invalid ${fieldName}`)
    return parsed
}

export function requirePositiveInteger(
    value: string | number | null | undefined,
    fieldName = "id"
) {
    const parsed = parsePositiveInteger(value)
    if (parsed == null) throw new Error(`Invalid ${fieldName}`)
    return parsed
}

export function requireNonNegativeInteger(
    value: string | number | null | undefined,
    fieldName = "integer"
) {
    const parsed = parseNonNegativeInteger(value)
    if (parsed == null) throw new Error(`Invalid ${fieldName}`)
    return parsed
}

export function optionalPositiveIntegerOrNull(
    value: string | number | null | undefined
) {
    if (value == null || String(value).trim() === "") return null
    return requirePositiveInteger(value)
}

export function optionalPositiveNumberOrNull(
    value: string | number | null | undefined
) {
    if (value == null || String(value).trim() === "") return null
    return requirePositiveNumber(value)
}

const DATE_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export function isValidDateInputValue(value: string | null | undefined) {
    const normalized = toEnglishDigits(value ?? "").trim()
    const match = DATE_INPUT_PATTERN.exec(normalized)
    if (!match) return false

    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    const date = new Date(Date.UTC(year, month - 1, day))

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    )
}

export function compareDateInputValues(first: string, second: string) {
    if (!isValidDateInputValue(first) || !isValidDateInputValue(second)) {
        return null
    }

    const firstTime = Date.UTC(
        Number(first.slice(0, 4)),
        Number(first.slice(5, 7)) - 1,
        Number(first.slice(8, 10))
    )
    const secondTime = Date.UTC(
        Number(second.slice(0, 4)),
        Number(second.slice(5, 7)) - 1,
        Number(second.slice(8, 10))
    )

    return firstTime - secondTime
}

export function dateInputToIsoString(value: string) {
    const normalized = toEnglishDigits(value).trim()
    if (!isValidDateInputValue(normalized)) {
        throw new Error("Invalid date")
    }

    return new Date(
        Date.UTC(
            Number(normalized.slice(0, 4)),
            Number(normalized.slice(5, 7)) - 1,
            Number(normalized.slice(8, 10))
        )
    ).toISOString()
}

export function optionalDateInputToIsoString(value: string | null | undefined) {
    if (!value?.trim()) return null
    return dateInputToIsoString(value)
}

export function isHttpUrl(value: string | null | undefined) {
    const normalized = value?.trim()
    if (!normalized) return false

    try {
        const url = new URL(normalized)
        return url.protocol === "http:" || url.protocol === "https:"
    } catch {
        return false
    }
}

export function getFirstInvalidCommaSeparatedPositiveInteger(
    value: string | null | undefined
) {
    const parts = (value ?? "")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)

    for (const part of parts) {
        if (parsePositiveInteger(part) == null) return part
    }

    return null
}

export function parseCommaSeparatedPositiveIntegers(value: string) {
    return value
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => requirePositiveInteger(part))
}

export function isAllowedFileType(file: File, allowedTypes: readonly string[]) {
    return allowedTypes.includes(file.type)
}

export function isWithinMaxFileSize(file: File, maxBytes: number) {
    return file.size <= maxBytes
}
