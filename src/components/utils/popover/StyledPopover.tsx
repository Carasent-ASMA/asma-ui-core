import { useMemo, type ReactNode } from 'react'
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

export interface PopoverOrigin {
    vertical: 'top' | 'center' | 'bottom' | number
    horizontal: 'left' | 'center' | 'right' | number
}

export type PopoverCloseReason = 'backdropClick' | 'escapeKeyDown'

export interface StyledPopoverProps {
    open: boolean
    anchorEl?: Element | null
    onClose?: (event: Event | undefined, reason?: PopoverCloseReason) => void
    anchorOrigin?: PopoverOrigin
    transformOrigin?: PopoverOrigin
    id?: string
    className?: string
    sx?: unknown
    slotProps?: { paper?: { className?: string; sx?: unknown } }
    children?: ReactNode
}

const DEFAULT_ANCHOR: PopoverOrigin = { vertical: 'bottom', horizontal: 'left' }

// Map MUI's anchorOrigin to a Floating UI placement (side from vertical, alignment from horizontal).
// ponytail: this reads anchorOrigin only — the common paired-origin convention. Exotic
// anchor/transform combos are a known ceiling; upgrade path is a full origin→placement solver.
const toPlacement = (anchor: PopoverOrigin): Placement => {
    const side =
        anchor.vertical === 'top'
            ? 'top'
            : anchor.vertical === 'bottom'
              ? 'bottom'
              : anchor.horizontal === 'right'
                ? 'right'
                : 'left'
    const align = anchor.horizontal === 'left' ? '-start' : anchor.horizontal === 'right' ? '-end' : ''
    return `${side}${align}`
}

/**
 * Anchored popover built on `@floating-ui/react` (replaces MUI `Popover`). Positions against
 * `anchorEl`, flips/shifts on collision, portalled, and closes on outside-press/escape mapping to
 * MUI's `onClose(event, reason)`. `anchorOrigin`/`transformOrigin`/`slotProps.paper` preserved
 * (DEC-003). TASK-302.
 */
export const StyledPopover = ({
    open,
    anchorEl,
    onClose,
    anchorOrigin = DEFAULT_ANCHOR,
    id,
    className,
    sx,
    slotProps,
    children,
}: StyledPopoverProps): JSX.Element | null => {
    const placement = useMemo(() => toPlacement(anchorOrigin), [anchorOrigin])

    const { refs, floatingStyles, context } = useFloating({
        open,
        placement,
        whileElementsMounted: autoUpdate,
        elements: { reference: anchorEl ?? undefined },
        middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
        onOpenChange: (next, event, reason) => {
            if (!next) onClose?.(event, reason === 'escape-key' ? 'escapeKeyDown' : 'backdropClick')
        },
    })

    const dismiss = useDismiss(context, { outsidePress: true, escapeKey: true })
    const { getFloatingProps } = useInteractions([dismiss])
    const floatingRef = useMergeRefs([refs.setFloating])

    return open ? (
        <FloatingPortal>
            <div
                ref={floatingRef}
                id={id}
                style={{ ...floatingStyles, ...resolveSx(sx), ...resolveSx(slotProps?.paper?.sx) }}
                {...getFloatingProps()}
                className={cn(
                    'z-[1300] overflow-auto rounded bg-white shadow-lg',
                    className ?? 'my-1',
                    slotProps?.paper?.className,
                )}
            >
                {children}
            </div>
        </FloatingPortal>
    ) : null
}
