import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { ArrowLeftIcon, HamburgerIcon } from 'src/components/icons'
import { StyledButton } from 'src/components/inputs/button'
import { cn } from 'src/helpers/cn'
import { useElementWidthPx } from 'src/hooks/useElementWidthPx'
import { useWidthRegistry } from 'src/hooks/useWidthRegistry'
import {
    planToolbarActions,
    type DynamicToolbarAction,
} from '../../module/header-layout/planToolbarActions'
import { ToolbarActionButton, ToolbarActionGroup } from '../../module/header-layout/ToolbarActionGroup'
import { actionKey, KEY_MORE_BUTTON, KEY_TITLE, ToolbarMeasurementStrip } from '../../module/header-layout/ToolbarMeasurement'
import { useToolbarTranslations, type ToolbarLocale } from '../../module/header-layout/useTranslations'



export interface PageHeaderAction extends DynamicToolbarAction {
    /** Count badge on the action button (e.g. unread notifications). */
    badgeCount?: number
}

export interface PageHeaderProps {
    /** Page/object title — the route heading. */
    title: string
    /** Heading element. Default `h1` (one PageHeader per route). */
    titleAs?: 'h1' | 'h2' | 'div'
    /**
     * Custom title node — for hosts that own the route heading element and its contracts
     * (e.g. the shell's `data-test="page-title"` h1 that remote widgets write into).
     * Replaces the built-in heading; the slot owns heading semantics, clamping, tooltip and
     * focus (`titleAs`/`focusTitleOnMount` are ignored). `title` still names the header for
     * measurement and skeleton sizing.
     */
    titleSlot?: ReactNode
    /** Move focus to the heading on mount — call sites remount the header per route change. */
    focusTitleOnMount?: boolean
    /** Context line under the title (subtitle, progress bar, …). */
    subtitle?: ReactNode
    /** Slot rendered right after the title (status chip, saved-state, offline indicator, help button, …). */
    status?: ReactNode
    /** Leading navigation control. Never moves into overflow. */
    leading?: 'back' | 'menu'
    onLeadingClick?: () => void
    /** i18n label for the leading control; also its accessible name when icon-only. */
    leadingLabel?: string
    /**
     * Custom leading node — for hosts whose back/menu control is an injected widget
     * (e.g. the shell's per-route Mf back buttons). Wins over `leading`; never overflows.
     */
    leadingSlot?: ReactNode
    /** Trailing actions, adaptive: labels collapse, low-priority actions overflow. */
    actions?: PageHeaderAction[]
    /** Search-mode slot: when `searchOpen`, replaces title and actions. */
    search?: ReactNode
    searchOpen?: boolean
    onSearchClose?: () => void
    /** i18n label for the search-mode close button. */
    searchCloseLabel?: string
    /** Skeleton state — renders placeholder bars instead of title and actions. */
    loading?: boolean
    /** Stick to the top of the scroll container, on the page background token. */
    sticky?: boolean
    locale?: ToolbarLocale
    className?: string
    dataTest?: string
}

/** Below this container width the header uses the mobile ramp (Figma: Mobile 0–743px). */
const COMPACT_BREAKPOINT_PX = 744
const GAP_PX = 8
/** The container's `px-4` on both sides — keep in sync with the root class. Planning must
 * work with the content box, not the border box, or actions overflow near breakpoints. */
const HORIZONTAL_PADDING_PX = 32
/** Minimum room reserved for the title before actions may keep their labels. */
const TITLE_MIN_RESERVE_PX = 120

/** Maps a PageHeaderAction to the toolbar engine's action shape. Exported for tests. */
export const toToolbarAction = (action: PageHeaderAction): DynamicToolbarAction => {
    const { badgeCount, ...action_rest } = action
    /* A label may only collapse when an icon remains — otherwise the button goes blank.
     * The planner treats undefined canHideLabel as collapsible, so guard it here. */
    const rest: DynamicToolbarAction = {
        ...action_rest,
        canHideLabel: action_rest.icon != null && action_rest.canHideLabel !== false,
    }

    if (badgeCount == null || rest.render) {
        return rest
    }

    /* The count must survive every presentation: visible button (chip + aria-label),
     * collapsed icon-only button (aria-label), and the More overflow item (label text —
     * the overflow menu renders `label`, not `render`). */
    const labelWithCount = `${rest.label} (${badgeCount})`

    return {
        ...rest,
        label: labelWithCount,
        ariaLabel: labelWithCount,
        render: ({ showLabel }) => (
            <span className='relative inline-flex'>
                <ToolbarActionButton action={{ ...rest, ariaLabel: labelWithCount }} showLabel={showLabel} />
                <span
                    aria-hidden
                    className='absolute -right-2 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border border-solid border-lime-500 bg-lime-300 px-1.5 text-sm font-semibold leading-5 text-gama-800'
                    data-testid={`${rest.dataTest ?? `page-header-action-${rest.id}`}-badge`}
                >
                    {badgeCount}
                </span>
            </span>
        ),
    }
}

function LoadingSkeleton({ compact }: { compact: boolean }): JSX.Element {
    return (
        <div className='flex w-full min-w-0 items-center justify-between gap-2' aria-hidden>
            <div className={cn('animate-pulse rounded bg-delta-100', compact ? 'h-6 w-3/5' : 'h-8 w-2/5 max-w-[500px]')} />
            <div className='h-10 w-14 shrink-0 animate-pulse rounded bg-delta-100' />
        </div>
    )
}

export function PageHeader({
    title,
    titleAs = 'h1',
    titleSlot,
    focusTitleOnMount = false,
    subtitle,
    status,
    leading,
    onLeadingClick,
    leadingLabel,
    leadingSlot,
    actions = [],
    search,
    searchOpen = false,
    onSearchClose,
    searchCloseLabel,
    loading = false,
    sticky = false,
    locale = 'en',
    className,
    dataTest = 'page-header',
}: PageHeaderProps): JSX.Element {
    const t = useToolbarTranslations(locale)
    const { ref: containerRef, widthPx: containerWidth } = useElementWidthPx<HTMLDivElement>()
    const { register, widths } = useWidthRegistry()
    /* HeadingTag can be h1/h2/div, so the ref is typed to the common denominator. */
    const headingRef = useRef<HTMLDivElement & HTMLHeadingElement>(null)

    /* Container-width adaptive (not viewport): the same header works in any slot width. */
    const compact = containerWidth > 0 && containerWidth < COMPACT_BREAKPOINT_PX

    useEffect(() => {
        if (focusTitleOnMount) {
            headingRef.current?.focus()
        }
    }, [focusTitleOnMount])

    const toolbarActions = useMemo(() => actions.filter((a) => !a.hidden).map(toToolbarAction), [actions])

    const contentWidth = Math.max(0, containerWidth - HORIZONTAL_PADDING_PX)
    /* Registry widths survive unmounts; only reserve leading space while a control exists. */
    const hasLeading = leading != null || leadingSlot != null
    const leadingWidth = hasLeading ? (widths['page-header-leading'] ?? 0) : 0
    const titleNaturalWidth = widths[KEY_TITLE] ?? 0

    /* Prioritise title space before secondary action labels: the title reserves its natural
     * width up to half the container (never less than the minimum reserve), the rest is
     * offered to the action planner. ponytail: half-container cap is a heuristic, not from
     * Figma — revisit if designs specify an exact title/actions ratio. */
    const titleReserve = Math.max(
        TITLE_MIN_RESERVE_PX,
        Math.min(titleNaturalWidth, Math.floor(contentWidth * 0.5)),
    )

    const actionsAvailableWidth = Math.max(0, contentWidth - leadingWidth - titleReserve - GAP_PX * 2)

    const plan = useMemo(
        () =>
            planToolbarActions({
                actions: toolbarActions,
                availableWidth: actionsAvailableWidth,
                collapseLabels: true,
                resolveActionWidth: (action, showLabel) => widths[actionKey(action.id, showLabel)],
                moreButtonWidthPx: widths[KEY_MORE_BUTTON],
            }),
        [toolbarActions, actionsAvailableWidth, widths],
    )

    const resolvedLeadingLabel = leadingLabel ?? (leading === 'menu' ? t.menu : t.back)

    const leadingControl = leadingSlot != null ? (
        <span ref={register('page-header-leading')} className='inline-flex shrink-0'>
            {leadingSlot}
        </span>
    ) : leading == null ? null : (
            <span ref={register('page-header-leading')} className='inline-flex shrink-0'>
                {leading === 'menu' ? (
                    <StyledButton
                        dataTest={`${dataTest}-menu`}
                        variant='text'
                        size='large'
                        onClick={onLeadingClick}
                        aria-label={resolvedLeadingLabel}
                        startIcon={<HamburgerIcon width={24} height={24} />}
                    />
                ) : compact ? (
                    <StyledButton
                        dataTest={`${dataTest}-back`}
                        variant='text'
                        size='large'
                        onClick={onLeadingClick}
                        aria-label={resolvedLeadingLabel}
                        startIcon={<ArrowLeftIcon width={24} height={24} />}
                    />
                ) : (
                    <StyledButton
                        dataTest={`${dataTest}-back`}
                        variant='outlined'
                        size='large'
                        onClick={onLeadingClick}
                        startIcon={<ArrowLeftIcon width={20} height={20} />}
                    >
                        {resolvedLeadingLabel}
                    </StyledButton>
                )}
            </span>
        )

    const HeadingTag = titleAs

    const titleBlock = (
        <div className='flex min-w-0 flex-1 flex-col justify-center'>
            <div className='flex min-w-0 items-center gap-2'>
                {titleSlot != null ? (
                    <div ref={register(KEY_TITLE, 'scroll')} className='min-w-0'>
                        {titleSlot}
                    </div>
                ) : (
                <HeadingTag
                    ref={headingRef}
                    tabIndex={focusTitleOnMount ? -1 : undefined}
                    title={title}
                    className={cn(
                        /* AC: title wraps to a 2-line max, then truncates — at every width. Full
                         * string stays in the DOM (clamp is visual only), so the accessible name
                         * is always the complete title. */
                        'm-0 line-clamp-2 min-w-0 break-words font-semibold text-delta-800 outline-none',
                        compact ? 'text-xl leading-7' : 'text-2xl leading-8',
                    )}
                >
                    <span ref={register(KEY_TITLE, 'scroll')}>{title}</span>
                </HeadingTag>
                )}
                {status != null && <span className='shrink-0'>{status}</span>}
            </div>
            {subtitle != null && <div className='mt-0.5 min-w-0 text-sm text-delta-700'>{subtitle}</div>}
        </div>
    )

    const searchRow = (
        <div className='flex w-full min-w-0 items-center gap-2'>
            <div className='min-w-0 flex-1'>{search}</div>
            <StyledButton dataTest={`${dataTest}-search-close`} variant='text' size='large' onClick={onSearchClose}>
                {searchCloseLabel ?? t.close}
            </StyledButton>
        </div>
    )

    return (
        <div
            ref={containerRef}
            data-testid={dataTest}
            data-compact={compact ? 'true' : 'false'}
            aria-busy={loading || undefined}
            className={cn(
                'flex w-full items-center gap-2 px-4',
                compact ? 'min-h-[64px] py-3' : 'min-h-[72px] py-4',
                sticky && 'sticky top-0 z-30 bg-delta-50',
                className,
            )}
        >
            <ToolbarMeasurementStrip actions={toolbarActions} register={register} overflowMenuLabel={t.more} />

            {loading ? (
                <LoadingSkeleton compact={compact} />
            ) : searchOpen && search != null ? (
                searchRow
            ) : (
                <>
                    {leadingControl}
                    {titleBlock}
                    <ToolbarActionGroup plan={plan} overflowMenuLabel={t.more} />
                </>
            )}
        </div>
    )
}
