import type { ReactNode } from 'react'

import { CloseIcon } from 'src/components/icons/close-icon/CloseIcon'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { cn } from 'src/helpers/cn'

/**
 * The Figma "_Popover" surface chrome (node `44531:233781`): white, 1px `border/outline`, radius 8
 * (`dialog` token) and the Dialogue-popup elevation — the same surface `StyledDialog` paints.
 *
 * `border-solid` and `box-border` are load-bearing, not noise: this package builds Tailwind with
 * `preflight: false`, so without them `border` computes to `border-style: none` (no border paints at
 * all) and `box-sizing` falls back to `content-box` (a 400px max-width renders 402).
 *
 * Positioning (`z-index`, the floating transform, the top-layer props) deliberately stays with the
 * caller, so the Gallery story can render the same surface statically in a grid.
 */
export const POPOVER_SURFACE_CLASSNAME =
    'box-border flex flex-col overflow-hidden rounded-lg border border-solid border-delta-300 bg-white text-delta-700 outline-none shadow-[0px_4px_40px_0px_#22213366]'

export interface PopoverAnatomyProps {
    dataTest: string
    title?: ReactNode
    titleId?: string
    children: ReactNode
    /** Left slot of the Figma "Reset filter" row — the "View results (3)" affordance. */
    viewResultsAction?: ReactNode
    /** Right slot of the Figma "Reset filter" row. */
    resetAction?: ReactNode
    /** The Figma "Actions" row — a single right-aligned outlined button. */
    footerActions?: ReactNode
    closeLabel: string
    onClose: () => void
}

/**
 * Everything inside the popover surface: the content row (title + body + close column) and the two
 * optional footer rows. Split out of `StyledPopoverV2` so the Gallery story can render every
 * Title × Reset filter × Actions combination side by side — a real popover is portalled, anchored
 * and mutually exclusive, so the variants can never be seen together through the live component.
 *
 * Not exported from the package barrel: this is an implementation detail, not public API.
 */
export const PopoverAnatomy = ({
    dataTest,
    title,
    titleId,
    children,
    viewResultsAction,
    resetAction,
    footerActions,
    closeLabel,
    onClose,
}: PopoverAnatomyProps): JSX.Element => (
    <>
        {/* Figma draws the scrollbar flush with the surface's right edge (x 385-400 of a 400 frame),
            not against the text column. So the scroll container spans the full width and the 40px
            close gutter is its right padding — the bar then lands in that gutter, where the design
            puts it. The close control floats over the corner instead of occupying a column, but
            stays LAST in the DOM so `action` still opens on the first body control, not on it.
            `min-h-0` is what lets the body shrink and actually scroll. */}
        <div className='relative flex min-h-0 flex-1 flex-col'>
            {title && (
                <div
                    id={titleId}
                    className='shrink-0 truncate pb-1 pl-4 pr-10 pt-2 text-lg font-semibold leading-7 text-delta-800'
                >
                    {title}
                </div>
            )}
            <div className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-2 pl-4 pr-10'>{children}</div>
            <div className='absolute right-0 top-0'>
                <StyledButton
                    dataTest={`${dataTest}-close`}
                    variant='textGray'
                    type='button'
                    aria-label={closeLabel}
                    onClick={onClose}
                    startIcon={<CloseIcon width={24} height={24} />}
                />
            </div>
        </div>
        {(viewResultsAction ?? resetAction) && (
            // Figma draws this row as `justify-between` with "View results (3)" left and the reset
            // button right. With only the reset button the row has to fall back to right-alignment,
            // which `justify-between` alone would not do.
            <div
                className={cn(
                    'flex shrink-0 items-start p-1',
                    viewResultsAction ? 'justify-between' : 'justify-end',
                )}
            >
                {viewResultsAction}
                {resetAction}
            </div>
        )}
        {footerActions && <div className='flex shrink-0 flex-col items-end p-3'>{footerActions}</div>}
    </>
)
