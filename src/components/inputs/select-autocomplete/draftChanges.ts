export type DraftChange<T> =
    | { value: T[]; reason: 'removeOption' | 'selectOption'; option: T }
    | { value: T[]; reason: 'clear'; option?: undefined }

/**
 * The `onChange` calls that turn `applied` into `draft` the way ticking in the attached list would
 * have (ASMA-8468 D-007): one `removeOption`/`selectOption` per changed option, carrying
 * `details.option`, so consumers that act per tick keep working. Removals come first, additions in
 * the order they were ticked. Emptying a non-empty value is one `clear`, as the field's × does. No
 * change, no calls.
 */
export const getDraftChanges = <T,>(applied: readonly T[], draft: readonly T[], isEqual: (a: T, b: T) => boolean): DraftChange<T>[] => {
    if (draft.length === 0) return applied.length > 0 ? [{ value: [], reason: 'clear' }] : []
    const changes: DraftChange<T>[] = []
    let current = [...applied]
    for (const option of applied) {
        if (draft.some((ticked) => isEqual(option, ticked))) continue
        current = current.filter((chosen) => !isEqual(chosen, option))
        changes.push({ value: current, reason: 'removeOption', option })
    }
    for (const option of draft) {
        if (applied.some((chosen) => isEqual(option, chosen))) continue
        current = [...current, option]
        changes.push({ value: current, reason: 'selectOption', option })
    }
    return changes
}
