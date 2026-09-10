import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { ReactElement } from 'react'

/**
 * Minimal mount/unmount harness for the `interaction` project (ASMA-8139).
 *
 * Deliberately hand-rolled rather than pulling in `@testing-library/react`: the coordinator's
 * no-new-dependency constraint for this epic, and everything these tests actually need from RTL
 * (queries, `userEvent`, jest-dom matchers) is already re-exported by `storybook/test`, which
 * resolves because `storybook` is a direct devDependency. All this file adds is the React render
 * step RTL would otherwise own.
 */

interface MountResult {
    /** The container the component was rendered into. Scope queries to it, not to `document`. */
    container: HTMLElement
    /** Re-render with new props, e.g. to flip a controlled `open` prop. */
    rerender: (next: ReactElement) => void
    unmount: () => void
}

const mounted = new Set<{ root: Root; container: HTMLElement }>()

/**
 * React 18 only honours `act()` while `IS_REACT_ACT_ENVIRONMENT` is set, but leaving it on for the
 * whole test makes React warn about every state update driven by a real user event — and these are
 * real browser events, dispatched by `userEvent` and already flushed by the browser's own event
 * loop, so there is nothing for `act` to do there. Scope the flag to the render calls that genuinely
 * need a synchronous flush. (Same split `@testing-library/react` makes via its `asyncWrapper`.)
 */
const actEnvironment = <T,>(body: () => T): T => {
    const global = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    const previous = global.IS_REACT_ACT_ENVIRONMENT
    global.IS_REACT_ACT_ENVIRONMENT = true
    try {
        return body()
    } finally {
        global.IS_REACT_ACT_ENVIRONMENT = previous
    }
}

/**
 * Mounts `ui` into a fresh container appended to `document.body`.
 *
 * `document.body` and not a detached node on purpose: focus, `:focus-visible`, `inert`, the top
 * layer and `<dialog>.showModal()` all only behave correctly for elements in the live document,
 * and every one of those is under test here.
 */
export const mount = (ui: ReactElement): MountResult => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    const entry = { root, container }
    mounted.add(entry)

    actEnvironment(() =>
        act(() => {
            root.render(ui)
        }),
    )

    return {
        container,
        rerender: (next) => {
            actEnvironment(() =>
                act(() => {
                    root.render(next)
                }),
            )
        },
        unmount: () => {
            actEnvironment(() =>
                act(() => {
                    root.unmount()
                }),
            )
            container.remove()
            mounted.delete(entry)
        },
    }
}

/** Unmounts everything `mount` created. Call from `afterEach`. */
export const cleanup = (): void => {
    for (const entry of mounted) {
        actEnvironment(() =>
            act(() => {
                entry.root.unmount()
            }),
        )
        entry.container.remove()
    }
    mounted.clear()
    // Portalled overlays (Floating UI, `<dialog>`, the snackbar host) attach outside the container,
    // and a leaked open modal would make the NEXT test's document inert. Belt and braces.
    document.querySelectorAll('dialog[open]').forEach((node) => (node as HTMLDialogElement).close())
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
}

/**
 * A focus indicator that a sighted keyboard user can actually see (WCAG 2.4.7).
 *
 * Returns the reason a given element is considered focus-visible, or `null` if nothing changes.
 * Compares the element's computed style while focused against the same element's baseline, so a
 * component that indicates focus with a background swap counts just as much as one drawing an
 * outline. Callers pass the baseline they captured BEFORE focusing.
 */
export interface FocusStyle {
    outlineStyle: string
    outlineWidth: string
    outlineColor: string
    boxShadow: string
    backgroundColor: string
    borderColor: string
    borderWidth: string
}

export const focusStyleOf = (element: Element): FocusStyle => {
    const style = getComputedStyle(element)
    return {
        outlineStyle: style.outlineStyle,
        outlineWidth: style.outlineWidth,
        outlineColor: style.outlineColor,
        boxShadow: style.boxShadow,
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        borderWidth: style.borderWidth,
    }
}

/**
 * `null` when the element paints no perceivable focus indicator, otherwise the property that
 * changed. An `outline` is only counted when it is actually drawn (`outline-none` compiles to
 * `outline-style: solid; outline-width: 0` in places, which paints nothing).
 */
export const describeFocusIndicator = (before: FocusStyle, after: FocusStyle): string | null => {
    const paintsOutline =
        after.outlineStyle !== 'none' && after.outlineWidth !== '0px' && after.outlineColor !== 'transparent'
    if (paintsOutline && (before.outlineStyle !== after.outlineStyle || before.outlineWidth !== after.outlineWidth))
        return `outline ${after.outlineWidth} ${after.outlineStyle}`
    if (after.boxShadow !== before.boxShadow && after.boxShadow !== 'none') return `box-shadow ${after.boxShadow}`
    if (after.backgroundColor !== before.backgroundColor) return `background ${after.backgroundColor}`
    if (after.borderColor !== before.borderColor || after.borderWidth !== before.borderWidth)
        return `border ${after.borderWidth} ${after.borderColor}`
    return null
}

/** Every element in `root` that a Tab press can land on, in document order. */
export const tabbableWithin = (root: ParentNode): HTMLElement[] =>
    Array.from(
        root.querySelectorAll<HTMLElement>(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]',
        ),
    ).filter((node) => !node.hasAttribute('disabled') && node.getAttribute('aria-hidden') !== 'true')

/**
 * SC 2.4.11 Focus Not Obscured (Minimum), AA.
 *
 * Returns `true` when NO part of `element` is hit-testable — i.e. it is entirely covered by
 * something painted on top of it, or has no box at all. The criterion is "not *entirely* hidden",
 * so partial overlap is allowed and a single visible sample is enough to pass.
 *
 * Uses `elementFromPoint`, which respects paint order, the top layer and `pointer-events`, so it
 * answers the question a sighted keyboard user actually has ("can I see where I am?") rather than
 * the question a z-index comparison would answer. Samples a 3x3 grid inset from the edges, because
 * corners land on borders and rounded corners return the element behind.
 */
export const isEntirelyObscured = (element: Element): boolean => {
    const rect = element.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return true

    const fractions = [0.25, 0.5, 0.75]
    for (const fx of fractions) {
        for (const fy of fractions) {
            const x = rect.left + rect.width * fx
            const y = rect.top + rect.height * fy
            if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) continue
            const hit = document.elementFromPoint(x, y)
            if (hit && (hit === element || element.contains(hit))) return false
        }
    }
    return true
}
