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
    disableReactTree = false,
}: ClickAwayListenerProps): ReactElement => {
    const nodeRef = useRef<Element | null>(null)
    const callbackRef = useRef(onClickAway)
    const syntheticEventRef = useRef(false)
    const activatedRef = useRef(false)

    useEffect(() => {
        callbackRef.current = onClickAway
    }, [onClickAway])

    // React 18+ runs this effect synchronously when a click mounts the listener, while that click
    // is still bubbling to `document`; it would count as a click away and close a popup the
    // moment it opens. Arm on the next tick, as MUI does (facebook/react#20074). ASMA-8421.
    useEffect(() => {
        const timer = setTimeout(() => {
            activatedRef.current = true
        }, 0)
        return () => {
            clearTimeout(timer)
            activatedRef.current = false
        }
    }, [])

    useEffect(() => {
        const handler = (event: Event) => {
            const node = nodeRef.current
            const insideReactTree = syntheticEventRef.current
            syntheticEventRef.current = false

            if (
                activatedRef.current &&
                node &&
                event.target instanceof Node &&
                !node.contains(event.target) &&
                (disableReactTree || !insideReactTree)
            ) {
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
    }, [disableReactTree, mouseEvent, touchEvent])

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

    const childProps = children.props as Record<string, unknown>
    const syntheticHandlers = [mouseEvent, touchEvent]
        .filter((name): name is MouseEventName | TouchEventName => name !== false)
        .reduce<Record<string, (event: unknown) => void>>((handlers, name) => {
            handlers[name] = (event) => {
                syntheticEventRef.current = true
                const childHandler = childProps[name]
                if (typeof childHandler === 'function') (childHandler as (event: unknown) => void)(event)
            }
            return handlers
        }, {})

    // eslint-disable-next-line react-hooks/refs -- setRef is a stable callback ref that only writes; no ref value is read during render
    return cloneElement(children, { ref: setRef, ...syntheticHandlers })
}
