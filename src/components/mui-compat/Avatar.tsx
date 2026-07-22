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
    // Defaults (size, font-size, background AND text colour) live in `style`, NOT as `w-/h-/text-/bg-`
    // utility classes, so a caller's inline `style`/`sx` can override them. As Tailwind classes they WIN
    // over inline styles in any consumer whose build marks utilities `!important`, forcing every avatar to
    // 40px / 1.25rem / grey #bdbdbd and ignoring per-instance values (e.g. InitialsAvatar's 24px box, 10px
    // initials and its computed type colour — which is why all avatars rendered grey) — a regression vs
    // MUI's Avatar, whose defaults were overridable. DEC-003.
    const mergedStyle: CSSProperties = {
        width: 40,
        height: 40,
        fontSize: '1.25rem',
        backgroundColor: '#bdbdbd',
        color: '#fff',
        ...resolveSx(sx),
        ...style,
    }

    return (
        <div
            className={clsx(
                'relative flex shrink-0 items-center justify-center overflow-hidden font-roboto',
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
