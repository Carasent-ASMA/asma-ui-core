import {
    autoUpdate,
    flip,
    FloatingPortal,
    shift,
    useFloating,
    useMergeRefs,
    type Placement,
} from '@floating-ui/react'
import { useState, type CSSProperties, type ReactNode } from 'react'
import {
    getOpenModalDialogAncestor,
    TOP_LAYER_PROPS,
    TOP_LAYER_RESET_STYLE,
    useTopLayerRef,
} from 'src/hooks/useTopLayer.hook'

export interface PopperTransitionProps {
    in: boolean
    onExited: () => void
}

type PopperChildren = ReactNode | ((props: { TransitionProps: PopperTransitionProps; placement: Placement }) => ReactNode)

export interface PopperProps {
    open?: boolean
    anchorEl?: Element | null
    id?: string
    placement?: Placement
    transition?: boolean
    disablePortal?: boolean
    className?: string
    style?: CSSProperties
    children?: PopperChildren
}

/**
 * Neutralises the UA `[popover]` box (`inset: 0; margin: auto; border: solid; padding: .25em;
 * background: Canvas; overflow: auto`) once this wrapper joins the top layer. Beyond the shared
 * inset/margin reset, a bare positioning wrapper also has to drop the frame the UA paints around it
 * and keep `overflow` visible so the child's shadow isn't clipped.
 */
const TOP_LAYER_WRAPPER_RESET: CSSProperties = {
    ...TOP_LAYER_RESET_STYLE,
    background: 'transparent',
    border: 0,
    overflow: 'visible',
    padding: 0,
}

/**
 * Positioning primitive (replaces MUI `Popper`) built on `@floating-ui/react`. Positions its
 * content against `anchorEl`; with `transition`, renders children as a function receiving
 * `TransitionProps` (`in`/`onExited`) so a child `Fade` can animate and unmount. Public props
 * preserved (DEC-003). TASK-403.
 *
 * When `anchorEl` sits inside an open modal `<dialog>` the popper portals into that dialog and joins
 * the top layer instead of the default `document.body` portal — a body portal is both occluded by
 * the dialog and `inert`, so the popper looks dead on click. See `useTopLayer.hook`.
 */
export const Popper = ({
    open = false,
    anchorEl,
    id,
    placement = 'bottom',
    transition,
    disablePortal,
    className,
    style,
    children,
}: PopperProps): JSX.Element | null => {
    const [exited, setExited] = useState(true)
    if (open && exited) setExited(false)

    const modalDialog = getOpenModalDialogAncestor(anchorEl)

    const { refs, floatingStyles, placement: resolvedPlacement } = useFloating({
        open,
        placement,
        // The top layer resolves `fixed` against the viewport, which is the basis a promoted popover
        // needs; outside a dialog the original `absolute` strategy is kept.
        strategy: modalDialog ? 'fixed' : 'absolute',
        whileElementsMounted: autoUpdate,
        elements: { reference: anchorEl ?? undefined },
        middleware: [flip({ padding: 8 }), shift({ padding: 8 })],
    })
    const topLayerRef = useTopLayerRef(refs.setFloating)
    const floatingRef = useMergeRefs([modalDialog ? topLayerRef : refs.setFloating])

    // With a transition, stay mounted through the exit tween; otherwise unmount as soon as closed.
    const mounted = open || (transition ? !exited : false)
    if (!mounted) return null

    const content =
        typeof children === 'function'
            ? children({ TransitionProps: { in: open, onExited: () => setExited(true) }, placement: resolvedPlacement })
            : children

    const node = (
        <div
            ref={floatingRef}
            id={id}
            {...(modalDialog ? TOP_LAYER_PROPS : {})}
            style={{ ...(modalDialog ? TOP_LAYER_WRAPPER_RESET : {}), ...floatingStyles, ...style }}
            className={className}
        >
            {content}
        </div>
    )

    return disablePortal ? node : <FloatingPortal root={modalDialog}>{node}</FloatingPortal>
}
