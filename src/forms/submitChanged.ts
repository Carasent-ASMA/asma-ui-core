import type { FieldValues, UseFormReturn } from 'react-hook-form'

import { getDirtyValues } from './getDirtyValues'
import { touchInvalidFields } from './touchInvalidFields'

export type SubmitChangedPatch<TFieldValues extends FieldValues> = (
    dirty: Partial<TFieldValues>,
    all: TFieldValues,
) => Promise<TFieldValues | void>

export interface SubmitChangedOptions {
    touchInvalidFields?: boolean
}

export async function submitChanged<TFieldValues extends FieldValues>(
    methods: UseFormReturn<TFieldValues>,
    onPatch: SubmitChangedPatch<TFieldValues>,
    onInvalid?: () => void,
    options: SubmitChangedOptions = {},
): Promise<boolean> {
    const valid = onInvalid ? await methods.trigger() : await methods.trigger(undefined, { shouldFocus: true })
    if (!valid) {
        if (options.touchInvalidFields) touchInvalidFields(methods)
        onInvalid?.()
        return false
    }

    const all = methods.getValues()
    // methods.formState is the render-time proxy: unless something read dirtyFields during a
    // render, it serves a stale snapshot (empty on the first submit). control._formState is the
    // live store that getFieldState reads, and it is maintained regardless of subscriptions.
    const { dirtyFields } = methods.control._formState
    const dirty = getDirtyValues(
        dirtyFields as Partial<Record<keyof TFieldValues, unknown>>,
        all as Record<string, unknown>,
    ) as Partial<TFieldValues>

    const saved = await onPatch(dirty, all)
    methods.reset(saved ?? all)
    return true
}
