import { useMemo, useState, type ReactNode } from 'react'

import { DotsVerticalIcon } from 'src/components/icons'
import { StyledButton, type StyledButtonType } from 'src/components/inputs/button'
import { StyledMenu } from 'src/components/navigation/menu/StyledMenu'
import { StyledMenuItem } from 'src/components/navigation/menu/StyledMenuItem'
import { cn } from 'src/helpers/cn'
import { useElementWidthPx } from 'src/hooks/useElementWidthPx'
import { useWidthRegistry } from 'src/hooks/useWidthRegistry'

import {
    planToolbarActions,
    type DynamicToolbarAction,
} from '../../../custom/module/header-layout/planToolbarActions'
import { ToolbarActionButton } from '../../../custom/module/header-layout/ToolbarActionGroup'
import { useToolbarTranslations, type ToolbarLocale } from '../../../custom/module/header-layout/useTranslations'

/**
 * Figma specifies only the two endpoints of the responsive band — the 600px desktop
 * footer (16px padding/gap) and the 360px mobile footer (8px padding/gap). The switch
 * point between them is ours; 470 matches the container query the one existing
 * hand-rolled implementation already shipped (`adopus-app-directory` NoteFormFooter),
 * so migrating it is a visual no-op.
 */
const COMPACT_BREAKPOINT_PX = 470
const GAP_PX = 8
const KEY_RIGHT_CLUSTER = 'dialog-footer-right'
const KEY_MORE_BUTTON = 'dialog-footer-more'
const actionKey = (id: string, showLabel: boolean): string => `dialog-footer-action:${id}:${showLabel ? 'label' : 'icon'}`

/** One of the two right-cluster buttons (Figma "Right": Cancel + primary). */
export interface StyledDialogFooterButton {
    label: string
    onClick?: () => void
    disabled?: boolean
    /** `submit` lets the footer drive the surrounding `<form>` without a click handler. */
    type?: 'button' | 'submit' | 'reset'
    /** Overrides the cluster default (`contained` for primary, `outlined` for secondary). */
    variant?: StyledButtonType
    /** Renders in the destructive palette (Figma `Danger = on`). */
    tone?: 'default' | 'danger'
    icon?: ReactNode
    dataTest?: string
    ariaLabel?: string
}

export interface StyledDialogFooterProps {
    /**
     * Left cluster (Figma "Left"): destructive and utility actions. They keep their
     * labels while they fit, collapse to icon-only next, and move into an icon-only
     * "More" menu once even that overflows — so 1, 2, 3 and 3+ actions all resolve to
     * the approved layout without the caller branching on width.
     */
    leftActions?: DynamicToolbarAction[]
    /** Replaces the planned left cluster with arbitrary content — Figma's "Checkbox+Label" left variant, or footer info text. */
    leadingSlot?: ReactNode
    /** Outlined action left of the primary — Cancel. */
    secondaryAction?: StyledDialogFooterButton
    /** Rightmost contained action — Save changes / Add new …. */
    primaryAction?: StyledDialogFooterButton
    /** Pins the footer to the bottom of its scroll container with the DS `Fixed bottom` shadow. */
    fixed?: boolean
    /** Bottom corners rounded to sit flush inside a dialog paper. Pass `false` for a full-bleed page footer. */
    rounded?: boolean
    locale?: ToolbarLocale
    className?: string
    dataTest?: string
}

/**
 * Developer: alexandr.doicov@carasent.com
 *
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#26769-135283
 * @remarks Figma "Dialog footer" component set. The Figma `State` property
 * (Create/Edit/More/Reset filter) is **not** a prop — it is the emergent result of which
 * actions the caller passes and how much room the container leaves, which is the whole
 * point of ASMA-7099. `Mobile` is likewise derived from the **container** width, not the
 * viewport, so a footer inside a narrow popover compacts even on a desktop screen.
 *
 * Layout: `Left` cluster (planned, adaptive) · `Right` cluster (Cancel + primary, always
 * visible and never overflowed — the primary action must stay reachable).
 *
 * @param leftActions - adaptive left cluster; label → icon-only → More menu
 * @param leadingSlot - arbitrary left content, replaces `leftActions`
 * @param secondaryAction - outlined Cancel
 * @param primaryAction - contained primary
 * @param fixed - sticky bottom + `Fixed bottom` shadow
 * @param rounded - rounded bottom corners (default `true`)
 */
export function StyledDialogFooter({
    leftActions = [],
    leadingSlot,
    secondaryAction,
    primaryAction,
    fixed = false,
    rounded = true,
    locale = 'en',
    className,
    dataTest = 'styled-dialog-footer',
}: StyledDialogFooterProps): JSX.Element {
    const t = useToolbarTranslations(locale)
    const { ref: containerRef, widthPx: containerWidth } = useElementWidthPx<HTMLDivElement>()
    const { register, widths } = useWidthRegistry()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    const compact = containerWidth > 0 && containerWidth < COMPACT_BREAKPOINT_PX
    const paddingPx = compact ? 8 : 16

    /**
     * An icon-less action has nothing left to render once its label collapses — it would
     * become a blank button. Such an action keeps its label and moves into the More menu
     * instead. An explicit `canHideLabel` from the caller still wins.
     *
     * ponytail: the same hazard exists in `collapseLabelsFromLeft` for every planner
     * consumer (a `DynamicToolbar`/`PageHeader` action without an icon collapses to an
     * empty button too); fixing it there would change those components' width decisions,
     * so it is guarded here and reported separately.
     */
    const visibleLeftActions = useMemo(
        () =>
            leftActions
                .filter((action) => !action.hidden)
                .map((action) =>
                    action.icon == null && action.canHideLabel == null
                        ? { ...action, canHideLabel: false }
                        : action,
                ),
        [leftActions],
    )

    /* The right cluster is measured rather than estimated: its labels are caller-supplied
     * and never collapse, so whatever it takes is simply unavailable to the left cluster. */
    const rightClusterWidth = widths[KEY_RIGHT_CLUSTER] ?? 0
    const hasRightCluster = secondaryAction != null || primaryAction != null
    const leftAvailableWidth = Math.max(
        0,
        containerWidth - paddingPx * 2 - rightClusterWidth - (hasRightCluster ? GAP_PX : 0),
    )

    const plan = useMemo(
        () =>
            planToolbarActions({
                actions: visibleLeftActions,
                availableWidth: leftAvailableWidth,
                collapseLabels: true,
                resolveActionWidth: (action, showLabel) => widths[actionKey(action.id, showLabel)],
                moreButtonWidthPx: widths[KEY_MORE_BUTTON],
            }),
        [visibleLeftActions, leftAvailableWidth, widths],
    )

    const renderButton = (button: StyledDialogFooterButton, fallbackVariant: StyledButtonType, key: string): JSX.Element => (
        <StyledButton
            dataTest={button.dataTest ?? `${dataTest}-${key}`}
            variant={button.variant ?? fallbackVariant}
            error={button.tone === 'danger'}
            size='medium'
            type={button.type ?? 'button'}
            disabled={button.disabled}
            startIcon={button.icon}
            onClick={button.onClick}
            aria-label={button.ariaLabel}
        >
            {button.label}
        </StyledButton>
    )

    return (
        <div
            ref={containerRef}
            data-testid={dataTest}
            className={cn(
                'flex items-center justify-end border-0 border-t border-solid border-delta-200 bg-white',
                compact ? 'gap-2 p-2' : 'gap-4 p-4',
                rounded && 'rounded-b-lg',
                /* DS effect style "Fixed bottom". */
                fixed && 'sticky bottom-0 z-[1] shadow-[0_0_16px_0_rgba(34,33,51,0.2)]',
                className,
            )}
        >
            <div className='flex shrink-0 flex-nowrap items-center gap-2'>
                {leadingSlot ?? (
                    <>
                        {plan.inlineActions.map(({ action, showLabel }) => (
                            <span
                                key={action.id}
                                ref={register(actionKey(action.id, showLabel))}
                                className='inline-flex shrink-0'
                            >
                                <ToolbarActionButton action={action} showLabel={showLabel} />
                            </span>
                        ))}

                        {plan.showMoreMenu && (
                            <>
                                {/* Figma "More": outlined, icon-only, 40x40 — never labelled in a footer. */}
                                <span ref={register(KEY_MORE_BUTTON)} className='inline-flex shrink-0'>
                                    <StyledButton
                                        dataTest={`${dataTest}-more`}
                                        variant='outlined'
                                        size='medium'
                                        type='button'
                                        onClick={(event) => setAnchorEl(event.currentTarget)}
                                        aria-label={t.more}
                                        aria-haspopup='menu'
                                        aria-expanded={anchorEl != null}
                                        startIcon={<DotsVerticalIcon width={24} height={24} />}
                                    />
                                </span>

                                {/* Opens upward: a footer sits at the bottom edge of its container. */}
                                <StyledMenu
                                    anchorEl={anchorEl}
                                    open={anchorEl != null}
                                    onClose={() => setAnchorEl(null)}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                                    transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                >
                                    {plan.overflowActions.map((action) => (
                                        <StyledMenuItem
                                            key={action.id}
                                            disabled={action.disabled}
                                            onClick={() => {
                                                setAnchorEl(null)
                                                action.onClick()
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    'flex items-center gap-2',
                                                    action.tone === 'danger' ? 'text-beta-500' : 'text-delta-700',
                                                )}
                                            >
                                                {action.icon}
                                                <span>{action.label}</span>
                                            </div>
                                        </StyledMenuItem>
                                    ))}
                                </StyledMenu>
                            </>
                        )}
                    </>
                )}
            </div>

            {hasRightCluster && (
                /* Figma "Right": flex-1 + justify-end, so it claims the slack and pins itself to the
                 * right edge while the Left cluster stays at the left edge. The measured node is the
                 * inner, non-growing span — measuring the flex-1 wrapper would report the width it
                 * grew to rather than the width the buttons need, leaving the left cluster no budget. */
                <span className='flex min-w-px flex-1 flex-nowrap items-center justify-end'>
                    <span
                        ref={register(KEY_RIGHT_CLUSTER)}
                        className='flex shrink-0 flex-nowrap items-center gap-2'
                    >
                        {secondaryAction && renderButton(secondaryAction, 'outlined', 'secondary')}
                        {primaryAction && renderButton(primaryAction, 'contained', 'primary')}
                    </span>
                </span>
            )}
        </div>
    )
}
