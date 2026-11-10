import type { UiCoreLocale } from 'src/helpers/uiCoreLocale'

/**
 * Default strings of `PopoverSheet` and `StyledBottomSheet`. English is the meaning column of the spec's copy table.
 *
 * @see asma-modules/_docs/ux/specs/spec-design-system-bottom-sheet.md:116 — Copy and label guidelines
 */
export const SHEET_TEXT: Record<UiCoreLocale, { close: string; showResults: string; noMatches: string }> = {
    no: { close: 'Lukk', showResults: 'Vis resultater', noMatches: 'Ingen treff' },
    en: { close: 'Close', showResults: 'Show results', noMatches: 'No matches' },
}

/** Name of the sheet header's back control. */
export const SHEET_HEADER_TEXT: Record<UiCoreLocale, { back: string }> = {
    no: { back: 'Tilbake' },
    en: { back: 'Back' },
}
