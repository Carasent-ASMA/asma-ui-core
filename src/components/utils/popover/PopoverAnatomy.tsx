import { type ReactNode, useRef } from 'react'

import { CloseIcon } from 'src/components/icons/close-icon/CloseIcon'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { cn } from 'src/helpers/cn'

import { useScrollGutter } from './useScrollGutter'

/** Figma's "Close + scroll" column: the Close button above, the scrollbar below, 40px wide. */
const CLOSE_COLUMN_WIDTH = 40

/**
 * The Figma "_Popover" surface chrome (node `44531:233781`): white, 1px `border/outline` (delta-300),
 * radius 8 (`dialog` token) and the Dialogue-popup elevation — the same surface `StyledDialog` paints.
 *
 * The 1px edge is an **inset box-shadow ring**, the package's own idiom for non-layout lines
 * (`StyledTab`/`StyledMenuItem` draw their DS focus rings the same way): a border consumes layout
 * width, and at the 472px Action max-width a date-picker pair (200 + 16 + 200 = 416px, with 16px +
 * 40px body padding) needs the full 472px of the frame — with a border only 470px remain and the
 * pair wraps. Figma's stroke takes no width from autolayout, and the inset shadow matches that.
 *
 * `box-border` is load-bearing, not noise: this package builds Tailwind with `preflight: false`, so
 * without it `box-sizing` falls back to `content-box` and a 472px max-width renders 474.
 *
 * Positioning (`z-index`, the floating transform, the top-layer props) deliberately stays with the
 * caller, so the Gallery story can render the same surface statically in a grid.
 */
export const POPOVER_SURFACE_CLASSNAME =
    'box-border flex flex-col overflow-hidden rounded-lg bg-white text-delta-700 outline-none shadow-[inset_0_0_0_1px_var(--colors-delta-300),0px_4px_40px_0px_#22213366]'

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
 * optional footer rows. Split out of `PopoverSheet` so the Gallery story can render every
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
}: PopoverAnatomyProps): JSX.Element => {
    const bodyRef = useRef<HTMLDivElement>(null)
    const gutter = useScrollGutter(bodyRef)

    return (
        <>
            {/* Figma (node 44495:205923) splits the surface into a content column and a 40px "Close +
            scroll" column: the Close button at its top, the scrollbar (15px, "Windows scroll") flush
            with the surface edge below it. The content width never depends on the scrollbar — it is
            always surface - 16 - 40, i.e. 416px at the 472px max-width, enough for a From / To
            date-picker pair (200 + 16 + 200).

            A native scrollbar cannot sit inside padding: a classic one (Windows, macOS "Always show")
            takes layout width *beside* it. So the body reserves the bar's width with
            `scrollbar-gutter: stable` (constant whether or not it scrolls), `useScrollGutter` measures
            it, and the right padding is 40px minus that width: padding + bar = Figma's 40px column on
            every platform — 40 + 0 with overlay bars, 23 + 17 with a classic one — and the content
            keeps exactly Figma's width. See `ClassicScrollbarKeepsDatePickerPairOnOneRow`.

            The close control floats over the top of that column instead of occupying a row, but stays
            LAST in the DOM so `action` still opens on the first body control, not on it. With a title
            the 40px title row puts the scroll area — and so the bar — below the Close, as Figma draws.
            Without one, a body that scrolls starts 40px down for the same reason: a native bar runs
            the full height of its container, and at the top it would sit under the Close (its up
            arrow hidden, presses landing on Close). A body that does not scroll keeps its text beside
            the Close, exactly as Figma's untitled Info popover. `min-h-0` lets the body shrink and
            actually scroll. */}
            <div className='relative flex min-h-0 flex-1 flex-col'>
                {title && (
                    <div
                        id={titleId}
                        className='shrink-0 truncate pb-1 pl-4 pr-10 pt-2 text-lg font-semibold leading-7 text-delta-800'
                    >
                        {title}
                    </div>
                )}
                <div
                    ref={bodyRef}
                    className={cn(
                        'flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-2 pl-4 [scrollbar-gutter:stable]',
                        !title && gutter.overflows && 'mt-10',
                    )}
                    style={{ paddingRight: Math.max(0, CLOSE_COLUMN_WIDTH - gutter.width) }}
                >
                    {children}
                </div>
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
}
