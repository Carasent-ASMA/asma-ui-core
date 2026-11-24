/**
 * ASMA-9003 — holds `data-pressed` on a control while it is pressed, so its pressed look is styled from
 * `[data-pressed]` alone (set on the DOM node: no React state). A pointer press stores "", Space "key".
 * When a press ends (release, cancel, drag-off, Space keyup, blur, window blur) `data-pressed` goes and a
 * value-less `data-press-released` marks the release: style `[data-press-released]` to ease the pressed
 * properties back over 150 ms, so hover and selection keep their own timing. The marker goes on the next
 * pointerenter, pointerdown or keydown, and on pointerleave when nothing is pressed. No timers.
 * @see asma-modules/_docs/ux/patterns/pattern-pressed-state.md
 */
import type { DOMAttributes, SyntheticEvent } from 'react'

export interface PressedStateOptions {
    /** False while disabled, aria-disabled, read-only or busy: the control never shows a pressed look. */
    enabled: boolean
    /** Native-button-like controls: a held Space presses them too (Enter never does). */
    keyboard?: boolean
}

const HANDLER_KEYS = [
    'onPointerDown',
    'onPointerUp',
    'onPointerCancel',
    'onPointerLeave',
    'onPointerEnter',
    'onKeyDown',
    'onKeyUp',
    'onBlur',
] as const

/** The event props the pressed state handles (and `withPressedState` composes with a consumer's own). */
export type PressedStateEventProps<E extends HTMLElement = HTMLElement> = Pick<
    DOMAttributes<E>,
    (typeof HANDLER_KEYS)[number]
>

const PRESSED = 'data-pressed'
const RELEASED = 'data-press-released'

/** Separately operable controls: a press that starts in one never presses the control around it (CARD-15). */
const NESTED_CONTROL =
    'a[href], button, input, select, textarea, summary, label, [tabindex], [contenteditable]:not([contenteditable="false"]), [role="button"], [role="checkbox"], [role="radio"], [role="switch"], [role="link"], [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="option"], [role="tab"], [role="textbox"], [role="combobox"], [role="slider"]'

/**
 * True when `target` sits in a nested control. A label's own checkbox/radio `<input>` is the label itself;
 * for any other owner an input counts as its own only when no nested control (a label included) wraps it.
 */
const startsInNestedControl = (target: EventTarget | null, owner: HTMLElement): boolean => {
    for (let node = target instanceof Element ? target : null; node && node !== owner; node = node.parentElement) {
        const ownInput =
            node.matches('input[type="checkbox"], input[type="radio"]') &&
            (!(owner instanceof HTMLLabelElement) || owner.control === node)
        if (node.matches(NESTED_CONTROL) && !ownInput) return true
    }
    return false
}

/** Where the current primary pointer press began: dragging back onto it while held restores the press. */
let pressOrigin: HTMLElement | null = null

/** The elements this helper marked: it never removes a `data-pressed` or marker someone else set (the Card's). */
const pressedHere = new WeakSet<Element>()
const releasedHere = new WeakSet<Element>()

const clearMarkerOf = (owner: HTMLElement): void => {
    if (releasedHere.delete(owner)) owner.removeAttribute(RELEASED)
}

const press = (owner: HTMLElement, value: '' | 'key'): void => {
    clearMarkerOf(owner)
    owner.setAttribute(PRESSED, value)
    pressedHere.add(owner)
}

/** Ends this helper's press of the given source: the pressed look goes and the release marker eases it out. */
const release = (owner: HTMLElement, value: '' | 'key'): void => {
    if (!pressedHere.has(owner) || owner.getAttribute(PRESSED) !== value) return
    pressedHere.delete(owner)
    owner.removeAttribute(PRESSED)
    owner.setAttribute(RELEASED, '')
    releasedHere.add(owner)
}

const forgetPress = (): void => {
    pressOrigin = null
}

/** A pointer release the element never hears about (Alt-Tab, an OS dialog) still ends the press. */
const releaseOnWindowBlur = (): void => {
    if (pressOrigin) release(pressOrigin, '')
    forgetPress()
}

const endPointerPress = (event: SyntheticEvent<HTMLElement>): void => {
    forgetPress()
    release(event.currentTarget, '')
}

const clearMarker = (event: SyntheticEvent<HTMLElement>): void => clearMarkerOf(event.currentTarget)

const CLEARING: PressedStateEventProps = {
    onPointerUp: endPointerPress,
    onPointerCancel: endPointerPress,
    onPointerLeave: (event) => {
        if (pressedHere.has(event.currentTarget) && event.currentTarget.getAttribute(PRESSED) === '')
            release(event.currentTarget, '')
        else clearMarker(event)
    },
    onPointerEnter: clearMarker,
}

const KEY_CLEARING: PressedStateEventProps = {
    onKeyDown: clearMarker,
    onKeyUp: (event) => {
        if (event.key === ' ') release(event.currentTarget, 'key')
    },
    onBlur: (event) => release(event.currentTarget, 'key'),
}

const POINTER_SETTING: PressedStateEventProps = {
    onPointerDown: (event) => {
        const owner = event.currentTarget
        clearMarker(event)
        // Only the owner that takes the press records it: an enclosing owner seeing it bubble must not reset it.
        if (event.button !== 0 || startsInNestedControl(event.target, owner)) return
        press(owner, '')
        pressOrigin = owner
        const view = owner.ownerDocument.defaultView
        owner.ownerDocument.addEventListener('pointerup', forgetPress, { capture: true, once: true })
        owner.ownerDocument.addEventListener('pointercancel', forgetPress, { capture: true, once: true })
        view?.addEventListener('blur', releaseOnWindowBlur, { once: true })
    },
    onPointerEnter: (event) => {
        const owner = event.currentTarget
        clearMarker(event)
        if (pressOrigin === owner && event.buttons & 1 && !owner.hasAttribute(PRESSED)) press(owner, '')
    },
}

const KEY_SETTING: PressedStateEventProps = {
    onKeyDown: (event) => {
        clearMarker(event)
        if (event.key === ' ' && !event.repeat && !startsInNestedControl(event.target, event.currentTarget))
            press(event.currentTarget, 'key')
    },
}

/** The four handler sets, built once: they depend only on `enabled` and `keyboard`. */
const HANDLERS = {
    disabledPointer: Object.freeze({ ...CLEARING }),
    disabledKeyboard: Object.freeze({ ...CLEARING, ...KEY_CLEARING }),
    pointer: Object.freeze({ ...CLEARING, ...POINTER_SETTING }),
    keyboard: Object.freeze({ ...CLEARING, ...KEY_CLEARING, ...POINTER_SETTING, ...KEY_SETTING }),
}

/**
 * Pointer: a primary-button press sets it (never from a nested control); up, cancel and leave end it, and
 * re-entering while still held restores it. Keyboard (`keyboard: true`): Space without repeat sets it; Enter
 * and the arrow keys never do. `enabled: false` returns only the handlers that end a press.
 */
export function pressedStateHandlers({ enabled, keyboard = false }: PressedStateOptions): Readonly<PressedStateEventProps> {
    if (enabled) return keyboard ? HANDLERS.keyboard : HANDLERS.pointer
    return keyboard ? HANDLERS.disabledKeyboard : HANDLERS.disabledPointer
}

/** One handler that calls each defined handler in order — for chaining a component's or consumer's own. */
export function composeHandlers<E>(...handlers: (((event: E) => void) | undefined)[]): ((event: E) => void) | undefined {
    const defined = handlers.filter((handler): handler is (event: E) => void => handler !== undefined)
    if (defined.length === 0) return undefined
    return (event) => {
        for (const handler of defined) handler(event)
    }
}

/** The pressed-state handlers, each composed after the consumer's own handler from `props` (spread the result). */
export function withPressedState<E extends HTMLElement>(
    props: PressedStateEventProps<E>,
    options: PressedStateOptions,
): PressedStateEventProps<E> {
    const pressed = pressedStateHandlers(options) as PressedStateEventProps<E>
    return Object.fromEntries(
        HANDLER_KEYS.map((key) => [key, composeHandlers<never>(props[key], pressed[key])]),
    )
}
