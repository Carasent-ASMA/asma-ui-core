/**
 * The one dialog header layout (ASMA-8737), shared by `StyledDialog`, `MinimizableDialog` and
 * `MinimizableDialogV2`: the actions row on top, then the title on a row of its own across the full
 * width. Geometry from the ticket: 44 px actions row, 28 px vertical padding (16 + 12), title lines
 * of 26 px below 744 px wide and 24 px from there up.
 */
export const DIALOG_HEADER_CLASSES = 'box-border w-full min-w-0 max-w-full shrink-0 bg-white px-4 pb-3 pt-4'

/** Label (if any) on the left, the header actions on the right. Wraps rather than overflowing at 320 px. */
export const DIALOG_HEADER_ACTIONS_ROW_CLASSES =
    'flex min-h-11 w-full min-w-0 items-center justify-between gap-x-2 max-xs:flex-wrap max-xs:gap-y-1'

/**
 * Title type: 20/26 Bold below 744 px, 18/24 Bold from 744 px. Never truncated or clamped: it wraps
 * to as many lines as it needs, breaking an over-long word rather than scrolling sideways (WCAG 1.4.10).
 */
export const DIALOG_TITLE_CLASSES =
    'my-0 block min-w-0 whitespace-normal text-[20px] font-bold leading-[26px] text-delta-800 [overflow-wrap:anywhere] hyphens-auto min-[744px]:text-lg min-[744px]:leading-6'
