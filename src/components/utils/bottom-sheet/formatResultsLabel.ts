const MAX_SHOWN_COUNT = 9999

/**
 * The label of the "Vis resultater (N)" dismiss control — one system-wide pattern, not per-screen copy.
 *
 * - `null` / `undefined` → `Vis resultater` (the API returned no total; the button still works)
 * - `0` → `Ingen treff` (stays enabled — it is the way out of the sheet)
 * - above 9999 → `Vis resultater (9999+)`, so the label keeps a fixed shape and never wraps
 * - otherwise → `Vis resultater (N)`, parenthesised even for 1 to sidestep resultat/resultater
 */
export const formatResultsLabel = (count: number | null | undefined): string => {
    if (count === null || count === undefined) return 'Vis resultater'
    if (count === 0) return 'Ingen treff'
    if (count > MAX_SHOWN_COUNT) return `Vis resultater (${MAX_SHOWN_COUNT}+)`
    return `Vis resultater (${count})`
}
