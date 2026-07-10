import { type CSSProperties } from 'react'
import type { AvatarProps } from './types'
import clsx from 'clsx'
import { resolveSx } from 'src/helpers/sx'

const VARIANT_CLASS: Record<string, string> = {
    circular: 'rounded-full',
    rounded: 'rounded-[4px]',
    square: 'rounded-none',
}

/**
 * MUI-free `Avatar`: 40×40 flex box showing an image (`src`) or fallback children/initials on a
 * grey background. Reproduces MUI default metrics + `variant`. TASK-102.
 */
export const Avatar = ({
    src,
    srcSet,
    alt,
    variant = 'circular',
    sizes,
    className,
    sx,
    style,
    children,
    classes: _classes,
    component: _component,
    ...rest
}: AvatarProps): JSX.Element => {
    const mergedStyle: CSSProperties = { ...resolveSx(sx), ...style }

    return (
        <div
            className={clsx(
                'relative flex h-[40px] w-[40px] shrink-0 items-center justify-center overflow-hidden bg-[#bdbdbd] font-roboto text-[1.25rem] text-white',
                VARIANT_CLASS[variant] ?? VARIANT_CLASS['circular'],
                className,
            )}
            style={mergedStyle}
            {...rest}
        >
            {src || srcSet ? (
                <img
                    className='h-full w-full object-cover text-transparent'
                    src={src}
                    srcSet={srcSet}
                    alt={alt}
                    sizes={sizes}
                />
            ) : (
                children
            )}
        </div>
    )
}
