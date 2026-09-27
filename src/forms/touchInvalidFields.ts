import type { FieldValues, Path, UseFormReturn } from 'react-hook-form'

export function touchInvalidFields<TFieldValues extends FieldValues>(methods: UseFormReturn<TFieldValues>): void {
    for (const key of Object.keys(methods.control._formState.errors)) {
        const name = key as Path<TFieldValues>
        methods.setValue(name, methods.getValues(name), { shouldTouch: true, shouldValidate: false })
    }
}
