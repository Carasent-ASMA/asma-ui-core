let lastInputWasKeyboard = false
let tracking = false

/**
 * Starts tracking, once per page, whether the user's last action was a key press or a pointer press
 * (mouse, pen, touch). Capture phase, so it sees the press that opens a picker before anything
 * handles it. Only trusted events count: a script's synthetic events say nothing about the user.
 *
 * Why not `:focus-visible`: when a picker opens, `StyledDialog` moves focus from the field to its own
 * shell, and a browser lets a scripted focus move inherit the field's focus-visible state. A text
 * field is always focus-visible, so a tap on a field that already had focus (after an earlier choice)
 * read as keyboard and put the active-row marker in the list (ASMA-8468).
 */
export const trackInputModality = (): void => {
    if (tracking || typeof document === 'undefined') return
    tracking = true
    document.addEventListener(
        'keydown',
        (event) => {
            if (event.isTrusted && !event.metaKey && !event.ctrlKey && !event.altKey) lastInputWasKeyboard = true
        },
        true,
    )
    document.addEventListener(
        'pointerdown',
        (event) => {
            if (event.isTrusted) lastInputWasKeyboard = false
        },
        true,
    )
}

/** The user's last action was a key press (see {@link trackInputModality}). */
export const isKeyboardModality = (): boolean => lastInputWasKeyboard
