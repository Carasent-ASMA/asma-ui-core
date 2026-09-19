import { useCallback, useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'
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

import { cn } from 'src/helpers/cn'
import { FOCUSABLE_SELECTOR, useFocusTrap } from 'src/hooks/useFocusTrap.hook'
import { useMobileMediaQuery } from 'src/hooks/useMediaQuery.hook'
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
const MAX_WIDTH_PX = { info: 360, action: 400 } as const
const MAX_HEIGHT_RATIO = 0.6
const MOBILE_WIDTH = 'calc(100vw - 32px)'

/** @figmaNode wXrXt5uKNNzV2DnQCgyYZH#44531-233781 (Design-System · "_Popover") */
export interface StyledPopoverV2Props {
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
    /** @figmaProp none — a11y: accessible name of the close control */
    closeLabel?: string
    /** @figmaProp none — a11y: required when `variant='action'` and no `title` is given, so the dialog has a name */
    ariaLabel?: string
    /** @figmaProp none — behavioral */
    onOpenChange?: (isOpen: boolean) => void
    /** @figmaProp none — style escape hatch, applied to the surface */
    className?: string
}

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
 * Separate from {@link StyledPopover}, which stays as the MUI-parity positioning primitive its eight
 * internal consumers still depend on; those migrate here gradually.
 */
export const StyledPopoverV2 = ({
    dataTest,
    renderTrigger,
    variant = 'info',
    title,
    children,
    viewResultsAction,
    resetAction,
    footerActions,
    closeLabel = 'Lukk',
    ariaLabel,
    onOpenChange,
    className,
}: StyledPopoverV2Props): JSX.Element => {
    const panelId = useId()
    const titleId = `${panelId}-title`

    const [isOpen, setIsOpen] = useState(false)
    const [portalRoot, setPortalRoot] = useState<HTMLElement>()
    const [maxHeightPx, setMaxHeightPx] = useState<number>()

    const isMobile = useMobileMediaQuery()
    const isDialog = variant === 'action'
    // Spec: on mobile an Info popover always sits below its trigger — flipping above would cover the
    // very term it explains. Action below 744px becomes a Bottom Sheet (ASMA-8184), not our problem yet.
    const keepBelowTrigger = isMobile && !isDialog

    const changeOpen = useCallback(
        (next: boolean) => {
            setIsOpen(next)
            onOpenChange?.(next)
        },
        [onOpenChange],
    )

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: changeOpen,
        placement: 'bottom-start',
        strategy: 'fixed',
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(8),
            ...(keepBelowTrigger ? [] : [flip({ padding: 8 })]),
            shift({ padding: 8 }),
            sizeMiddleware({
                padding: 8,
                apply({ availableHeight }) {
                    setMaxHeightPx(Math.min(availableHeight, Math.round(window.innerHeight * MAX_HEIGHT_RATIO)))
                },
            }),
        ],
    })

    // The trigger owns opening, so a press on it must not also register as an outside-press — on touch
    // that races the popover shut in the same tap. Pressing a *different* popover's trigger is still
    // outside, which is what gives "only one popover open at a time" for free.
    const dismiss = useDismiss(context, {
        escapeKey: true,
        outsidePress: (event) => {
            const trigger = triggerRef.current
            if (trigger && event.target instanceof Node && trigger.contains(event.target)) return false
            return true
        },
    })
    const { getFloatingProps } = useInteractions([dismiss])

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

    const close = useCallback(() => {
        changeOpen(false)
    }, [changeOpen])

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

    // `useFocusTrap` lands on the panel shell (as `StyledDialog` does). The spec wants an action
    // surface to land on its first control instead, so move it on in the next frame — the hook's
    // own focus call is an rAF scheduled by an earlier effect, so this one runs after it by
    // queue order rather than by luck.
    useEffect(() => {
        if (!panelNode) return
        const frame = requestAnimationFrame(() => {
            const target = isDialog ? panelNode.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) : panelNode
            target?.focus({ preventScroll: true })
        })
        return () => {
            cancelAnimationFrame(frame)
        }
    }, [panelNode, isDialog])

    // Info is deliberately NOT trapped: Tab walks out of the surface and closing follows the focus.
    // Tab-out is the one close route that does not pull focus back to the trigger — doing so would
    // make Tab unable to move past the popover at all.
    useEffect(() => {
        if (!panelNode || isDialog) return

        const handleFocusOut = (event: FocusEvent): void => {
            const next = event.relatedTarget
            if (next instanceof Node && (panelNode.contains(next) || triggerRef.current?.contains(next))) return
            close()
        }
        panelNode.addEventListener('focusout', handleFocusOut)
        return () => {
            panelNode.removeEventListener('focusout', handleFocusOut)
        }
    }, [panelNode, isDialog, close])

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

    const maxWidth = isMobile ? MOBILE_WIDTH : MAX_WIDTH_PX[variant]

    return (
        <>
            {renderTrigger(trigger)}
            {isOpen && (
                <FloatingPortal root={portalRoot}>
                    <div
                        {...getFloatingProps()}
                        ref={floatingRef}
                        id={panelId}
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
                            minWidth: MIN_WIDTH_PX,
                            width: isMobile ? MOBILE_WIDTH : undefined,
                            maxWidth,
                            maxHeight: maxHeightPx,
                        }}
                        // `outline-none` (in the shared chrome) pairs with the shell's tabIndex={-1}:
                        // focusing the container on open must not paint a UA focus ring around the
                        // whole surface — same pairing as StyledDialog.
                        className={cn('z-[1300]', POPOVER_SURFACE_CLASSNAME, className)}
                    >
                        <PopoverAnatomy
                            dataTest={dataTest}
                            title={title}
                            titleId={titleId}
                            viewResultsAction={resolveSlot(viewResultsAction)}
                            resetAction={resolveSlot(resetAction)}
                            footerActions={resolveSlot(footerActions)}
                            closeLabel={closeLabel}
                            onClose={close}
                        >
                            {resolveSlot(children)}
                        </PopoverAnatomy>
                    </div>
                </FloatingPortal>
            )}
        </>
    )
}
