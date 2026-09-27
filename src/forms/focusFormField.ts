const FOCUSABLE_SELECTOR = 'input, textarea, select, button, [contenteditable="true"], [contenteditable=""], [tabindex]'

function isFocusable(element: HTMLElement): boolean {
    return element.matches(FOCUSABLE_SELECTOR)
}

export function focusFormField(fieldDomId: string): boolean {
    const element =
        document.getElementById(fieldDomId) ??
        Array.from(document.querySelectorAll<HTMLElement>('[data-testid]')).find(
            (candidate) => candidate.dataset['testid'] === fieldDomId,
        )

    if (!element) return false

    const focusTarget = isFocusable(element)
        ? element
        : (element.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? element)

    focusTarget.focus({ preventScroll: true })
    element.scrollIntoView({ behavior: 'instant', block: 'center' })
    return true
}
