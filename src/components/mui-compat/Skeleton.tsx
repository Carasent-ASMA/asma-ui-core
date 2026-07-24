import { type CSSProperties } from 'react'
import type { SkeletonProps } from './types'
import clsx from 'clsx'
import { resolveSx } from 'src/helpers/sx'

const VARIANT_CLASS: Record<string, string> = {
    text: 'rounded-[4px] origin-[0_55%] scale-y-[0.6] my-0',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-[4px]',
}

/**
 * MUI-free `Skeleton`: grey placeholder with the pulse animation (default). Reproduces MUI's
 * variants (`text`/`circular`/`rectangular`/`rounded`), `width`/`height`, and background. `wave`
 * animation degrades to `pulse` (Tailwind-first). TASK-102.
 */
export const Skeleton = ({
    variant = 'text',
    width,
    height,
    animation = 'pulse',
    className,
    sx,
    style,
    children,
    classes: _classes,
    component: _component,
    ...rest
}: SkeletonProps): JSX.Element => {
    const mergedStyle: CSSProperties = {
        width,
        height: height ?? (variant === 'text' ? 'auto' : undefined),
        backgroundColor: 'rgba(0,0,0,0.11)',
        ...resolveSx(sx),
        ...style,
    }

    return (
        <span
            className={clsx(
                'block',
                animation !== false && 'animate-pulse',
                VARIANT_CLASS[variant] ?? '',
                className,
            )}
            style={mergedStyle}
            {...rest}
        >
            {children}
        </span>
    )
}
