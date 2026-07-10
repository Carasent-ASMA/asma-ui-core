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
                'w-full flex-auto overflow-y-auto p-4',
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
