import { cloneElement, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'
import {
    arrow as arrowMiddleware,
    autoUpdate,
    flip,
    FloatingArrow,
    FloatingPortal,
    offset,
    shift,
    useDismiss,
    useFloating,
    useFocus,
    useHover,
    useInteractions,
    useMergeRefs,
    useRole,
    type Placement,
} from '@floating-ui/react'
import { cn } from 'src/helpers/cn'
import { resolveSx } from 'src/helpers/sx'

const TOOLTIP_BG = '#363E4A'

interface TooltipSlotProps {
    tooltip?: { sx?: unknown; className?: string; style?: CSSProperties }
    popper?: unknown
    transition?: unknown
    arrow?: unknown
}

/**
 * @figmaNode wXrXt5uKNNzV2DnQCgyYZH#14680-25248
 * Figma "Tooltip" (Theme=Day): delta-800 #363e4a body, px8/py4, radius 3, Helper 14px/lh20 white,
 * max-width 320, optional arrow (9 placements). Float drop-shadow.
 */
export interface TooltipProps {
    title: ReactNode
    children: ReactElement
    /** @figmaProp Arrow placement (Top/Bottom/Left/Right × start/middle/end) */
    placement?: Placement
    /** @figmaProp Arrow = true→"Arrow" | false→"None" */
    arrow?: boolean
    enterDelay?: number
    leaveDelay?: number
    open?: boolean
    onOpen?: () => void
    onClose?: () => void
    disableHoverListener?: boolean
    disableFocusListener?: boolean
    disableTouchListener?: boolean
    offsetDistance?: number
    className?: string
    slotProps?: TooltipSlotProps
}

/**
 * Tooltip built on `@floating-ui/react` (replaces MUI `Tooltip`) — hover(+`enterDelay`)/focus open,
 * dismiss on blur/esc, `flip`/`shift` collision handling, optional arrow, portalled. Empty `title`
 * renders the child alone (MUI parity). Preserves the `#363E4A` design and the `title`/`placement`/
 * `arrow`/`enterDelay`/`open`/`slotProps` surface (DEC-003). TASK-301.
 */
export const StyledTooltip = ({
    title,
    children,
    placement = 'top',
    arrow = false,
    enterDelay = 500,
    leaveDelay = 0,
    open: controlledOpen,
    onOpen,
    onClose,
    disableHoverListener,
    disableFocusListener,
    offsetDistance,
    className,
    slotProps,
}: TooltipProps): JSX.Element => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = controlledOpen ?? uncontrolledOpen
    const arrowRef = useRef<SVGSVGElement>(null)

    const setOpen = (next: boolean): void => {
        if (!isControlled) setUncontrolledOpen(next)
        if (next) onOpen?.()
        else onClose?.()
    }

    const { refs, floatingStyles, context } = useFloating({
        open,
        onOpenChange: setOpen,
        placement,
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(offsetDistance ?? (arrow ? 8 : 6)),
            flip({ padding: 8 }),
            shift({ padding: 8 }),
            // Floating UI's arrow middleware takes the arrow ref by design; the react-compiler ref
            // rule false-positives on passing it here.
            // eslint-disable-next-line react-hooks/refs
            ...(arrow ? [arrowMiddleware({ element: arrowRef })] : []),
        ],
    })

    const hover = useHover(context, {
        enabled: !isControlled && !disableHoverListener,
        delay: { open: enterDelay, close: leaveDelay },
        move: false,
    })
    const focus = useFocus(context, { enabled: !isControlled && !disableFocusListener })
    const dismiss = useDismiss(context)
    const role = useRole(context, { role: 'tooltip' })
    const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role])

    // Merge our reference ref with any ref the child already carries (React 18 element.ref).
    const childRef = useMergeRefs([refs.setReference, (children as { ref?: React.Ref<unknown> }).ref])
    const reference = cloneElement(
        children,
        getReferenceProps({ ref: childRef, ...(children.props as Record<string, unknown>) }),
    )

    if (title == null || title === '') return reference

    return (
        <>
            {reference}
            {open && (
                <FloatingPortal>
                    <div
                        ref={refs.setFloating}
                        {...getFloatingProps()}
                        style={{
                            ...floatingStyles,
                            fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
                            ...slotProps?.tooltip?.style,
                            ...resolveSx(slotProps?.tooltip?.sx),
                        }}
                        className={cn(
                            // Figma Tooltip (node 14680-25248): delta-800 bg, px8/py4, r3, Helper 14/20 (ls 0),
                            // max-width 320, Float shadow 0 1 6 rgba(0,0,0,.15).
                            'z-[1500] block max-w-[320px] break-words whitespace-normal rounded-[3px] bg-[#363E4A] px-2 py-1 text-sm leading-5 text-white shadow-[0px_1px_6px_0px_rgba(0,0,0,0.15)]',
                            className,
                            slotProps?.tooltip?.className,
                        )}
                    >
                        {title}
                        {arrow && <FloatingArrow ref={arrowRef} context={context} fill={TOOLTIP_BG} />}
                    </div>
                </FloatingPortal>
            )}
        </>
    )
}
