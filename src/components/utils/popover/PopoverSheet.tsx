import { useCallback, useEffect, useId, useRef, useState, type FocusEvent, type MouseEvent, type ReactNode } from 'react'
import {
    autoUpdate,
    flip,
    FloatingPortal,
    offset,
    shift,
    size as sizeMiddleware,
    useDismiss,
    useFloating,
    useInteractions,
    useMergeRefs,
} from '@floating-ui/react'

import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { cn } from 'src/helpers/cn'
import { firstTabbable } from 'src/helpers/focusable'
import { OverlayBackOwnerContext, requestCloseTopOverlayBack, useBackCloses } from 'src/hooks/useBackCloses.hook'
import { useDebouncedValue } from 'src/hooks/useDebouncedValue.hook'
import { useFocusTrap } from 'src/hooks/useFocusTrap.hook'
import { useMobileMediaQuery } from 'src/hooks/useMediaQuery.hook'
import { formatResultsLabel } from '../bottom-sheet/formatResultsLabel'
import { StyledBottomSheet } from '../bottom-sheet/StyledBottomSheet'
import { PopoverAnatomy, POPOVER_SURFACE_CLASSNAME } from './PopoverAnatomy'
import {
    getOpenModalDialogAncestor,
    shouldUsePopoverTopLayer,
    TOP_LAYER_PROPS,
    TOP_LAYER_RESET_STYLE,
    useTopLayerRef,
} from 'src/hooks/useTopLayer.hook'

/** Spread on the trigger element. The ref is handed over separately — `StyledButton` takes `refLink`. */
export interface PopoverTriggerProps {
    onClick: (event: MouseEvent<HTMLElement>) => void
    'aria-expanded': boolean
    'aria-controls': string | undefined
    'aria-haspopup': 'dialog' | undefined
    'aria-describedby': string | undefined
}

export interface PopoverTrigger {
    /** Pass to `ref` on a native element, or to `refLink` on `StyledButton`. */
    ref: (node: HTMLElement | null) => void
    triggerProps: PopoverTriggerProps
    isOpen: boolean
}

/** Content API handed to every slot that can be a render-prop. */
export interface PopoverContentApi {
    close: () => void
}

/** A slot that may need to close the surface — e.g. "View results (3)" or an Actions button. */
export type PopoverSlot = ReactNode | ((api: PopoverContentApi) => ReactNode)

const MIN_WIDTH_PX = 240
const MAX_WIDTH_PX = { info: 472, action: 472 } as const
const MAX_HEIGHT_RATIO = 0.6
const MOBILE_WIDTH = 'calc(100vw - 32px)'

/** @figmaNode wXrXt5uKNNzV2DnQCgyYZH#44531-233781 (Design-System · "_Popover") */
export interface PopoverSheetProps {
    /** @figmaProp none — test hook */
    dataTest: string
    /** @figmaProp none — behavioral: the consumer owns the trigger element, this wires its aria + click */
    renderTrigger: (trigger: PopoverTrigger) => ReactNode
    /**
     * Chosen by content, not by breakpoint.
     * @figmaProp none — `info` is a read-only container referenced by `aria-describedby`;
     * `action` is a `role="dialog"` with a focus trap.
     */
    variant?: 'info' | 'action'
    /** @figmaProp Title = ReactNode→true | undefined→false */
    title?: ReactNode
    /** @figmaProp Slot — the body. The render-prop form receives `close()` for the Actions pattern. */
    children: PopoverSlot
    /**
     * Left slot of the Figma "Reset filter" row — the "View results (3)" affordance, which reports
     * the live match count and closes the surface (the filter itself already applied).
     * @figmaProp Reset filter = ReactNode→true | undefined→false — the 4px footer row, left slot
     */
    viewResultsAction?: PopoverSlot
    /** @figmaProp Reset filter = ReactNode→true | undefined→false — the 4px footer row, right slot */
    resetAction?: PopoverSlot
    /** @figmaProp Actions = ReactNode→true | undefined→false — the 12px footer row, right-aligned */
    footerActions?: PopoverSlot
    /**
     * Result total for the standard "Vis resultater (N)" control, rendered when no `viewResultsAction`
     * is given (see `formatResultsLabel`). On mobile the sheet also announces it from its own live
     * region, because the list behind is inert. `null` = total unavailable.
     * @figmaProp none — behavioral
     */
    resultCount?: number | null
    /** @figmaProp none — a11y: accessible name of the close control */
    closeLabel?: string
    /** @figmaProp none — a11y: required when `variant='action'` and no `title` is given, so the dialog has a name */
    ariaLabel?: string
    /** @figmaProp none — behavioral */
    onOpenChange?: (isOpen: boolean) => void
    /** @figmaProp none — style escape hatch, applied to the surface */
    className?: string
    /**
     * Which trigger edge the surface lines up with. `auto` picks once per open: `end` when the
     * trigger's centre is in the right half of the viewport, otherwise `start`.
     * @figmaProp none — behavioral
     */
    align?: 'start' | 'end' | 'auto'
    /**
     * CSS selectors for overlays rendered outside React (e.g. DevExtreme's `.dx-overlay-wrapper`).
     * Pressing or focusing inside them counts as inside the surface.
     * @figmaProp none — behavioral
     */
    ignoreOutside?: string[]
}

type Side = 'top' | 'bottom'

/**
 * ASMA Design System **Popover** (ASMA-8183) — an anchored overlay with the DS surface, an optional
 * title, a required close control and two optional footer rows.
 *
 * Two variants, chosen by content:
 * - **info** — read-only. Plain container referenced by `aria-describedby`, focus moves to the
 *   container on open, `Tab` leaves and closes.
 * - **action** — interactive. `role="dialog"`, focus trapped, focus moves to the first control.
 *   Covers both the Filter pattern (changes apply immediately, `Nullstill` clears) and the Actions
 *   pattern (a list of buttons; activation closes via the `close()` render-prop argument).
 *
 * There is deliberately **no `role="menu"` and no arrow-key navigation** — everything inside is
 * navigated with `Tab`, and menu semantics cannot coexist with the dialog model used by Filter.
 * There is also **no arrow/anchor pointer**: the surface is edge-aligned at an 8px offset and
 * proximity carries the relationship.
 *
 * Below 744px `action` renders as a {@link StyledBottomSheet} (ASMA-8184) — same props, same content;
 * `info` stays anchored at every size, because for an explanation the link to its term is the point.
 *
 * Separate from {@link StyledPopover}, which stays as the MUI-parity positioning primitive its eight
 * internal consumers still depend on; those migrate here gradually.
 */
export const PopoverSheet = ({
    dataTest,
    renderTrigger,
    variant = 'info',
    title,
    children,
    viewResultsAction,
    resetAction,
    footerActions,
    resultCount,
    closeLabel = 'Lukk',
    ariaLabel,
    onOpenChange,
    className,
    align = 'auto',
    ignoreOutside,
}: PopoverSheetProps): JSX.Element => {
    const panelId = useId()
    const titleId = `${panelId}-title`

    const [isOpen, setIsOpen] = useState(false)
    const [portalRoot, setPortalRoot] = useState<HTMLElement>()
    const [maxHeightPx, setMaxHeightPx] = useState<number>()
    // Position is decided once per open and then only follows the trigger: the edge from where the
    // trigger sits, the side from the first positioning, and the width only ever grows. Content
    // changing while open (chips, counts, async options) must not move the surface.
    const [openAlign, setOpenAlign] = useState<'start' | 'end'>('start')
    const [lockedSide, setLockedSide] = useState<Side>()
    const [minWidthPx, setMinWidthPx] = useState(MIN_WIDTH_PX)

    const isMobile = useMobileMediaQuery()
    const isDialog = variant === 'action'
    // Spec: on mobile an Info popover always sits below its trigger — flipping above would cover the
    // very term it explains. Action below 744px is a Bottom Sheet instead of an anchored surface.
    const keepBelowTrigger = isMobile && !isDialog
    const isSheet = isMobile && isDialog

    const changeOpen = useCallback(
        (next: boolean) => {
            setIsOpen(next)
            onOpenChange?.(next)
        },
        [onOpenChange],
    )

    const { refs, floatingStyles, context, placement, isPositioned } = useFloating({
        open: isOpen,
        onOpenChange: changeOpen,
        placement: `${lockedSide ?? 'bottom'}-${openAlign}`,
        strategy: 'fixed',
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(8),
            ...(keepBelowTrigger || lockedSide
                ? []
                : [flip({ padding: 8, crossAxis: false, flipAlignment: false })]),
            shift({ padding: 8 }),
            sizeMiddleware({
                padding: 8,
                apply({ availableHeight, rects }) {
                    setMaxHeightPx(Math.min(availableHeight, Math.round(window.innerHeight * MAX_HEIGHT_RATIO)))
                    if (!isMobile) setMinWidthPx((current) => Math.max(current, rects.floating.width))
                },
            }),
        ],
    })
    if (isOpen && isPositioned && !lockedSide) setLockedSide(placement.startsWith('top') ? 'top' : 'bottom')

    const usePopoverLayer = shouldUsePopoverTopLayer(portalRoot)
    // Tracked as state as well as a ref: `FloatingPortal` creates its portal node in an effect, so
    // on the commit that opens the surface the panel is not in the DOM yet and a ref read from an
    // effect body is still null. State makes the focus effects below re-run once it exists.
    const panelRef = useRef<HTMLDivElement | null>(null)
    const [panelNode, setPanelNode] = useState<HTMLDivElement | null>(null)
    const setPanel = useCallback((node: HTMLDivElement | null) => {
        panelRef.current = node
        setPanelNode(node)
    }, [])
    const floatingRef = useMergeRefs([useTopLayerRef(refs.setFloating, usePopoverLayer), setPanel])

    // Our own handle on the trigger rather than Floating UI's `refs.domReference`: that one is typed
    // `Element`, which has no `.focus()`, and reading it inside an effect also trips
    // `react-hooks/exhaustive-deps`. A plain ref is both correctly typed and stable.
    const triggerRef = useRef<HTMLElement | null>(null)
    const setTrigger = useCallback(
        (node: HTMLElement | null) => {
            triggerRef.current = node
            refs.setReference(node)
        },
        [refs],
    )

    // Focus inside portalled children (select listbox, calendar, tooltip, a full-screen picker) never
    // lands in the panel's DOM, but its React focus event still bubbles through the panel. The panel
    // records the target; document listeners run after React's and compare against it.
    const treeFocusTargetRef = useRef<EventTarget | null>(null)
    const ignoreOutsideSelector = ignoreOutside?.length ? ignoreOutside.join(',') : undefined
    const ignoreOutsideRef = useRef(ignoreOutsideSelector)
    useEffect(() => {
        ignoreOutsideRef.current = ignoreOutsideSelector
    }, [ignoreOutsideSelector])
    const isInsideLayer = useCallback((target: EventTarget | null): boolean => {
        if (!(target instanceof Element)) return false
        if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return true
        if (treeFocusTargetRef.current === target) return true
        const selector = ignoreOutsideRef.current
        return selector !== undefined && target.closest(selector) !== null
    }, [])
    const lastPanelFocusRef = useRef<HTMLElement | null>(null)
    const recordTreeFocus = useCallback((event: FocusEvent) => {
        treeFocusTargetRef.current = event.target
        if (event.target instanceof HTMLElement && panelRef.current?.contains(event.target)) {
            lastPanelFocusRef.current = event.target
        }
    }, [])

    // The trigger owns opening, so a press on it must not also register as an outside-press — on touch
    // that races the popover shut in the same tap. Pressing a *different* popover's trigger is still
    // outside, which is what gives "only one popover open at a time" for free. Presses inside React
    // children are already ignored by Floating UI; this also keeps other floating layers, a nested
    // dialog and `ignoreOutside` overlays (not rendered by React) from counting as outside.
    // Off in sheet mode: with no floating element every press inside the sheet would count as an
    // outside press and close it. The sheet owns its own dismiss routes.
    // Escape is not handed to `useDismiss` — see the window listener below.
    const dismiss = useDismiss(context, {
        enabled: !isSheet,
        escapeKey: false,
        outsidePress: (event) => {
            const target = event.target
            if (!(target instanceof Element)) return true
            if (isInsideLayer(target) || target.closest('[data-floating-ui-portal]')) return false
            const dialog = target.closest('dialog[open], [role="dialog"]')
            return !dialog || dialog.contains(panelRef.current)
        },
    })
    const { getFloatingProps } = useInteractions([dismiss])

    const close = useCallback(() => {
        changeOpen(false)
    }, [changeOpen])

    useBackCloses({ active: isOpen, requestClose: close, ownerRef: panelRef })

    // Escape is heard on `window`, after every nested layer had its turn — same model as
    // `StyledDialog`. A select, autocomplete, date picker or calendar that handles Escape claims it
    // with `preventDefault()` or `stopPropagation()`; anything left closes the innermost open layer
    // through the Back stack, which is this surface unless a child registered above it (#271).
    useEffect(() => {
        if (!isOpen || isSheet) return
        const closeOnEscape = (event: KeyboardEvent): void => {
            if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return
            event.preventDefault()
            event.stopImmediatePropagation()
            void requestCloseTopOverlayBack(event)
        }
        window.addEventListener('keydown', closeOnEscape)
        return () => window.removeEventListener('keydown', closeOnEscape)
    }, [isOpen, isSheet])

    // Focus is managed by hand rather than with `FloatingFocusManager`, because that renders focus
    // guards (`tabindex=0` + `aria-hidden`) which axe fails as `aria-hidden-focus` — a rule this
    // package drove to zero in ASMA-8143 by fixing, not waiving. Turning the guards off is not an
    // option either: the guards are what implement both the trap's Tab wrap-around and the info
    // variant's "Tab leaves and closes". So: the package's own `useFocusTrap` for the action
    // variant, and a focus-out listener for the info variant.

    // Action = trapped, focus restored on teardown. Escape is deliberately NOT handed to the hook:
    // `useDismiss` already owns that key, and passing `close` here would make the trap effect
    // re-subscribe on every parent render (consumers write `onOpenChange` inline, so `close`
    // changes identity), tearing the trap down and rebuilding it on each keystroke.
    useFocusTrap(isOpen && isDialog && panelNode !== null, panelRef)

    // How the trigger was activated — set by `handleTriggerClick` in the same batch as the open.
    const [openedWithKeyboard, setOpenedWithKeyboard] = useState(false)

    // `useFocusTrap` lands on the panel shell (as `StyledDialog` does). Opened from the keyboard, an
    // action surface moves on to its first control in the next frame — the hook's own focus call is
    // an rAF scheduled by an earlier effect, so this one runs after it by queue order rather than by
    // luck. Opened with a pointer, it stays on the shell: no field is focused, and the shell's
    // `outline-none` draws no ring, while the trap, Escape and focus return keep working.
    useEffect(() => {
        if (!panelNode) return
        if (isDialog && !openedWithKeyboard) return
        const frame = requestAnimationFrame(() => {
            const target = isDialog ? firstTabbable(panelNode) : panelNode
            target?.focus({ preventScroll: true })
        })
        return () => {
            cancelAnimationFrame(frame)
        }
    }, [panelNode, isDialog, openedWithKeyboard])

    // Info is deliberately NOT trapped: Tab walks out of the surface and closing follows the focus.
    // Tab-out is the one close route that does not pull focus back to the trigger — doing so would
    // make Tab unable to move past the popover at all.
    // Focus moving into a portalled child (a tooltip, a picker) is not leaving: that is decided on the
    // `focusin` that follows, once the panel has seen the child's React focus event.
    // Action is trapped by `useFocusTrap`, which only handles Tab inside the panel; Tab out of a
    // portalled child (the calendar's last control) can still land outside, and a closing child can
    // drop focus to <body>. A frame later — so a child that restores focus itself wins — focus goes
    // back to the last control focused in the panel (the calendar's anchor), else the first one.
    useEffect(() => {
        if (!panelNode) return

        let frame = 0
        const restoreIfLost = (): void => {
            cancelAnimationFrame(frame)
            frame = requestAnimationFrame(() => {
                const active = document.activeElement
                if (!panelNode.isConnected || (active && active !== document.body && isInsideLayer(active))) return
                const last = lastPanelFocusRef.current
                const target = last?.isConnected && panelNode.contains(last) ? last : (firstTabbable(panelNode) ?? panelNode)
                target.focus({ preventScroll: true })
            })
        }
        const handleFocusOut = (event: globalThis.FocusEvent): void => {
            if (event.relatedTarget === null) close()
        }
        const handleLayerFocusOut = (event: globalThis.FocusEvent): void => {
            if (event.relatedTarget === null && isInsideLayer(event.target)) restoreIfLost()
        }
        const handleFocusIn = (event: globalThis.FocusEvent): void => {
            if (!panelNode.isConnected || isInsideLayer(event.target)) return
            if (isDialog) restoreIfLost()
            else close()
        }
        if (isDialog) document.addEventListener('focusout', handleLayerFocusOut)
        else panelNode.addEventListener('focusout', handleFocusOut)
        document.addEventListener('focusin', handleFocusIn)
        return () => {
            cancelAnimationFrame(frame)
            document.removeEventListener('focusout', handleLayerFocusOut)
            panelNode.removeEventListener('focusout', handleFocusOut)
            document.removeEventListener('focusin', handleFocusIn)
        }
    }, [panelNode, isDialog, close, isInsideLayer])

    // Every other close route owes the trigger its focus back. When the surface was dismissed by a
    // pointer press on something non-focusable, focus falls to <body> and a keyboard user loses
    // their place; restore it in exactly that case, so a press on a real control keeps its focus.
    const wasOpen = useRef(false)
    useEffect(() => {
        if (isOpen) {
            wasOpen.current = true
            return
        }
        if (!wasOpen.current) return
        wasOpen.current = false
        const trigger = triggerRef.current
        if (!trigger) return
        // Deferred a frame on purpose: the dismiss fires on `pointerdown`, and the browser's own
        // default handling for the rest of that click would blur anything we focused synchronously.
        const frame = requestAnimationFrame(() => {
            if (document.activeElement === document.body) trigger.focus()
        })
        return () => {
            cancelAnimationFrame(frame)
        }
    }, [isOpen])

    const handleTriggerClick = (event: MouseEvent<HTMLElement>): void => {
        if (isOpen) {
            close()
            return
        }
        /* Capture the element before setState: React nulls `e.currentTarget` once the handler
         * returns, so reading it lazily yields null and we lose the dialog portal root. */
        setPortalRoot(getOpenModalDialogAncestor(event.currentTarget))
        const rect = event.currentTarget.getBoundingClientRect()
        const triggerInRightHalf = rect.left + rect.width / 2 > window.innerWidth / 2
        setOpenAlign(align === 'auto' ? (triggerInRightHalf ? 'end' : 'start') : align)
        setLockedSide(undefined)
        setMinWidthPx(MIN_WIDTH_PX)
        setMaxHeightPx(Math.round(window.innerHeight * MAX_HEIGHT_RATIO))
        // Enter/Space on a button dispatch a synthetic `click` with `detail === 0`; a real pointer
        // click counts at least 1.
        setOpenedWithKeyboard(event.detail === 0)
        changeOpen(true)
    }

    const trigger: PopoverTrigger = {
        ref: setTrigger,
        isOpen,
        triggerProps: {
            onClick: handleTriggerClick,
            'aria-expanded': isOpen,
            'aria-controls': isOpen ? panelId : undefined,
            'aria-haspopup': isDialog ? 'dialog' : undefined,
            'aria-describedby': !isDialog && isOpen ? panelId : undefined,
        },
    }

    const resolveSlot = (slot: PopoverSlot): ReactNode => (typeof slot === 'function' ? slot({ close }) : slot)

    const displayedCount = useDebouncedValue(resultCount, 500)
    const viewResults: PopoverSlot | undefined =
        viewResultsAction ??
        (resultCount === undefined ? undefined : (
            <StyledButton dataTest={`${dataTest}-view-results`} type='button' variant='text' onClick={close}>
                {formatResultsLabel(displayedCount)}
            </StyledButton>
        ))

    // Spec: content-driven width between min 240 and max 472. Only mobile pins
    // an explicit width (`100vw - 32px`); on desktop the surface hugs its body.
    const maxWidth = isMobile ? MOBILE_WIDTH : MAX_WIDTH_PX[variant]
    const width = isMobile ? MOBILE_WIDTH : undefined

    if (isSheet) {
        return (
            <>
                {renderTrigger(trigger)}
                {/* `onClose={close}` discards the sheet's own dismiss reason (closeButton/scrim/
                    escape/drag/viewResults/action) — `close` is `() => void`. Deliberate, not an
                    oversight: the desktop path has never exposed a dismiss reason either (floating-ui's
                    outside-press vs Escape also collapse into the same `onOpenChange(false)`), so this
                    keeps the two paths at parity rather than growing a reason union just for mobile.
                    A direct `StyledBottomSheet` consumer still gets the full reason. */}
                <StyledBottomSheet
                    id={panelId}
                    dataTest={dataTest}
                    open={isOpen}
                    onClose={close}
                    registerBackClose={false}
                    ownerRef={panelRef}
                    title={title}
                    ariaLabel={ariaLabel}
                    viewResultsAction={viewResultsAction}
                    resetAction={resetAction}
                    footerActions={footerActions}
                    resultCount={resultCount}
                    closeLabel={closeLabel}
                    className={className}
                >
                    {children}
                </StyledBottomSheet>
            </>
        )
    }

    return (
        <>
            {renderTrigger(trigger)}
            {isOpen && (
                <FloatingPortal root={portalRoot}>
                    <div
                        {...getFloatingProps()}
                        onFocusCapture={recordTreeFocus}
                        ref={floatingRef}
                        id={panelId}
                        data-placement={placement}
                        data-test={dataTest}
                        data-testid={dataTest}
                        role={isDialog ? 'dialog' : undefined}
                        aria-labelledby={isDialog && title ? titleId : undefined}
                        aria-label={isDialog && !title ? ariaLabel : undefined}
                        tabIndex={isDialog ? undefined : -1}
                        {...(usePopoverLayer ? TOP_LAYER_PROPS : {})}
                        style={{
                            ...(usePopoverLayer ? TOP_LAYER_RESET_STYLE : {}),
                            ...floatingStyles,
                            minWidth: isMobile ? MIN_WIDTH_PX : minWidthPx,
                            width,
                            maxWidth,
                            maxHeight: maxHeightPx,
                        }}
                        // `outline-none` (in the shared chrome) pairs with the shell's tabIndex={-1}:
                        // focusing the container on open must not paint a UA focus ring around the
                        // whole surface — same pairing as StyledDialog.
                        className={cn('z-[1300]', POPOVER_SURFACE_CLASSNAME, className)}
                    >
                        <OverlayBackOwnerContext.Provider value={panelRef}>
                        <PopoverAnatomy
                            dataTest={dataTest}
                            title={title}
                            titleId={titleId}
                            viewResultsAction={resolveSlot(viewResults)}
                            resetAction={resolveSlot(resetAction)}
                            footerActions={resolveSlot(footerActions)}
                            closeLabel={closeLabel}
                            onClose={close}
                        >
                            {resolveSlot(children)}
                        </PopoverAnatomy>
                        </OverlayBackOwnerContext.Provider>
                    </div>
                </FloatingPortal>
            )}
        </>
    )
}
