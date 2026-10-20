export interface FieldName {
    /** The field's label: shown as the picker title. */
    label: string
    /** What names the dialog and list when there is no label: the label, else the placeholder. */
    name: string
}

/**
 * The field's name for the full-screen picker (ASMA-8468 TASK-015), in the order a browser names an
 * input: its first `<label>`, else the elements named by `aria-labelledby`, else `aria-label` — a
 * visible label that is not linked to the input usually reaches it that way (RISK-002). A
 * placeholder only names the dialog and list, it is no title. Empty strings when there is nothing.
 */
export const readFieldName = (input: HTMLInputElement | null): FieldName => {
    if (!input) return { label: '', name: '' }
    const labelledBy = (input.getAttribute('aria-labelledby') ?? '')
        .split(/\s+/)
        .map((id) => input.ownerDocument.getElementById(id)?.textContent?.trim() ?? '')
        .filter(Boolean)
        .join(' ')
    const sources = [input.labels?.[0]?.textContent, labelledBy, input.getAttribute('aria-label')]
    const label = sources.map((text) => text?.trim() ?? '').find(Boolean) ?? ''
    return { label, name: label === '' ? input.placeholder.trim() : label }
}
