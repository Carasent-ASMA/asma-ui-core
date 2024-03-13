export const getTimeFromValue = (value: string) => {
    const parts = value.split(':')
    const h = Number(parts[0])
    const m = Number(parts[1])

    const isValid = parts[0]?.length == 2 && parts[1]?.length == 2 && h >= 0 && h <= 23 && m >= 0 && m <= 59

    if (isValid) {
        const now = new Date()
        now.setHours(h)
        now.setMinutes(m)

        return now
    }

    return null
}
