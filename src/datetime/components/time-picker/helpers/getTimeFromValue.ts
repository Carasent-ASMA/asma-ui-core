export const getTimeFromValue = (value: string, existingDate?: Date): Date| null => {
    const parts = value.split(':')
    const h = Number(parts[0])
    const m = Number(parts[1])

    const isValid = parts[0]?.length == 2 && parts[1]?.length == 2 && h >= 0 && h <= 23 && m >= 0 && m <= 59

    if (isValid) {
        // Copy: this runs during render, and mutating the consumer's `value` silently changed it.
        const now = existingDate ? new Date(existingDate) : new Date()
        now.setHours(h)
        now.setMinutes(m)

        return now
    }

    return null
}
