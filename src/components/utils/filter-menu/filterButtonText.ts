/**
 * The Filter trigger's text, which is also its accessible name when the label is hidden.
 *
 * `activeCount`: the number of filter controls that differ from the page default (the page computes it).
 *
 * @see asma-modules/_docs/ux/specs/spec-design-system-popover.md:100 — Filter trigger label
 * @see asma-modules/_docs/ux/patterns/pattern-filter-default-state.md:70 — what counts as changed
 */
export const filterButtonText = (label: string | undefined, activeCount: number | undefined): string => {
    const text = label ?? 'Filter'

    return activeCount ? `${text} (${activeCount})` : text
}

/** `activeCount`, when given, alone decides the dot; `filterIsActive` serves callers without a count. */
export const isFilterDotShown = (filterIsActive: boolean | undefined, activeCount: number | undefined): boolean =>
    activeCount === undefined ? !!filterIsActive : activeCount > 0
