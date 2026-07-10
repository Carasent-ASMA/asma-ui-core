import { type CSSProperties } from 'react'
import type { FormLabelProps } from '@mui/material'
import clsx from 'clsx'
import { resolveSx } from 'src/helpers/sx'

/**
 * MUI-free `FormLabel`: a `<label>` with MUI's default form-label typography/colour. Distinct from
 * this library's `StyledFormLabel` (data-display); this is the raw MUI passthrough. TASK-102.
 */
export const FormLabel = ({
    required,
    className,
    sx,
    style,
    children,
    classes: _classes,
    component: _component,
    error: _error,
    focused: _focused,
    filled: _filled,
    color: _color,
    ...rest
}: FormLabelProps): JSX.Element => {
    const mergedStyle: CSSProperties = { ...resolveSx(sx), ...style }

    return (
        <label
            className={clsx('font-roboto text-[1rem] leading-[1.4375em] text-[rgba(0,0,0,0.6)]', className)}
            style={mergedStyle}
            {...rest}
        >
            {children}
            {required && <span className='ml-0.5 text-[#d32f2f]'>&thinsp;*</span>}
        </label>
    )
}
