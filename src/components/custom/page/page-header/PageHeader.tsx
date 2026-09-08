import { useMergeRefs } from '@floating-ui/react'
import { useMemo, useRef, type ReactNode, type Ref } from 'react'
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
import {
    actionKey,
    KEY_LEADING,
    KEY_MORE_BUTTON,
    KEY_STATUS,
    KEY_TITLE,
    ToolbarMeasurementStrip,
} from '../../module/header-layout/ToolbarMeasurement'
import { useToolbarTranslations, type ToolbarLocale } from '../../module/header-layout/useTranslations'
import {
    useIsTitleClamped,
    useSearchFocus,
    useStickyScrollPadding,
    useStuckOnScroll,
} from './PageHeader.hooks'

export interface PageHeaderAction extends DynamicToolbarAction {
    /** Count badge on the action button (e.g. unread notifications). */
    badgeCount?: number
}

export interface PageHeaderProps {
    /** Page/object title — the route heading. PageHeader owns the heading element. */
    title: string
    /** Heading element. Default `h1` (one PageHeader per route). */
    titleAs?: 'h1' | 'h2' | 'div'
    /** Heading test id, emitted as both `data-test` and `data-testid`. */
    titleDataTest?: string
    /** Heading ref. For route-change focus pass `useRouteHeadingFocus(pathname)`
     * from a component that survives the host's route changes. */
    titleRef?: Ref<HTMLHeadingElement>
    /** Context line under the title (subtitle, progress bar, …). */
    subtitle?: ReactNode
    /** Slot rendered right after the title (status chip, saved-state, help button, …). */
    status?: ReactNode
    /** Leading navigation control. Never moves into overflow, never disappears. */
    leading?: 'back' | 'menu'
    onLeadingClick?: () => void
    /** i18n label for the leading control; also its accessible name when icon-only. */
    leadingLabel?: string
    /** Custom leading node (e.g. an injected widget). Wins over `leading`; never overflows. */
    leadingSlot?: ReactNode
    /** Trailing actions, adaptive: labels collapse, low-priority actions overflow. */
    actions?: PageHeaderAction[]
    /** Search-mode slot: when `searchOpen`, replaces title and actions (nav stays). */
    search?: ReactNode
    searchOpen?: boolean
    onSearchClose?: () => void
    /** i18n label for the search-mode close button. */
    searchCloseLabel?: string
    /** Skeleton state — placeholder bars replace title and actions (nav stays). */
    loading?: boolean
    /** Stick to the top of the scroll container; compacts once scrolled (data-stuck). */
    sticky?: boolean
    locale?: ToolbarLocale
    className?: string
    dataTest?: string
}

/** Below this container width the header uses the mobile type ramp (Figma: Mobile 0–743px). */
const COMPACT_BREAKPOINT_PX = 744
const GAP_PX = 8
/** The container's `px-4` on both sides — keep in sync with the root class. */
const HORIZONTAL_PADDING_PX = 32
/** Minimum room reserved for the title before actions may keep their labels. */
const TITLE_MIN_RESERVE_PX = 120

/** Maps a PageHeaderAction to the toolbar engine's action shape. Exported for tests. */
export const toToolbarAction = (action: PageHeaderAction): DynamicToolbarAction => {
    const { badgeCount, ...action_rest } = action
    /* A label may only collapse when an icon remains — otherwise the button goes blank. */
    const rest: DynamicToolbarAction = {
        ...action_rest,
        canHideLabel: action_rest.icon != null && action_rest.canHideLabel !== false,
    }

    if (badgeCount == null || rest.render) {
        return rest
    }

    /* The count must survive every presentation: chip, aria-label and overflow label. */
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
    titleAs: HeadingTag = 'h1',
    titleDataTest,
    titleRef,
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
    const headingRef = useRef<(HTMLDivElement & HTMLHeadingElement) | null>(null)
    const sentinelRef = useRef<HTMLDivElement>(null)
    const searchAreaRef = useRef<HTMLDivElement>(null)

    /* Container-width adaptive (not viewport); drives only the type ramp. */
    const compact = containerWidth > 0 && containerWidth < COMPACT_BREAKPOINT_PX

    const setHeadingRef = useMergeRefs([headingRef, titleRef])

    const searchMode = searchOpen && search != null
    /* Loading/search hide the title row visually, but the heading element stays
     * (same node identity, so focus on it survives state flips). */
    const headingHidden = loading || searchMode

    useSearchFocus(search != null, searchOpen, searchAreaRef, headingRef)
    const stuck = useStuckOnScroll(sticky, sentinelRef)
    useStickyScrollPadding(sticky, containerRef)
    const titleClamped = useIsTitleClamped(headingRef, title, !headingHidden)

    const toolbarActions = useMemo(() => actions.filter((a) => !a.hidden).map(toToolbarAction), [actions])

    const contentWidth = Math.max(0, containerWidth - HORIZONTAL_PADDING_PX)
    /* Registry widths survive unmounts; only reserve slot space while a slot exists. */
    const hasLeading = leading != null || leadingSlot != null
    const hasStatus = status != null
    const leadingWidth = hasLeading ? (widths[KEY_LEADING] ?? 0) : 0
    const statusWidth = hasStatus ? (widths[KEY_STATUS] ?? 0) : 0
    const titleNaturalWidth = widths[KEY_TITLE] ?? 0

    /* Title reserves its natural width up to half the container; the rest goes to actions.
     * ponytail: half-container cap is a heuristic, not from Figma. */
    const titleReserve = Math.max(
        TITLE_MIN_RESERVE_PX,
        Math.min(titleNaturalWidth, Math.floor(contentWidth * 0.5)),
    )

    /* One gap per rendered neighbour: leading | title row | status | actions. */
    const gapCount = 1 + (hasLeading ? 1 : 0) + (hasStatus ? 1 : 0)
    const actionsAvailableWidth = Math.max(
        0,
        contentWidth - leadingWidth - statusWidth - titleReserve - GAP_PX * gapCount,
    )

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

    const leadingButton: ReactNode =
        leadingSlot ?? (leading === 'menu' ? (
            <StyledButton
                dataTest={`${dataTest}-menu`}
                variant='text'
                size='large'
                onClick={onLeadingClick}
                aria-label={resolvedLeadingLabel}
                startIcon={<HamburgerIcon width={24} height={24} />}
            />
        ) : leading === 'back' ? (
            <StyledButton
                dataTest={`${dataTest}-back`}
                variant={compact ? 'text' : 'outlined'}
                size='large'
                onClick={onLeadingClick}
                aria-label={compact ? resolvedLeadingLabel : undefined}
                startIcon={<ArrowLeftIcon width={compact ? 24 : 20} height={compact ? 24 : 20} />}
            >
                {compact ? undefined : resolvedLeadingLabel}
            </StyledButton>
        ) : null)

    const smallType = compact || stuck

    /* One heading element for every state, so focus on it survives state transitions. */
    const heading = title === '' ? null : (
        <HeadingTag
            ref={setHeadingRef}
            tabIndex={-1}
            data-test={titleDataTest}
            data-testid={titleDataTest}
            title={titleClamped ? title : undefined}
            className={cn(
                /* 2-line clamp is visual only — the accessible name stays the full title. */
                'm-0 line-clamp-2 min-w-0 break-words font-semibold text-delta-800 outline-none',
                smallType ? 'text-xl leading-7' : 'text-2xl leading-8',
            )}
        >
            {title}
        </HeadingTag>
    )

    return (
        <>
            {/* Zero-height sibling above the sticky row — scrolled out means the header is stuck. */}
            {sticky && <div ref={sentinelRef} aria-hidden className='h-px w-full' style={{ marginBottom: -1 }} />}
            <div
                ref={containerRef}
                data-testid={dataTest}
                data-compact={compact ? 'true' : 'false'}
                data-stuck={stuck ? 'true' : 'false'}
                aria-busy={loading || undefined}
                className={cn(
                    /* Same base height across breakpoints; content may expand it. */
                    'flex w-full items-center gap-2 px-4',
                    stuck ? 'min-h-[56px] py-2 shadow-sm' : 'min-h-[64px] py-3',
                    sticky && 'sticky top-0 z-30 bg-delta-50',
                    className,
                )}
            >
                <ToolbarMeasurementStrip
                    actions={toolbarActions}
                    register={register}
                    overflowMenuLabel={t.more}
                    title={title}
                    titleClassName={cn('font-semibold', smallType ? 'text-xl leading-7' : 'text-2xl leading-8')}
                />

                {/* Leading navigation stays through every state (never overflows/hides). */}
                {leadingButton != null && (
                    <span ref={register(KEY_LEADING)} className='inline-flex shrink-0'>
                        {leadingButton}
                    </span>
                )}

                {/* `sr-only` removes the hidden title from flex flow while keeping heading semantics. */}
                <div className={cn(headingHidden ? 'sr-only' : 'flex min-w-0 flex-1 flex-col justify-center')}>
                    <div className='flex min-w-0 items-center gap-2'>
                        {/* An empty title renders no heading — an empty h1 is an a11y defect. */}
                        {heading}
                        {hasStatus && !headingHidden && (
                            <span ref={register(KEY_STATUS)} className='inline-flex shrink-0 items-center'>
                                {status}
                            </span>
                        )}
                    </div>
                    {/* Compact-on-scroll drops the context line so the stuck header takes minimal space. */}
                    {!headingHidden && subtitle != null && !stuck && (
                        <div className='mt-0.5 min-w-0 text-sm text-delta-700'>{subtitle}</div>
                    )}
                </div>

                {loading && <LoadingSkeleton compact={compact} />}

                {searchMode && (
                    <div ref={searchAreaRef} className='flex w-full min-w-0 items-center gap-2'>
                        <div className='min-w-0 flex-1'>{search}</div>
                        <StyledButton
                            dataTest={`${dataTest}-search-close`}
                            variant='text'
                            size='large'
                            onClick={onSearchClose}
                        >
                            {searchCloseLabel ?? t.close}
                        </StyledButton>
                    </div>
                )}

                {!loading && !searchMode && (
                    <ToolbarActionGroup
                        plan={plan}
                        overflowMenuLabel={t.more}
                        registerActionWidth={(actionId, showLabel) => register(actionKey(actionId, showLabel))}
                    />
                )}
            </div>
        </>
    )
}
