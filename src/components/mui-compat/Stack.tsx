import { Children, createElement, Fragment, isValidElement, type CSSProperties, type ReactNode } from 'react'
import type { StackProps } from './types'
import clsx from 'clsx'
import { resolveSx } from 'src/helpers/sx'

const DIRECTION_CLASS: Record<string, string> = {
    row: 'flex-row',
    'row-reverse': 'flex-row-reverse',
    column: 'flex-col',
    'column-reverse': 'flex-col-reverse',
}

const withDividers = (children: ReactNode, divider: ReactNode): ReactNode => {
    const items = Children.toArray(children)
    return items.map((child, index) => (
        <Fragment key={index}>
            {index > 0 && divider}
            {child}
        </Fragment>
    ))
}

/**
 * MUI-free `Stack`: a flex container with `direction` and `spacing` (× 8px gap) and optional
 * `divider` between children. Scalar direction/spacing only — responsive breakpoint objects are not
 * reproduced (rare on this library's usage). TASK-102.
 */
export const Stack = ({
    direction = 'column',
    spacing,
    divider,
    className,
    sx,
    style,
    component = 'div',
    children,
    useFlexGap: _useFlexGap,
    ...rest
}: StackProps): JSX.Element => {
    const gap = typeof spacing === 'number' ? spacing * 8 : typeof spacing === 'string' ? spacing : undefined
    const mergedStyle: CSSProperties = {
        ...(gap !== undefined ? { gap } : {}),
        ...resolveSx(sx),
        ...style,
    }

    return createElement(
        component as string,
        {
            className: clsx('flex', DIRECTION_CLASS[direction as string] ?? 'flex-col', className),
            style: mergedStyle,
            ...rest,
        },
        divider && isValidElement(divider) ? withDividers(children, divider) : children,
    )
}
