import { type CSSProperties, type HTMLAttributes } from 'react'
import clsx from 'clsx'
import { resolveSx } from 'src/helpers/sx'

interface DialogActionsProps extends HTMLAttributes<HTMLDivElement> {
    sx?: unknown
    classes?: Record<string, string>
    disableSpacing?: boolean
}

/** MUI-free dialog actions: a right-aligned flex row of buttons. TASK-101. */
export const StyledDialogActions = ({
    children,
    className,
    sx,
    style,
    classes: _classes,
    disableSpacing: _disableSpacing,
    ...rest
}: DialogActionsProps): JSX.Element => {
    const mergedStyle: CSSProperties = { ...resolveSx(sx), ...style }
    return (
        <div
            data-testid='styled-dialog-actions'
            className='m-0 flex shrink-0 justify-center p-0'
            style={mergedStyle}
            {...(rest)}
        >
            <div className={clsx('flex w-full justify-end gap-2 p-4', className)}>{children}</div>
        </div>
    )
}
