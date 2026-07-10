import { createElement, type CSSProperties } from 'react'
import type { ContainerProps } from '@mui/material'
import clsx from 'clsx'
import { resolveSx } from 'src/helpers/sx'

// MUI default breakpoint max-widths (px).
const MAX_WIDTH: Record<string, number> = { xs: 444, sm: 600, md: 900, lg: 1200, xl: 1536 }

/**
 * MUI-free `Container`: full-width, horizontally centred, with default 16px gutters and a
 * breakpoint `maxWidth` (default `lg`). `fixed` is not reproduced (rare). TASK-102.
 */
export const Container = ({
    maxWidth = 'lg',
    disableGutters,
    className,
    sx,
    style,
    component = 'div',
    children,
    fixed: _fixed,
    ...rest
}: ContainerProps): JSX.Element => {
    const mergedStyle: CSSProperties = {
        ...(maxWidth && maxWidth in MAX_WIDTH ? { maxWidth: MAX_WIDTH[maxWidth] } : {}),
        ...resolveSx(sx),
        ...style,
    }

    return createElement(
        component as string,
        {
            className: clsx('mx-auto box-border block w-full', !disableGutters && 'px-4', className),
            style: mergedStyle,
            ...rest,
        },
        children,
    )
}
