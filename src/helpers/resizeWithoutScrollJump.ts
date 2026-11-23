/**
 * Runs an auto-grow `resize` of a textarea while its parent keeps its current height.
 *
 * Auto-grow drops the textarea to `height: auto` to read its content height. On a field taller than
 * the screen that collapse also shortens the page for a moment, the browser clamps the scroll position
 * to the shorter page, and the caret jumps from mid-screen to the screen edge (ASMA-9033). Holding the
 * parent's height while measuring keeps the page the same length, so the scroll position is untouched.
 * The parent never stretches the textarea here: both callers lay it out at its own height.
 *
 * @param textarea - The textarea being resized.
 * @param resize - Collapses, measures and sets the textarea height; runs synchronously.
 * @returns What `resize` returns.
 */
export const resizeWithoutScrollJump = <T>(textarea: HTMLTextAreaElement, resize: () => T): T => {
    const parent = textarea.parentElement
    if (!parent) return resize()

    const previousMinHeight = parent.style.minHeight
    parent.style.minHeight = `${parent.getBoundingClientRect().height}px`
    try {
        return resize()
    } finally {
        parent.style.minHeight = previousMinHeight
    }
}
