import type { FieldValues, UseFormReturn } from 'react-hook-form'

import { createAsmaFieldController } from './createAsmaFieldController'
import { submitChanged as submitChangedWithOptions, type SubmitChangedPatch } from './submitChanged'
import type { AsmaFormsOptions } from './types'

export interface AsmaFormsApi {
    AsmaFieldController: ReturnType<typeof createAsmaFieldController>
    submitChanged: <TFieldValues extends FieldValues>(
        methods: UseFormReturn<TFieldValues>,
        onPatch: SubmitChangedPatch<TFieldValues>,
        onInvalid?: () => void,
    ) => Promise<boolean>
}

export function createAsmaForms(options: AsmaFormsOptions): AsmaFormsApi {
    const touchInvalidFieldsOnSubmit = options.browserAutofill === true

    const submitChanged = <TFieldValues extends FieldValues>(
        methods: UseFormReturn<TFieldValues>,
        onPatch: SubmitChangedPatch<TFieldValues>,
        onInvalid?: () => void,
    ): Promise<boolean> =>
        submitChangedWithOptions(methods, onPatch, onInvalid, { touchInvalidFields: touchInvalidFieldsOnSubmit })

    return {
        AsmaFieldController: createAsmaFieldController(options),
        submitChanged,
    }
}
