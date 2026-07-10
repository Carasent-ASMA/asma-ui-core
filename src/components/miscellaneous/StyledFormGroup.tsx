import type { CSSProperties, HTMLAttributes } from 'react'
import clsx from 'clsx'
import { resolveSx } from 'src/helpers/sx'

interface FormGroupProps extends HTMLAttributes<HTMLDivElement> {
    row?: boolean
    sx?: unknown
    classes?: Record<string, string>
}

/**
 * MUI-free `FormGroup`: a flex container, column by default or `row`. TASK-101.
 */
export const StyledFormGroup = ({
    row,
    className,
    sx,
    style,
    children,
    classes: _classes,
    ...rest
}: FormGroupProps): JSX.Element => {
    const mergedStyle: CSSProperties = { ...resolveSx(sx), ...style }
    return (
        <div
            className={clsx('flex flex-wrap', row ? 'flex-row' : 'flex-col', className)}
            style={mergedStyle}
            {...(rest)}
        >
            {children}
        </div>
    )
}
