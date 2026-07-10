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

export interface TooltipProps {
    title: ReactNode
    children: ReactElement
    placement?: Placement
    arrow?: boolean
    enterDelay?: number
    leaveDelay?: number
    open?: boolean
    onOpen?: () => void
    onClose?: () => void
    disableHoverListener?: boolean
    disableFocusListener?: boolean
    disableTouchListener?: boolean
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
            offset(arrow ? 8 : 6),
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
                        style={{ ...floatingStyles, ...slotProps?.tooltip?.style, ...resolveSx(slotProps?.tooltip?.sx) }}
                        {...getFloatingProps()}
                        className={cn(
                            'z-[1500] flex items-center break-words rounded-[3px] bg-[#363E4A] px-2 py-1 text-xs leading-4 tracking-[0.24px] text-white shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)]',
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
