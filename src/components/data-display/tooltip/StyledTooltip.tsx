import {
    arrow as arrowMiddleware,
    autoUpdate,
    flip,
    FloatingArrow,
    FloatingPortal,
    offset,
    safePolygon,
    shift,
    useDismiss,
    useFloating,
    useFocus,
    useHover,
    useInteractions,
    useMergeRefs,
    useRole,
    type ElementProps,
    type Placement,
} from '@floating-ui/react'
import {
    cloneElement,
    Fragment,
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,    useRef,
    useState,
    type CSSProperties,
    type PointerEvent,
    type MutableRefObject,
    type SyntheticEvent,
    type ReactElement,
    type ReactNode,
} from 'react'
import { cn } from 'src/helpers/cn'
import { firstTabbable } from 'src/helpers/focusable'
import { resolveSx } from 'src/helpers/sx'
import {
    getOpenModalDialogAncestor,
    shouldUsePopoverTopLayer,
    TOP_LAYER_PROPS,
    TOP_LAYER_RESET_STYLE,
    useTopLayerRef,
} from 'src/hooks/useTopLayer.hook'

const TOOLTIP_BG = '#363E4A'

/** What a `display: contents` host renders — it generates no box of its own to measure. */
const contentsRect = (host: Element): DOMRect => {
    const range = document.createRange()
    range.selectNodeContents(host)
    return range.getBoundingClientRect()
}

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
    /**
     * A tap on a touch screen toggles the tooltip; it stays until the next tap, a tap outside,
     * scroll or Escape — never a timer (disabled-states DIS-2, §5). Hover stays mouse-only so the
     * emulated mouse events after a tap cannot toggle it a second time.
     */
    openOnTap?: boolean
    /**
     * The text stays in the DOM and the trigger references it through `aria-describedby` while the
     * tooltip is closed, so a screen reader announces it on focus (disabled-states DIS-2, 4.1.2).
     */
    persistentDescription?: boolean
    /** Share the persistent description with every focusable item in a composite control. */
    persistentDescriptionId?: string
    offsetDistance?: number
    className?: string
    slotProps?: TooltipSlotProps
}

interface TooltipReference {
    element: Element | null
    setReference?: (node: Element | null) => void
    getReferenceProps?: ReturnType<typeof useInteractions>['getReferenceProps']
}

// The interaction hooks below use these reference events. Forward them through the bridge so
// mounting or updating the floating sibling never changes the trigger's place in the React tree.
const REFERENCE_EVENTS = [
    'onFocus',
    'onBlur',
    'onMouseEnter',
    'onMouseLeave',
    'onMouseMove',
    'onPointerDown',
    'onPointerEnter',
    'onPointerUp',
    'onKeyDown',
] as const

/**
 * Tooltip built on `@floating-ui/react` (replaces MUI `Tooltip`) — hover(+`enterDelay`)/focus open,
 * dismiss on blur/esc, `flip`/`shift` collision handling, optional arrow, portalled. Empty `title`
 * renders the child alone (MUI parity). Preserves the `#363E4A` design and the `title`/`placement`/
 * `arrow`/`enterDelay`/`open`/`slotProps` surface (DEC-003). TASK-301.
 */
export const StyledTooltip = ({ children, ...props }: TooltipProps): JSX.Element => {
    const bridge = useRef<TooltipReference>({ element: null })
    const setReference = useCallback((node: Element | null) => {
        bridge.current.element = node
        bridge.current.setReference?.(node)
    }, [])
    const isFragment = children.type === Fragment
    const child = isFragment ? <span style={{ display: 'contents' }}>{children}</span> : children
    const childProps = child.props as Record<string, unknown>
    // Read data properties only: React 18's props.ref and React 19's element.ref have warning getters.
    const existingRef = (
        Object.getOwnPropertyDescriptor(childProps, 'ref')?.value
        ?? Object.getOwnPropertyDescriptor(child, 'ref')?.value
    ) as React.Ref<Element> | undefined
    const childRef = useMergeRefs([setReference, existingRef])
    const eventProps = useMemo(
        () => Object.fromEntries(REFERENCE_EVENTS.map((name) => [
            name,
            (event: SyntheticEvent) => {
                const handlers = bridge.current.getReferenceProps?.(childProps) ?? childProps
                const handler = handlers[name] as ((event: SyntheticEvent) => void) | undefined
                handler?.(event)
            },
        ])),
        [childProps],
    )

    // The trigger always occupies the first slot. With an empty title no Floating UI interaction
    // or positioning hooks mount, even for the reason wrappers used in large option lists.
    return (
        <>
            {cloneElement(child, { ...eventProps, ref: childRef })}
            {(Boolean(props.title) || props.title === 0) && (
                <TooltipWithFloating {...props} referenceRef={bridge} isFragment={isFragment} />
            )}
        </>
    )
}

const TooltipWithFloating = ({
    title,
    referenceRef,
    isFragment,
    placement = 'top',
    arrow = false,
    enterDelay = 500,
    leaveDelay = 0,
    open: controlledOpen,
    onOpen,
    onClose,
    disableHoverListener,
    disableFocusListener,
    openOnTap,
    persistentDescription: requestedPersistentDescription,
    persistentDescriptionId,
    offsetDistance,
    className,
    slotProps,
}: Omit<TooltipProps, 'children'> & { referenceRef: MutableRefObject<TooltipReference>; isFragment: boolean }): JSX.Element => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const hasTitle = Boolean(title) || title === 0
    const open = hasTitle && (controlledOpen ?? uncontrolledOpen)
    const persistentDescription = hasTitle && requestedPersistentDescription
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
        strategy: 'fixed',
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
        mouseOnly: Boolean(openOnTap),
        handleClose: safePolygon(),
    })
    const focus = useFocus(context, { enabled: !isControlled && !disableFocusListener })
    const dismiss = useDismiss(context, { ancestorScroll: Boolean(openOnTap) })
    const role = useRole(context, { role: 'tooltip' })
    const tap: ElementProps = {
        reference: {
            onPointerUp: (event: PointerEvent<Element>) => {
                if (!openOnTap || event.pointerType !== 'touch') return
                setOpen(!open)
            },
        },
    }
    const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role, tap])

    useLayoutEffect(() => {
        const bridge = referenceRef.current
        bridge.setReference = refs.setReference
        refs.setReference(bridge.element)
        return () => {
            bridge.setReference = undefined
            bridge.getReferenceProps = undefined
            refs.setReference(null)
        }
    }, [referenceRef, refs])

    useLayoutEffect(() => {
        referenceRef.current.getReferenceProps = getReferenceProps
    }, [referenceRef, getReferenceProps])
    const portalRoot = open ? getOpenModalDialogAncestor(refs.domReference.current) : undefined
    const usePopoverLayer = shouldUsePopoverTopLayer(portalRoot)
    const floatingRef = useTopLayerRef(refs.setFloating, usePopoverLayer)

    // `useRole` already mints the floating element's id and puts it on the floating node — reuse it
    // instead of a second `useId`, so nothing overrides a Floating UI internal.
    const { floatingId } = context
    const generatedDescriptionId = useId()
    const descriptionId = persistentDescriptionId ?? generatedDescriptionId
    const describedById = persistentDescription ? descriptionId : floatingId
    const describes = Boolean(persistentDescription) || open

    // APG puts `aria-describedby` on the *trigger*, but by house rule the child handed in is a
    // wrapper span, not the control a screen reader lands on — so the id goes on the focusable
    // control inside it. Last resort is the reference itself: a decorative or disabled subtree has
    // nothing focusable, and an unassociated description is worse than one on the wrapper.
    useEffect(() => {
        const reference = refs.domReference.current
        if (!describes || !describedById || !(reference instanceof HTMLElement)) return
        const described = firstTabbable(reference) ?? reference
        const previous = described.getAttribute('aria-describedby')
        if (previous?.split(/\s+/).includes(describedById)) return
        described.setAttribute('aria-describedby', previous ? `${previous} ${describedById}` : describedById)
        return () => {
            const remaining = described.getAttribute('aria-describedby')?.split(/\s+/)
                .filter((id) => id && id !== describedById).join(' ')
            if (remaining) described.setAttribute('aria-describedby', remaining)
            else described.removeAttribute('aria-describedby')
        }
    }, [describes, refs.domReference, describedById])

    // A Fragment has no DOM node to act as the reference, so it gets a `display: contents` host:
    // that host carries the ref and the handlers while its children keep their exact place in the
    // parent's layout (a plain <span> would adopt them and break a flex row). Generating no box of
    // its own, it also needs a virtual reference, or positioning lands at the page origin.
    useLayoutEffect(() => {
        const host = refs.domReference.current
        if (!isFragment || !host) return
        refs.setPositionReference({ contextElement: host, getBoundingClientRect: () => contentsRect(host) })
    }, [isFragment, refs])

    return (
        <>
            {persistentDescription && (
                <span id={descriptionId} hidden>
                    {title}
                </span>
            )}
            {open && (
                <FloatingPortal root={portalRoot}>
                    <div
                        ref={floatingRef}
                        {...(usePopoverLayer ? TOP_LAYER_PROPS : {})}
                        {...getFloatingProps()}
                        style={{
                            ...(usePopoverLayer ? TOP_LAYER_RESET_STYLE : {}),
                            ...floatingStyles,
                            fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
                            overflow: 'visible',
                            ...slotProps?.tooltip?.style,
                            ...resolveSx(slotProps?.tooltip?.sx),
                        }}
                        className={cn(
                            // Figma Tooltip (node 14680-25248): delta-800 bg, px8/py4, r3, Helper 14/20 (ls 0),
                            // max-width 320, Float shadow 0 1 6 rgba(0,0,0,.15).
                            'z-[1500] block max-w-[320px] whitespace-normal break-words rounded-[3px] bg-[#363E4A] px-2 py-1 text-sm leading-5 text-white shadow-[0px_1px_6px_0px_rgba(0,0,0,0.15)]',
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
