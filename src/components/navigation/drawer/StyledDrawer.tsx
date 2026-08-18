import { useEffect, useLayoutEffect, useRef, type CSSProperties, type FC, type ReactNode } from 'react'
import { FloatingPortal } from '@floating-ui/react'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'
import { useFocusTrap } from 'src/hooks/useFocusTrap.hook'
import { getOpenModalDialogAncestor, shouldUsePopoverTopLayer, TOP_LAYER_PROPS } from 'src/hooks/useTopLayer.hook'

export type DrawerAnchor = 'left' | 'right' | 'top' | 'bottom'
export type DrawerCloseReason = 'backdropClick' | 'escapeKeyDown'

export interface DrawerProps {
    open?: boolean
    onClose?: (event: Event | React.SyntheticEvent, reason: DrawerCloseReason) => void
    anchor?: DrawerAnchor
    variant?: 'temporary' | 'persistent' | 'permanent'
    hideBackdrop?: boolean
    className?: string
    sx?: unknown
    PaperProps?: { className?: string; sx?: unknown }
    /**
     * Accepted for MUI `Drawer` parity (DEC-003). The panel always stays mounted so the slide
     * transition can play, so `keepMounted` is effectively always-on — this prop is a typed no-op.
     */
    ModalProps?: { keepMounted?: boolean }
    /** Trigger element — when inside a modal `<dialog>`, portal into it so the sheet is interactive. */
    anchorEl?: Element | null
    children?: ReactNode
}

const EDGE_CLASS: Record<DrawerAnchor, string> = {
    left: 'inset-y-0 left-0 h-full',
    right: 'inset-y-0 right-0 h-full',
    top: 'inset-x-0 top-0 w-full',
    bottom: 'inset-x-0 bottom-0 w-full',
}

const CLOSED_TRANSFORM: Record<DrawerAnchor, string> = {
    left: '-translate-x-full',
    right: 'translate-x-full',
    top: '-translate-y-full',
    bottom: 'translate-y-full',
}

// The UA stylesheet gives every [popover] `inset:0; margin:auto; border:solid; padding:0.25em;
// width/height:fit-content`. The Tailwind classes override what they set; these inline resets cover
// only the box properties the drawer leaves unset, so joining the top layer changes stacking only.
const UA_POPOVER_BOX_RESET: CSSProperties = { margin: 0, border: 'none', padding: 0 }
// The backdrop's `inset-0` classes set no width/height, so the UA `fit-content` would collapse it
// to 0×0 — restore `auto` so it stretches to the insets again.
const UA_POPOVER_BACKDROP_RESET: CSSProperties = { ...UA_POPOVER_BOX_RESET, width: 'auto', height: 'auto' }
// Per-anchor: neutralise the UA inset on the edge opposite the anchor and the UA size on the free axis.
const UA_POPOVER_EDGE_RESET: Record<DrawerAnchor, CSSProperties> = {
    left: { right: 'auto', width: 'auto' },
    right: { left: 'auto', width: 'auto' },
    top: { bottom: 'auto', height: 'auto' },
    bottom: { top: 'auto', height: 'auto' },
}

/**
 * Sliding edge panel (replaces MUI `Drawer`). Portalled, slides from `anchor`, temporary variant
 * shows a backdrop and closes on backdrop-click / Escape. Public props preserved (DEC-003). TASK-304.
 *
 * When the trigger is inside a modal `<dialog>`, portals into that dialog (inertness) and stacks with
 * z-index — no nested Popover API (mobile Safari stacks nested `showPopover` under the dialog).
 *
 * @figmaNode none — no dedicated Figma drawer/side-sheet. As a modal edge-panel it reuses the DS
 * **modal family** tokens established by `StyledDialog`: overlay `bg/modal` #626e7eb2 (delta-600 @70%)
 * + Dialogue-popup elevation (#22213366, 0 4 40). Edge panels are flush (no radius); content is
 * consumer-supplied.
 */
export const StyledDrawer: FC<DrawerProps> = ({
    open = false,
    onClose,
    anchor = 'left',
    variant = 'temporary',
    hideBackdrop,
    className,
    sx,
    PaperProps,
    ModalProps,
    anchorEl,
    children,
}) => {
    const isTemporary = variant === 'temporary'
    const portalRoot = getOpenModalDialogAncestor(anchorEl)
    const panelRef = useRef<HTMLDivElement | null>(null)
    const backdropRef = useRef<HTMLDivElement | null>(null)

    const usesPopoverTopLayer = isTemporary && shouldUsePopoverTopLayer(portalRoot)

    const promoteToTopLayer = (node: HTMLElement | null): void => {
        if (!node || !open || !usesPopoverTopLayer) return
        try {
            if (typeof node.showPopover === 'function' && !node.matches(':popover-open')) node.showPopover()
        } catch {
            // Popover API unavailable / element not eligible — degrade to plain z-index stacking.
        }
    }

    useLayoutEffect(() => {
        if (!open || !usesPopoverTopLayer) return
        for (const node of [backdropRef.current, panelRef.current]) {
            try {
                if (!node || typeof node.showPopover !== 'function') continue
                if (node.matches(':popover-open')) node.hidePopover()
                node.showPopover()
            } catch {
                // Popover API unavailable / element not eligible — degrade to plain z-index stacking.
            }
        }
    }, [open, usesPopoverTopLayer])

    useEffect(() => {
        if (!open || !isTemporary) return
        const onKey = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') onClose?.(event, 'escapeKeyDown')
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [open, isTemporary, onClose])

    // Escape is already handled above (kept separate since it needs the real event/reason for
    // `onClose`) — this only adds the Tab-cycling half of the trap for this backdrop-blocking modal.
    useFocusTrap(open && isTemporary, panelRef)

    if (isTemporary && !open && !ModalProps?.keepMounted) return null

    return (
        <FloatingPortal root={portalRoot}>
            {isTemporary && !hideBackdrop && open && (
                // Mouse-only backdrop dismiss; Escape (handled above) is the keyboard equivalent.
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <div
                    ref={(node) => {
                        backdropRef.current = node
                        promoteToTopLayer(node)
                    }}
                    {...(usesPopoverTopLayer ? TOP_LAYER_PROPS : undefined)}
                    // Figma modal overlay bg/modal = #626e7eb2 (delta-600 @ ~70%), matching StyledDialog.
                    className='fixed inset-0 z-[1200] bg-[#626e7eb2]'
                    style={usesPopoverTopLayer ? UA_POPOVER_BACKDROP_RESET : undefined}
                    onClick={(event) => onClose?.(event, 'backdropClick')}
                />
            )}
            <div
                ref={(node) => {
                    panelRef.current = node
                    promoteToTopLayer(node)
                }}
                {...(usesPopoverTopLayer ? TOP_LAYER_PROPS : undefined)}
                role={isTemporary ? 'dialog' : undefined}
                aria-modal={isTemporary && open ? true : undefined}
                aria-hidden={!open}
                className={cn(
                    'fixed z-[1200] overflow-auto bg-white transition-transform duration-300',
                    // Dialogue-popup elevation (#22213366, 0 4 40), matching StyledDialog's modal surface.
                    open && 'shadow-[0px_4px_40px_0px_#22213366]',
                    EDGE_CLASS[anchor],
                    !open && cn(CLOSED_TRANSFORM[anchor], 'pointer-events-none'),
                    className,
                    PaperProps?.className,
                )}
                style={{
                    ...(usesPopoverTopLayer && { ...UA_POPOVER_BOX_RESET, ...UA_POPOVER_EDGE_RESET[anchor] }),
                    ...resolveSx(sx),
                    ...resolveSx(PaperProps?.sx),
                }}
            >
                {children}
            </div>
        </FloatingPortal>
    )
}
