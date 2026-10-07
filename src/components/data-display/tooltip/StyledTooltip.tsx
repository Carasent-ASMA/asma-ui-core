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
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type PointerEvent,
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
    /** Preserve the trigger node when a control gains or loses its reason. */
    keepMounted?: boolean
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

/**
 * Tooltip built on `@floating-ui/react` (replaces MUI `Tooltip`) — hover(+`enterDelay`)/focus open,
 * dismiss on blur/esc, `flip`/`shift` collision handling, optional arrow, portalled. Empty `title`
 * renders the child alone (MUI parity). Preserves the `#363E4A` design and the `title`/`placement`/
 * `arrow`/`enterDelay`/`open`/`slotProps` surface (DEC-003). TASK-301.
 */
export const StyledTooltip = (props: TooltipProps): JSX.Element => {
    // Fast path: with no tooltip text there is nothing to show, so render the child alone and — crucially —
    // mount NONE of the `@floating-ui` hooks below. Callers wrap large lists (e.g. every autocomplete
    // option row) in a tooltip whose `title` is usually null; instantiating useFloating/useHover/… per
    // row is what made those lists lag. Hooks can't be conditional, so the machinery lives in an inner
    // component that is only mounted when there is a title. (MUI parity: empty title → child alone.)
    // Treat any falsy title (except the number 0, a legitimate label) as "no tooltip" — MUI parity.
    // Call sites use the `title={condition && 'text'}` idiom, which yields `false` when the condition
    // is off; without catching `false` here the machinery mounts and, with `arrow`, paints a stray
    // empty dark bubble + arrow on hover.
    if (!props.keepMounted && !props.title && props.title !== 0) return props.children
    return <TooltipWithFloating {...props} />
}

const TooltipWithFloating = ({
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
    openOnTap,
    persistentDescription: requestedPersistentDescription,
    persistentDescriptionId,
    offsetDistance,
    className,
    slotProps,
}: TooltipProps): JSX.Element => {
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
            if (previous === null) described.removeAttribute('aria-describedby')
            else described.setAttribute('aria-describedby', previous)
        }
    }, [describes, refs.domReference, describedById])

    // A Fragment has no DOM node to act as the reference, so it gets a `display: contents` host:
    // that host carries the ref and the handlers while its children keep their exact place in the
    // parent's layout (a plain <span> would adopt them and break a flex row). Generating no box of
    // its own, it also needs a virtual reference, or positioning lands at the page origin.
    const isFragment = children.type === Fragment
    const child = isFragment ? <span style={{ display: 'contents' }}>{children}</span> : children
    useLayoutEffect(() => {
        const host = refs.domReference.current
        if (!isFragment || !host) return
        refs.setPositionReference({ contextElement: host, getBoundingClientRect: () => contentsRect(host) })
    }, [isFragment, refs])

    // Merge our reference ref with any ref the child already carries: `props.ref` in React 19,
    // `element.ref` in React 18.
    const childProps = child.props as Record<string, unknown> & { ref?: React.Ref<unknown> }
    const childRef = useMergeRefs([
        refs.setReference,
        childProps.ref ?? (child as { ref?: React.Ref<unknown> }).ref,
    ])
    // Drop Floating UI's generated `aria-describedby`: it would land on the wrapper that the effect
    // above deliberately looks past. `cloneElement` merges over the child's own props, so a value
    // the caller set themselves survives untouched. The merged ref goes last: in React 19 the
    // child's own `ref` prop, even `undefined`, would otherwise replace it.
    const { ['aria-describedby']: _generated, ...referenceProps } = getReferenceProps({
        ...childProps,
        ref: childRef,
    })
    const reference = cloneElement(child, referenceProps)

    return (
        <>
            {reference}
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
