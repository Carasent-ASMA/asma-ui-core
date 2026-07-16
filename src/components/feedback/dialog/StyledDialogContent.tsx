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
    const mergedStyle: CSSProperties = { ...resolveSx(sx), ...style }
    return (
        <div
            data-test='styled-dialog-content'
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
        >
            {children}
        </div>
    )
}
