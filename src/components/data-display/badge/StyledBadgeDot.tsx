import clsx from 'clsx'

interface StyledBadgeDotProps {
    dataTest: string
    className?: string
    /**
     * Name the dot for assistive technology. Supply it whenever no host control already carries
     * the meaning — a dot alone in a table cell is otherwise colour-only (WCAG 2.2 AA 1.4.1).
     * Omit it when the surrounding control's accessible name already says "unread".
     */
    ariaLabel?: string
}

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#44267-214524
 * Figma "Badge / Dot" as a flow element: a 12px lime circle with a 2px `Badge/border-dot` ring.
 *
 * `StyledBadge` anchors its dot to the corner of a host it wraps. Use this where the dot is its
 * own element instead — a table cell, or a marker in a flex row — so it keeps the documented
 * colours without the caller rebuilding the circle by hand.
 */
export const StyledBadgeDot = ({ dataTest, className, ariaLabel }: StyledBadgeDotProps): JSX.Element => (
    <span
        {...(ariaLabel ? { 'aria-label': ariaLabel, role: 'img' } : { 'aria-hidden': 'true' })}
        className={clsx('inline-block size-[12px] shrink-0 rounded-full border-solid', className)}
        data-testid={dataTest}
        style={{
            backgroundColor: 'var(--colors-badge-background)',
            borderColor: 'var(--colors-badge-border-dot)',
            borderWidth: 'var(--border-badge-dot)',
        }}
    />
)
