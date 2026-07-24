import { useState, type CSSProperties, type ReactNode } from 'react'
import {
    autoUpdate,
    flip,
    FloatingPortal,
    shift,
    useFloating,
    useMergeRefs,
    type Placement,
} from '@floating-ui/react'

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
 * Positioning primitive (replaces MUI `Popper`) built on `@floating-ui/react`. Positions its
 * content against `anchorEl`; with `transition`, renders children as a function receiving
 * `TransitionProps` (`in`/`onExited`) so a child `Fade` can animate and unmount. Public props
 * preserved (DEC-003). TASK-403.
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

    const { refs, floatingStyles, placement: resolvedPlacement } = useFloating({
        open,
        placement,
        whileElementsMounted: autoUpdate,
        elements: { reference: anchorEl ?? undefined },
        middleware: [flip({ padding: 8 }), shift({ padding: 8 })],
    })
    const floatingRef = useMergeRefs([refs.setFloating])

    // With a transition, stay mounted through the exit tween; otherwise unmount as soon as closed.
    const mounted = open || (transition ? !exited : false)
    if (!mounted) return null

    const content =
        typeof children === 'function'
            ? children({ TransitionProps: { in: open, onExited: () => setExited(true) }, placement: resolvedPlacement })
            : children

    const node = (
        <div ref={floatingRef} id={id} style={{ ...floatingStyles, ...style }} className={className}>
            {content}
        </div>
    )

    return disablePortal ? node : <FloatingPortal>{node}</FloatingPortal>
}
