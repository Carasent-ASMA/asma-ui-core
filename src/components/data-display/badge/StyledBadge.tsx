import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import { resolveSx } from 'src/helpers/sx'

type StyledBadgeSize = 'medium' | 'small'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#15181-43817
 * Figma "Badge". Number badge = solid gama-500 pill, white Helper-Semibold 14px (h20/px6/r20);
 * `dot` variant = 8px dot (Unread/Filters). `color` selects the badge palette (primary→teal number
 * badge, error→soft error-100/error-600); other colors are app extensions with no Figma type.
 */
interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
    /** @figmaProp Badge content (the number/label) */
    badgeContent?: ReactNode
    /** @figmaProp Type/colour = primary→number badge (gama-500) | error→error-100/600 | others = app */
    color?: string
    max?: number
    showZero?: boolean
    /** @figmaProp Type = dot→"Unread/Filters" (8px) | standard→number badge */
    variant?: 'standard' | 'dot'
    invisible?: boolean
    anchorOrigin?: { vertical: 'top' | 'bottom'; horizontal: 'left' | 'right' }
    overlap?: 'rectangular' | 'circular'
    component?: ElementType
    classes?: Record<string, string>
    slots?: Record<string, unknown>
    slotProps?: { badge?: { className?: string; style?: CSSProperties } }
    sx?: unknown
}

type StyledBadgeProps = BadgeProps & {
    dataTest: string
    size?: StyledBadgeSize
}

// Badge colours. Figma "Badge" (node 15181-43817): the number badge is a solid gama-500 pill with
// white text (Filters number); Error is a soft error-100 pill with error-600 text. default/secondary/
// info/success/warning have no Figma badge type — kept as app extensions.
const COLOR_STYLE: Record<string, CSSProperties> = {
    primary: { backgroundColor: 'var(--colors-gama-500)', color: '#fff' },
    default: { backgroundColor: 'var(--colors-delta-200)', color: 'var(--colors-delta-800)' },
    secondary: { backgroundColor: 'var(--colors-delta-600)', color: '#fff' },
    error: { backgroundColor: 'var(--colors-error-100)', color: 'var(--colors-error-600)' },
    info: { backgroundColor: 'var(--colors-info-500)', color: '#fff' },
    success: { backgroundColor: 'var(--colors-success-700)', color: '#fff' },
    warning: { backgroundColor: 'var(--colors-warning-700)', color: '#fff' },
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
    slotProps,
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
                        // Figma badge: Helper Semibold 14/20, pill radius; dots are 8px.
                        'absolute z-[1] box-border flex flex-row flex-wrap content-center items-center justify-center whitespace-nowrap font-roboto font-semibold leading-none',
                        ANCHOR_CLASS[`${vertical}-${horizontal}`],
                        isDot
                            ? 'h-[8px] w-[8px] min-w-[8px] rounded-full p-0'
                            : size === 'small'
                              ? 'h-[16px] w-max min-w-[16px] rounded-[20px] px-[4px] text-[0.75rem]'
                              : 'h-[20px] min-w-[20px] rounded-[20px] px-[6px] text-sm',
                        className,
                        slotProps?.badge?.className,
                    )}
                    style={{
                        ...(COLOR_STYLE[color] ?? COLOR_STYLE['default']),
                        ...badgeSlotStyle,
                        ...slotProps?.badge?.style,
                    }}
                >
                    {displayContent}
                </span>
            )}
        </span>
    )
}
