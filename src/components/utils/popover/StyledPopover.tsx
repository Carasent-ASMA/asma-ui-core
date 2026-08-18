import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
    autoUpdate,
    flip,
    FloatingPortal,
    offset,
    shift,
    useDismiss,
    useFloating,
    useInteractions,
    useMergeRefs,
    type Placement,
} from '@floating-ui/react'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'
import {
    getOpenModalDialogAncestor,
    shouldUsePopoverTopLayer,
    TOP_LAYER_PROPS,
    TOP_LAYER_RESET_STYLE,
    useTopLayerRef,
} from 'src/hooks/useTopLayer.hook'

export interface PopoverOrigin {
    vertical: 'top' | 'center' | 'bottom' | number
    horizontal: 'left' | 'center' | 'right' | number
}

export type PopoverCloseReason = 'backdropClick' | 'escapeKeyDown'

export interface StyledPopoverProps {
    open: boolean
    anchorEl?: Element | null
    onClose?: (event: object, reason?: PopoverCloseReason) => void
    anchorOrigin?: PopoverOrigin
    transformOrigin?: PopoverOrigin
    id?: string
    className?: string
    sx?: unknown
    slotProps?: { paper?: { className?: string; sx?: unknown; style?: React.CSSProperties } }
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
    children?: ReactNode
    /**
     * MUI `keepMounted` parity: after the first open, keep children in the React tree while closed
     * (hidden). Needed when a menu item owns a dialog — without this, closing the menu unmounts the
     * dialog in the same tick it opens.
     */
    keepMounted?: boolean
}

const DEFAULT_ANCHOR: PopoverOrigin = { vertical: 'bottom', horizontal: 'left' }
const DEFAULT_TRANSFORM: PopoverOrigin = { vertical: 'top', horizontal: 'left' }

// Map MUI's anchor/transform origins to a Floating UI placement. The transform origin (the
// popover's own edge placed at the anchor point) determines the side — inverted, since a popover
// whose *bottom* meets the anchor sits *above* it — and the anchor's horizontal gives alignment.
// ponytail: covers the paired-origin conventions in use (below/above + start/center/end); numeric
// pixel origins fall back to the anchor's vertical. Full pixel-offset parity is the upgrade path.
const toPlacement = (anchor: PopoverOrigin, transform: PopoverOrigin): Placement => {
    const side =
        transform.vertical === 'bottom'
            ? 'top'
            : transform.vertical === 'top'
              ? 'bottom'
              : anchor.vertical === 'top'
                ? 'top'
                : 'bottom'
    const align = anchor.horizontal === 'left' ? '-start' : anchor.horizontal === 'right' ? '-end' : ''
    return `${side}${align}`
}

/**
 * @figmaNode none — no standalone Figma component
 * Anchored-overlay **primitive** (replaces MUI `Popover`); the Figma DS has no "Popover" component,
 * so the base paper uses the DS floating-surface defaults: white, radius **4** (Figma `menus`/
 * `text-field` radius token), and the **Float** elevation (drop-shadow `0 1 12 rgba(0,0,0,.15)`).
 * Styled consumers override the paper — `StyledMenu` adds the delta-300 border + Menus shadow
 * (`0 2 4 rgba(34,33,51,.15)`), the date-picker calendar keeps this base. Body-portalled instances
 * join the browser **top layer** (see `useTopLayerRef`); when the anchor is inside a modal
 * `<dialog>`, we portal into that dialog and skip the Popover API (mobile Safari nested top-layer
 * bug — see `shouldUsePopoverTopLayer`).
 *
 * Positions against `anchorEl`, flips/shifts on collision, portalled, closes on outside-press/escape
 * mapping to MUI's `onClose(event, reason)`. `anchorOrigin`/`transformOrigin`/`slotProps.paper`
 * preserved (DEC-003). TASK-302.
 */
export const StyledPopover = ({
    open,
    anchorEl,
    onClose,
    anchorOrigin = DEFAULT_ANCHOR,
    transformOrigin = DEFAULT_TRANSFORM,
    id,
    className,
    sx,
    slotProps,
    onClick,
    children,
    keepMounted = false,
}: StyledPopoverProps): JSX.Element | null => {
    const placement = useMemo(
        () => toPlacement(anchorOrigin, transformOrigin),
        [anchorOrigin, transformOrigin],
    )

    const [hasOpened, setHasOpened] = useState(open)
    if (open && !hasOpened) setHasOpened(true)
    const shouldMount = open || (keepMounted && hasOpened)
    const anchoredPortalRoot = getOpenModalDialogAncestor(anchorEl)
    const [portalRoot, setPortalRoot] = useState(anchoredPortalRoot)
    // Retain the last root while a keepMounted popover closes. Its anchor is cleared in the same
    // click that can open a child dialog; changing FloatingPortal's root would unmount that dialog.
    if (anchorEl && portalRoot !== anchoredPortalRoot) setPortalRoot(anchoredPortalRoot)

    const { refs, floatingStyles, context } = useFloating({
        open,
        placement,
        strategy: 'fixed',
        whileElementsMounted: autoUpdate,
        elements: { reference: anchorEl ?? undefined },
        middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
        onOpenChange: (next, event, reason) => {
            if (!next) onClose?.(event ?? {}, reason === 'escape-key' ? 'escapeKeyDown' : 'backdropClick')
        },
    })

    // Ignore presses on the anchor — external triggers (bindTrigger / ClickAway) open on the same
    // tap that useDismiss would otherwise treat as outside-press, which races closed on touch devices.
    const dismiss = useDismiss(context, {
        outsidePress: (event) => {
            const target = event.target
            if (anchorEl instanceof Element && target instanceof Node && anchorEl.contains(target)) return false
            return true
        },
        escapeKey: true,
    })
    const { getFloatingProps } = useInteractions([dismiss])
    // Body portal → Popover API top layer. Inside a modal dialog → portal in + z-index only.
    const usePopoverLayer = shouldUsePopoverTopLayer(portalRoot)
    const floatingRef = useMergeRefs([useTopLayerRef(refs.setFloating, usePopoverLayer)])

    // keepMounted leaves the node in the DOM across open/close — re-assert popover show/hide each flip
    // (useTopLayerRef only runs on attach, which doesn't re-fire when we stay mounted).
    useEffect(() => {
        if (!shouldMount || !usePopoverLayer) return
        const node = refs.floating.current
        if (!node || typeof node.showPopover !== 'function') return
        try {
            if (open && !node.matches(':popover-open')) node.showPopover()
            if (!open && node.matches(':popover-open')) node.hidePopover()
        } catch {
            // Popover API unavailable / element not eligible.
        }
    }, [open, shouldMount, usePopoverLayer, refs.floating])

    if (!shouldMount) return null

    return (
        <FloatingPortal root={portalRoot}>
            <div
                ref={floatingRef}
                id={id}
                {...(usePopoverLayer ? TOP_LAYER_PROPS : {})}
                style={{
                    ...(usePopoverLayer ? TOP_LAYER_RESET_STYLE : {}),
                    ...(open ? floatingStyles : {}),
                    ...resolveSx(sx),
                    ...resolveSx(slotProps?.paper?.sx),
                    ...slotProps?.paper?.style,
                    ...(!open ? { display: 'none' } : null),
                }}
                {...(open ? getFloatingProps({ onClick }) : {})}
                className={cn(
                    // Figma DS floating surface: radius 4 (`menus` token) + Float shadow (0 1 12 rgba(0,0,0,.15)).
                    'z-[1300] overflow-auto rounded bg-white shadow-[0px_1px_12px_0px_rgba(0,0,0,0.15)]',
                    className ?? 'my-1',
                    slotProps?.paper?.className,
                )}
            >
                {children}
            </div>
        </FloatingPortal>
    )
}
