import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import { resolveSx } from 'src/helpers/sx'

type StyledBadgeSize = 'medium' | 'small'

interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
    badgeContent?: ReactNode
    color?: string
    max?: number
    showZero?: boolean
    variant?: 'standard' | 'dot'
    invisible?: boolean
    anchorOrigin?: { vertical: 'top' | 'bottom'; horizontal: 'left' | 'right' }
    overlap?: 'rectangular' | 'circular'
    component?: ElementType
    classes?: Record<string, string>
    slots?: Record<string, unknown>
    slotProps?: unknown
    sx?: unknown
}

type StyledBadgeProps = BadgeProps & {
    dataTest: string
    size?: StyledBadgeSize
}

// MUI default-palette badge colours; `primary` keeps this library's custom green (was the MuiBadge-colorPrimary sx override).
const COLOR_CLASS: Record<string, string> = {
    primary: 'bg-[#D9F256] text-[#0A3D3D] border border-solid border-[#C1E600]',
    default: 'bg-[#e0e0e0] text-[rgba(0,0,0,0.87)]',
    secondary: 'bg-[#9c27b0] text-white',
    error: 'bg-[#d32f2f] text-white',
    info: 'bg-[#0288d1] text-white',
    success: 'bg-[#2e7d32] text-white',
    warning: 'bg-[#ed6c02] text-white',
}

// Rectangular anchor placement (MUI default). vertical-horizontal → position + translate + origin.
const ANCHOR_CLASS: Record<string, string> = {
    'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2 origin-[100%_0%]',
    'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 origin-[0%_0%]',
    'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 origin-[100%_100%]',
    'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 origin-[0%_100%]',
}

const SX_BADGE_SLOT = '& .MuiBadge-badge'

/**
 * Native, MUI-free reimplementation of the previous `Badge` passthrough. Reproduces MUI v9 badge
 * metrics/positioning via Tailwind, this library's custom `primary` green, and the `small` size.
 * The established styling API `sx={{ '& .MuiBadge-badge': {...} }}` is preserved by extracting that
 * slot and applying `resolveSx` to the badge span (DEC-007 slot-sx). Signature unchanged (DEC-003).
 */
export const StyledBadge = ({
    color = 'primary',
    dataTest,
    size = 'medium',
    badgeContent,
    max = 99,
    showZero = false,
    variant = 'standard',
    invisible,
    anchorOrigin,
    children,
    className,
    sx,
    // MUI-only props dropped so they never reach the DOM span (kept in the type for signature parity).
    overlap: _overlap,
    classes: _classes,
    slots: _slots,
    slotProps: _slotProps,
    component: _component,
    ...props
}: StyledBadgeProps): JSX.Element => {
    const sxObject = (sx && typeof sx === 'object' && !Array.isArray(sx) ? sx : {}) as Record<string, unknown>
    const badgeSlotStyle: CSSProperties = resolveSx(sxObject[SX_BADGE_SLOT])
    const rootStyle: CSSProperties = resolveSx(
        Object.fromEntries(Object.entries(sxObject).filter(([key]) => key !== SX_BADGE_SLOT)),
    )

    const isDot = variant === 'dot'
    const isZeroHidden =
        !isDot && (badgeContent === 0 || badgeContent === undefined || badgeContent === null) && !showZero
    const hidden = !!invisible || isZeroHidden

    const displayContent: ReactNode = isDot
        ? null
        : typeof badgeContent === 'number' && badgeContent > max
          ? `${max}+`
          : badgeContent

    const vertical = anchorOrigin?.vertical ?? 'top'
    const horizontal = anchorOrigin?.horizontal ?? 'right'

    return (
        <span className='relative inline-flex shrink-0 align-middle' data-testid={dataTest} style={rootStyle} {...props}>
            {children}
            {!hidden && (
                <span
                    className={clsx(
                        'absolute z-[1] box-border flex flex-row flex-wrap content-center items-center justify-center whitespace-nowrap font-roboto font-medium leading-none',
                        ANCHOR_CLASS[`${vertical}-${horizontal}`],
                        isDot
                            ? 'h-[6px] w-[6px] min-w-[6px] rounded-[3px] p-0'
                            : size === 'small'
                              ? 'h-[16px] w-max min-w-[16px] rounded-[10px] px-[4px] text-[0.75rem]'
                              : 'h-[20px] min-w-[20px] rounded-[10px] px-[6px] text-[0.75rem]',
                        COLOR_CLASS[color] ?? COLOR_CLASS['default'],
                        className,
                    )}
                    style={badgeSlotStyle}
                >
                    {displayContent}
                </span>
            )}
        </span>
    )
}
