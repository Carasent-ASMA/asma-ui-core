/**
 * Development-only: a `StyledDialog` with no `dialogTitle`, `dialogLabel`, `ariaLabel` or heading in its
 * content has no accessible name (WCAG 4.1.2, axe `aria-dialog-name`). Silent in production.
 */
export function warnUnnamedDialog(dataTest: string | undefined): void {
    if (typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'production') return
    console.warn(
        `[asma-ui-core/StyledDialog] "${dataTest ?? 'dialog'}" has no accessible name — pass dialogTitle, dialogLabel or ariaLabel, or render a heading in its content`,
    )
}
