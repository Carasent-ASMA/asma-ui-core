/**
 * The elements a keyboard user can Tab to. The same list `focusOutsideTable` uses (`TableRow.tsx`).
 */
const TABBABLE =
    'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

/**
 * The controls in a table's header that Tab reaches, in DOM order, which is visual order: the fixed-left headers
 * render first and the fixed-right ones last, the pin included (ASMA-8702). `thead` belongs to this table only:
 * a table nested in a row has its own. An `inert` header (`hideHeader`) has none.
 */
export const getHeaderControls = (table: HTMLTableElement | null | undefined): HTMLElement[] =>
    Array.from(table?.tHead?.querySelectorAll<HTMLElement>(TABBABLE) ?? []).filter(
        (control) => !control.closest('[inert]'),
    )

/** The control Tab leaves the header from, and Shift+Tab from the body returns to; `undefined` with no controls. */
export const getLastHeaderControl = (table: HTMLTableElement | null | undefined): HTMLElement | undefined =>
    getHeaderControls(table).at(-1)

/**
 * The body row that holds the roving tab stop: the row the user last worked with. Rows of a table nested in a row
 * are not this table's, so only the direct rows of its own bodies are looked at.
 */
export const getActiveBodyRow = (table: HTMLTableElement | null | undefined): HTMLTableRowElement | undefined =>
    Array.from(table?.tBodies ?? [])
        .flatMap((body) => Array.from(body.rows))
        .find((row) => row.tabIndex === 0)
