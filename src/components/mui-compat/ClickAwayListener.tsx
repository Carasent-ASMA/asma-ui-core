import { cloneElement, useCallback, useEffect, useRef, type ReactElement } from 'react'

type MouseEventName = 'onClick' | 'onMouseDown' | 'onMouseUp'
type TouchEventName = 'onTouchStart' | 'onTouchEnd'
type ChildRef = ((node: Element | null) => void) | { current: Element | null } | null | undefined

export interface ClickAwayListenerProps {
    children: ReactElement
    onClickAway: (event: MouseEvent | TouchEvent) => void
    mouseEvent?: MouseEventName | false
    touchEvent?: TouchEventName | false
    disableReactTree?: boolean
}

const DOM_EVENT: Record<string, string> = {
    onClick: 'click',
    onMouseDown: 'mousedown',
    onMouseUp: 'mouseup',
    onTouchStart: 'touchstart',
    onTouchEnd: 'touchend',
}

/**
 * MUI-free `ClickAwayListener`: fires `onClickAway` when a pointer event lands outside the single
 * child element. Matches the MUI API subset this library uses (`onClickAway`, `mouseEvent`,
 * `touchEvent`). The child must forward a ref to its root DOM node.
 *
 * @see asma-modules/_docs/frontend/plans/2026-07-10-19-12-plan-asma-ui-core-mui-removal.md — TASK-102
 */
export const ClickAwayListener = ({
    children,
    onClickAway,
    mouseEvent = 'onClick',
    touchEvent = 'onTouchEnd',
}: ClickAwayListenerProps): ReactElement => {
    const nodeRef = useRef<Element | null>(null)
    const callbackRef = useRef(onClickAway)

    useEffect(() => {
        callbackRef.current = onClickAway
    }, [onClickAway])

    useEffect(() => {
        const handler = (event: Event) => {
            const node = nodeRef.current
            if (node && event.target instanceof Node && !node.contains(event.target)) {
                callbackRef.current(event as MouseEvent | TouchEvent)
            }
        }

        const names = [mouseEvent, touchEvent]
            .filter((name): name is MouseEventName | TouchEventName => name !== false)
            .map((name) => DOM_EVENT[name])
            .filter((name): name is string => Boolean(name))

        for (const name of names) document.addEventListener(name, handler)
        return () => {
            for (const name of names) document.removeEventListener(name, handler)
        }
    }, [mouseEvent, touchEvent])

    const setRef = useCallback(
        (node: Element | null) => {
            nodeRef.current = node
            // Forward to a callback ref on the child if present. Object refs aren't chained
            // (ponytail: none of the fleet's ClickAwayListener children carry their own ref;
            // add object-ref merging only if a consumer needs it).
            const childRef = (children as { ref?: ChildRef }).ref
            if (typeof childRef === 'function') childRef(node)
        },
        [children],
    )

    // eslint-disable-next-line react-hooks/refs -- setRef is a stable callback ref that only writes; no ref value is read during render
    return cloneElement(children, { ref: setRef })
}
