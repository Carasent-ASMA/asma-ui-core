import { cdp } from 'vitest/browser'

/**
 * ASMA-9003 — trusted input and readers shared by the `interaction` project's pressed-state tests. Input goes
 * through the DevTools protocol, so the browser itself hit-tests and fires pointer, mouse and key events as a
 * real press does. Points are in this frame's coordinates and mapped into the runner page, which the protocol
 * addresses, through the frame's offset and scale.
 */

export interface Point {
    x: number
    y: number
}

/** The centre of an element, optionally offset. */
export const centreOf = (element: Element, { dx = 0, dy = 0 }: { dx?: number; dy?: number } = {}): Point => {
    const box = element.getBoundingClientRect()
    return { x: box.left + box.width / 2 + dx, y: box.top + box.height / 2 + dy }
}

const toRunnerPage = ({ x, y }: Point): Point => {
    const frame = window.frameElement?.getBoundingClientRect() ?? new DOMRect(0, 0, window.innerWidth, window.innerHeight)
    const scale = frame.width / window.innerWidth
    return { x: frame.left + x * scale, y: frame.top + y * scale }
}

/**
 * A trusted mouse event at an element's centre or at a point. `held` keeps the button down while moving (a
 * drag); `button: 'right'` presses the secondary button.
 */
export const mouse = async (
    type: 'mouseMoved' | 'mousePressed' | 'mouseReleased',
    target: Element | Point,
    { held = false, button = 'left' }: { held?: boolean; button?: 'left' | 'right' } = {},
): Promise<void> => {
    const at = toRunnerPage(target instanceof Element ? centreOf(target) : target)
    const down = type === 'mousePressed' || (type === 'mouseMoved' && held)
    await cdp().send('Input.dispatchMouseEvent', {
        type,
        ...at,
        button: type === 'mouseMoved' && !held ? 'none' : button,
        buttons: down ? (button === 'left' ? 1 : 2) : 0,
        clickCount: type === 'mouseMoved' ? 0 : 1,
    })
}

const KEYS = {
    ' ': { code: 'Space', windowsVirtualKeyCode: 32, text: ' ' },
    Enter: { code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' },
    Tab: { code: 'Tab', windowsVirtualKeyCode: 9 },
    Escape: { code: 'Escape', windowsVirtualKeyCode: 27 },
    ArrowDown: { code: 'ArrowDown', windowsVirtualKeyCode: 40 },
    ArrowUp: { code: 'ArrowUp', windowsVirtualKeyCode: 38 },
    ArrowLeft: { code: 'ArrowLeft', windowsVirtualKeyCode: 37 },
    ArrowRight: { code: 'ArrowRight', windowsVirtualKeyCode: 39 },
} as const

/** A trusted key event on the focused element; `repeat` sends an auto-repeat keydown. */
export const key = async (
    type: 'keyDown' | 'keyUp',
    name: keyof typeof KEYS,
    { repeat = false }: { repeat?: boolean } = {},
): Promise<void> => {
    const { windowsVirtualKeyCode, code, ...rest } = KEYS[name]
    const text = type === 'keyDown' && 'text' in rest ? { text: rest.text } : {}
    await cdp().send('Input.dispatchKeyEvent', {
        type,
        key: name,
        code,
        windowsVirtualKeyCode,
        nativeVirtualKeyCode: windowsVirtualKeyCode,
        autoRepeat: repeat,
        ...text,
    })
}

/** A Space key event on the focused element: `space('keyDown')` holds it, `space('keyUp')` releases it. */
export const space = (type: 'keyDown' | 'keyUp', options?: { repeat?: boolean }): Promise<void> =>
    key(type, ' ', options)

/** Waits `ms` milliseconds, e.g. for a 150 ms release ease to finish. */
export const settle = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/** A CSS system colour (e.g. `Highlight`) as the computed `rgb(…)` string, also while forced colours are on. */
export const systemColor = (name: string): string => {
    const probe = document.createElement('span')
    probe.style.cssText = `forced-color-adjust: none; color: ${name}`
    document.body.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
}

/** Holds the primary button down on the element's centre while `whilePressed` runs, and releases in `finally`. */
export const holdPressed = async (target: Element, whilePressed: () => Promise<void>): Promise<void> => {
    await mouse('mouseMoved', target)
    await mouse('mousePressed', target)
    try {
        await whilePressed()
    } finally {
        await mouse('mouseReleased', target)
    }
}

/** The element's own background colour: where every pressed fill is painted. */
export const fillOf = (element: Element): string => getComputedStyle(element).backgroundColor

/** The element's transition, to compare hover timing with master and check the 150 ms release ease. */
export const transitionOf = (element: Element): { property: string; duration: string; timing: string } => {
    const style = getComputedStyle(element)
    return {
        property: style.transitionProperty,
        duration: style.transitionDuration,
        timing: style.transitionTimingFunction,
    }
}
