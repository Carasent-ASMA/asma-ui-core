import type { CSSProperties, HTMLAttributes } from 'react'
import clsx from 'clsx'
import { resolveSx } from 'src/helpers/sx'

interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
    sx?: unknown
    classes?: Record<string, string>
    dividers?: boolean
}

/**
 * MUI-free dialog content: a scrollable `<div>` with the previous SCSS metrics as Tailwind,
 * plus MUI's optional `dividers` borders. TASK-101.
 */
export const StyledDialogContent = ({
    children,
    className,
    sx,
    style,
    dividers,
    classes: _classes,
    ...rest
}: DialogContentProps): JSX.Element => {
    // Sticky children use the dialog body's header offset only when that body owns their scroll.
    // This content can instead be a consumer's bounded inner scroller, where the header is outside
    // the scrolling box and the inherited offset would leave an unreachable blank strip.
    const mergedStyle = { '--dialog-header-offset': '0px', ...resolveSx(sx), ...style } as CSSProperties
    return (
        <div
            data-test='styled-dialog-content'
            // Keyboard-reachable when content overflows and scrolls — without this a keyboard-only
            // user has no way to scroll dialog content that contains no other focusable element (axe
            // `scrollable-region-focusable`). Harmless when content doesn't overflow (a rarely-tabbed-
            // to no-op); the header's close button still gets the dialog's initial auto-focus since it
            // precedes this content in DOM order.
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- see comment above
            tabIndex={0}
            className={clsx(
                // `min-w-0` is required so this flex child can shrink to the paper width instead of
                // growing to its min-content width — otherwise wide content is clipped by the paper's
                // overflow-hidden and `overflow-x-auto` never shows a horizontal scrollbar.
                'min-h-0 w-full min-w-0 flex-auto overflow-auto px-6 py-4',
                dividers && 'border-y border-solid border-[rgba(0,0,0,0.12)]',
                className,
            )}
            style={mergedStyle}
            {...(rest)}
            data-dialog-content=''
        >
            {children}
        </div>
    )
}
