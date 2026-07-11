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
    onClose?: (event: object, reason?: PopoverCloseReason) => void
    anchorOrigin?: PopoverOrigin
    transformOrigin?: PopoverOrigin
    id?: string
    className?: string
    sx?: unknown
    slotProps?: { paper?: { className?: string; sx?: unknown; style?: React.CSSProperties } }
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
    children?: ReactNode
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
    transformOrigin = DEFAULT_TRANSFORM,
    id,
    className,
    sx,
    slotProps,
    onClick,
    children,
}: StyledPopoverProps): JSX.Element | null => {
    const placement = useMemo(
        () => toPlacement(anchorOrigin, transformOrigin),
        [anchorOrigin, transformOrigin],
    )

    const { refs, floatingStyles, context } = useFloating({
        open,
        placement,
        whileElementsMounted: autoUpdate,
        elements: { reference: anchorEl ?? undefined },
        middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
        onOpenChange: (next, event, reason) => {
            if (!next) onClose?.(event ?? {}, reason === 'escape-key' ? 'escapeKeyDown' : 'backdropClick')
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
                style={{
                    ...floatingStyles,
                    ...resolveSx(sx),
                    ...resolveSx(slotProps?.paper?.sx),
                    ...slotProps?.paper?.style,
                }}
                {...getFloatingProps({ onClick })}
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
