export function formatShortDateTime(date?: string) {
    if (!date) {
        return "-"
    }

    const parsedDate = new Date(date)

    if (Number.isNaN(parsedDate.getTime())) {
        return "-"
    }

    const hours = String(parsedDate.getHours()).padStart(2, "0")
    const minutes = String(parsedDate.getMinutes()).padStart(2, "0")
    const day = String(parsedDate.getDate()).padStart(2, "0")
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0")
    const year = String(parsedDate.getFullYear()).slice(-2)

    return `${hours}:${minutes} ${day}/${month}/${year}`
}