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
    shouldUsePopoverTopLayer,
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
 * Body-portalled instances join the browser **top layer** (nested under a filter `StyledPopover`
 * otherwise paints under it). When `anchorEl` sits inside an open modal `<dialog>`, portal into
 * that dialog and skip the Popover API — see `shouldUsePopoverTopLayer`.
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
    const usePopoverLayer = shouldUsePopoverTopLayer(modalDialog)

    const { refs, floatingStyles, placement: resolvedPlacement } = useFloating({
        open,
        placement,
        // Fixed: top-layer popovers and in-dialog portals both position against the viewport/dialog.
        strategy: 'fixed',
        whileElementsMounted: autoUpdate,
        elements: { reference: anchorEl ?? undefined },
        middleware: [flip({ padding: 8 }), shift({ padding: 8 })],
    })
    const floatingRef = useMergeRefs([useTopLayerRef(refs.setFloating, usePopoverLayer)])

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
            {...(usePopoverLayer ? TOP_LAYER_PROPS : {})}
            style={{ ...(usePopoverLayer ? TOP_LAYER_WRAPPER_RESET : {}), ...floatingStyles, ...style }}
            className={className}
        >
            {content}
        </div>
    )

    return disablePortal ? node : <FloatingPortal root={modalDialog}>{node}</FloatingPortal>
}
