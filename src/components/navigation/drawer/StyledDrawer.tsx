import { useEffect, type FC, type ReactNode } from 'react'
import { FloatingPortal } from '@floating-ui/react'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'

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

/**
 * Sliding edge panel (replaces MUI `Drawer`). Portalled, slides from `anchor`, temporary variant
 * shows a backdrop and closes on backdrop-click / Escape. Public props preserved (DEC-003). TASK-304.
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
    children,
}) => {
    const isTemporary = variant === 'temporary'

    useEffect(() => {
        if (!open || !isTemporary) return
        const onKey = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') onClose?.(event, 'escapeKeyDown')
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [open, isTemporary, onClose])

    if (isTemporary && !open && !ModalProps?.keepMounted) return null

    return (
        <FloatingPortal>
            {isTemporary && !hideBackdrop && open && (
                <div
                    // Figma modal overlay bg/modal = #626e7eb2 (delta-600 @ ~70%), matching StyledDialog.
                    className='fixed inset-0 z-[1200] bg-[#626e7eb2]'
                    onClick={(event) => onClose?.(event, 'backdropClick')}
                />
            )}
            <div
                role={isTemporary ? 'dialog' : undefined}
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
                style={{ ...resolveSx(sx), ...resolveSx(PaperProps?.sx) }}
            >
                {children}
            </div>
        </FloatingPortal>
    )
}
