import { Children, type CSSProperties, type HTMLAttributes } from 'react'
import clsx from 'clsx'
import { resolveSx } from 'src/helpers/sx'

interface DialogActionsProps extends HTMLAttributes<HTMLDivElement> {
    sx?: unknown
    classes?: Record<string, string>
    disableSpacing?: boolean
}

/**
 * MUI-free dialog actions: a right-aligned flex row of buttons; on mobile each button wrapper
 * stretches full width (was a SCSS media query, now Tailwind `max-md:` arbitrary variant). TASK-101.
 */
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
            <div className={clsx('flex w-full justify-end gap-2 p-4', className)}>
                {Children.map(children, (child) => (
                    <div className='max-md:flex-1 max-md:[&_button]:w-full'>{child}</div>
                ))}
            </div>
        </div>
    )
}
