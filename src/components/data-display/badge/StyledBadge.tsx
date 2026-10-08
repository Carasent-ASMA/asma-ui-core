import { useEffect, useRef, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import clsx from 'clsx'
import { resolveSx } from 'src/helpers/sx'

type StyledBadgeSize = 'medium' | 'small'

/** Figma's `Parent` axis. It sets the dot's size and fill together, which is why it is not a colour. */
type StyledBadgePurpose = 'notification' | 'unread' | 'filter'

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#15181-43817
 * Figma "Badge". Notification count = 20px lime pill with a 1px border and Helper-Semibold 14/20;
 * `dot` = 12px lime circle with a stronger 2px border. Other colors and `small` are legacy app
 * extensions with no matching Figma notification variant.
 *
 * Pass children to decorate them — the badge anchors to their corner. Pass none and a `dot` becomes
 * a flow element (Figma `Size=Dot`, node 44267-214524), for a table cell or a marker in a row, and
 * `className` then applies to the badge's own root so the caller can place it.
 *
 * `purpose` selects Figma's `Parent`: the default notification dot, or the 8px solid primary dot
 * that marks something unread or a filter as active.
 */
interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color'> {
    /** @figmaProp Badge content (the number/label) */
    badgeContent?: ReactNode
    /** @figmaProp Type/colour = primary→notification badge | others = legacy app extensions */
    color?: string
    /** @deprecated Notification badges always cap at 99. */
    max?: number
    /** @deprecated A zero notification count is always omitted. */
    showZero?: boolean
    /**
     * @figmaProp Size = dot→"Dot" (12px) | standard→"Default" count badge
     * A `dot` with no children renders in normal flow rather than anchored to a corner.
     */
    variant?: 'standard' | 'dot'
    /**
     * @figmaProp Parent = notification→the lime ringed dot | unread/filter→an 8px solid primary dot
     * `unread` and `filter` are the same mark in Figma and differ only in meaning. Dots only: a
     * count badge is always the notification pill.
     */
    purpose?: StyledBadgePurpose
    /** Polite live-update text. Keep this contextual and include the real, uncapped count. */
    statusMessage?: string
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

// Figma notification styling is the primary default. Other palettes are legacy app extensions.
const COLOR_STYLE: Record<string, CSSProperties> = {
    primary: {
        backgroundColor: 'var(--colors-badge-background)',
        color: 'var(--colors-badge-label)',
    },
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
    max: _max,
    showZero: _showZero,
    variant = 'standard',
    purpose = 'notification',
    statusMessage,
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
    tabIndex: _tabIndex,
    'aria-label': ariaLabel,
    ...props
}: StyledBadgeProps): JSX.Element => {
    const statusRef = useRef<HTMLSpanElement>(null)
    const count = typeof badgeContent === 'number' ? badgeContent : undefined
    const previousCountRef = useRef(count)

    useEffect(() => {
        if (count === previousCountRef.current) return

        previousCountRef.current = count
        if (statusRef.current) statusRef.current.textContent = statusMessage ?? ''
    }, [count, statusMessage])

    const sxObject = (sx && typeof sx === 'object' && !Array.isArray(sx) ? sx : {}) as Record<string, unknown>
    const badgeSlotStyle: CSSProperties = resolveSx(sxObject[SX_BADGE_SLOT])
    const rootStyle: CSSProperties = resolveSx(
        Object.fromEntries(Object.entries(sxObject).filter(([key]) => key !== SX_BADGE_SLOT)),
    )

    const isDot = variant === 'dot'
    /**
     * Figma `Parent=Unread` and `Parent=Filter` are one mark drawn two ways in meaning only: an 8px
     * solid `gama/500-primary` circle, with no ring. The ring belongs to `Parent=Notification`,
     * where the lime fill needs the contrast to survive sitting over a busy icon.
     */
    const isAccentDot = isDot && purpose !== 'notification'
    /**
     * A badge with no host to decorate is a legitimate use, not a mistake: Figma's "Size=Dot" is a
     * 12px circle in its own right, and a count pill is just as often anchored to a container the
     * caller positions itself. Anchoring either one anyway would collapse the root to 0x0 and let
     * the badge paint over whatever sits beside it, so the hostless form stays in normal flow.
     */
    const isStandalone = children === undefined
    const isZeroHidden =
        !isDot && (badgeContent === 0 || badgeContent === undefined || badgeContent === null)
    const hidden = !!invisible || isZeroHidden

    const displayContent: ReactNode = isDot
        ? null
        : typeof badgeContent === 'number' && badgeContent > 99
          ? '99+'
          : badgeContent
    const isSingleDigitCount = typeof badgeContent === 'number' && badgeContent > 0 && badgeContent < 10

    const vertical = anchorOrigin?.vertical ?? 'top'
    const horizontal = anchorOrigin?.horizontal ?? 'right'
    const primaryBorderStyle: CSSProperties =
        color === 'primary' && !isAccentDot
            ? {
                  borderColor: isDot
                      ? 'var(--colors-badge-border-dot)'
                      : 'var(--colors-badge-border-count)',
                  borderStyle: 'solid',
                  borderWidth: isDot ? 'var(--border-badge-dot)' : 'var(--border-badge-count)',
              }
            : {}

    /**
     * An anchored badge is decoration: the host it wraps already announces the state. A hostless
     * badge has no such host, so when the caller names it we expose that name instead of leaving the
     * state carried by colour alone (WCAG 2.2 AA 1.4.1). A bare `aria-label` on a span is not
     * reliably surfaced, so it needs a role to land on. A hidden badge renders no shape at all, so
     * it keeps neither role nor name — a named image that cannot be seen misleads.
     */
    const standaloneRole = isStandalone && !hidden && ariaLabel ? { role: 'img', 'aria-label': ariaLabel } : {}
    const anchoredLabel = !isStandalone && ariaLabel ? { 'aria-label': ariaLabel } : {}

    /**
     * `className` styles the badge itself, which for an anchored badge is the inner span. A hostless
     * badge has no host, so there the badge *is* the outer element and the class belongs on the root
     * — otherwise positioning it would place it inside its own box. `relative` goes with it, since it
     * exists only to anchor an absolutely positioned badge and would fight a caller's `absolute` for
     * an unpredictable win on stylesheet order.
     */
    const rootClassName = isStandalone
        ? clsx('inline-flex shrink-0 align-middle', className)
        : 'relative inline-flex shrink-0 align-middle'

    return (
        <span
            className={rootClassName}
            data-testid={dataTest}
            style={rootStyle}
            {...anchoredLabel}
            {...standaloneRole}
            {...props}
        >
            {children}
            {!hidden && (
                <span
                    aria-hidden='true'
                    className={clsx(
                        'box-border flex items-center justify-center whitespace-nowrap font-roboto font-semibold',
                        !isStandalone && 'absolute z-[1]',
                        !isStandalone && ANCHOR_CLASS[`${vertical}-${horizontal}`],
                        isAccentDot
                            ? 'h-[8px] w-[8px] min-w-[8px] rounded-full p-0'
                            : isDot
                              ? 'h-[12px] w-[12px] min-w-[12px] rounded-full p-0'
                              : size === 'small'
                                ? 'h-[16px] w-max min-w-[16px] rounded-[20px] px-[4px] text-[0.75rem]'
                                : 'h-[20px] min-w-[20px] rounded-[20px] px-[6px] text-sm leading-5',
                        !isDot && size === 'medium' && isSingleDigitCount && 'w-[20px]',
                        !isStandalone && className,
                        slotProps?.badge?.className,
                    )}
                    style={{
                        ...(COLOR_STYLE[color] ?? COLOR_STYLE['default']),
                        ...(isAccentDot ? { backgroundColor: 'var(--colors-gama-500)' } : {}),
                        ...primaryBorderStyle,
                        ...badgeSlotStyle,
                        ...slotProps?.badge?.style,
                    }}
                >
                    {displayContent}
                </span>
            )}
            <span ref={statusRef} aria-atomic='true' aria-live='polite' className='sr-only' role='status' />
        </span>
    )
}
