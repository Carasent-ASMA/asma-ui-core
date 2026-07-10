import type { CSSProperties, HTMLAttributes } from 'react'
import type { FormGroupProps } from '@mui/material'
import clsx from 'clsx'
import { resolveSx } from 'src/helpers/sx'

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
            {...(rest as HTMLAttributes<HTMLDivElement>)}
        >
            {children}
        </div>
    )
}
