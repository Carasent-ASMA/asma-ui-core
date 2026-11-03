/**
 * Elements that can be a tab stop. A candidate is only a header control if it also IS one right now: see `isTabbable`.
 */
const CANDIDATES =
    'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]'

/**
 * Whether the browser's Tab would stop on this element now (ASMA-8702): a tab index below zero, `hidden` or `display:
 * none` (no layout boxes), `visibility: hidden` and an `inert` or `hidden` ancestor all make it a non-stop, whatever the
 * candidate selector says. A button with `tabindex="-1"` matches `button` but is not a stop.
 */
const isTabbable = (element: HTMLElement): boolean =>
    element.tabIndex >= 0 &&
    !element.closest('[inert], [hidden]') &&
    element.getClientRects().length > 0 &&
    getComputedStyle(element).visibility !== 'hidden'

/**
 * The controls in a table's header that Tab reaches, in DOM order, which is visual order: the fixed-left headers
 * render first and the fixed-right ones last, the pin included. `thead` belongs to this table only: a table nested in a
 * row has its own. A hidden header (`hideHeader`, marked `data-header-hidden`) has none: its built-in controls are not
 * tab stops, and a control a consumer puts in a hidden header is the consumer's, not a place to send the focus to.
 */
export const getHeaderControls = (table: HTMLTableElement | null | undefined): HTMLElement[] => {
    const header = table?.tHead

    if (!header || header.hasAttribute('data-header-hidden')) return []

    return Array.from(header.querySelectorAll<HTMLElement>(CANDIDATES)).filter(isTabbable)
}

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
