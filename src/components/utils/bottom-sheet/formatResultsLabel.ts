import type { UiCoreLocale } from 'src/helpers/uiCoreLocale'

import { SHEET_TEXT } from './sheetCopy'

const MAX_SHOWN_COUNT = 9999

/**
 * The label of the "Vis resultater (N)" dismiss control — one system-wide pattern, not per-screen copy.
 *
 * - `null` / `undefined` → `Vis resultater` (the API returned no total; the button still works)
 * - `0` → `Ingen treff` (stays enabled — it is the way out of the sheet)
 * - above 9999 → `Vis resultater (9999+)`, so the label keeps a fixed shape and never wraps
 * - otherwise → `Vis resultater (N)`, parenthesised even for 1 to sidestep resultat/resultater
 *
 * English (`locale='en'`) reads `Show results (N)` and `No matches`.
 */
export const formatResultsLabel = (count: number | null | undefined, locale: UiCoreLocale = 'en'): string => {
    const text = SHEET_TEXT[locale]
    if (count === null || count === undefined) return text.showResults
    if (count === 0) return text.noMatches
    if (count > MAX_SHOWN_COUNT) return `${text.showResults} (${MAX_SHOWN_COUNT}+)`
    return `${text.showResults} (${count})`
}
