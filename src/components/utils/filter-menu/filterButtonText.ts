/**
 * The Filter trigger's text, which is also its accessible name when the label is hidden.
 *
 * `activeCount` is how many filter values differ from the page's default state. The popover spec
 * puts that count in the label, `Filter (3)`, so it is readable without opening the popover and is
 * part of the accessible name rather than a decorative badge.
 *
 * @see asma-modules/_docs/ux/specs/spec-design-system-popover.md:100 — Filter trigger label
 * @see asma-modules/_docs/ux/patterns/pattern-filter-default-state.md:70 — what counts as changed
 */
export const filterButtonText = (label: string | undefined, activeCount: number | undefined): string => {
    const text = label ?? 'Filter'

    return activeCount ? `${text} (${activeCount})` : text
}
