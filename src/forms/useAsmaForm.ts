import { type FieldValues, type UseFormProps, type UseFormReturn, useForm } from 'react-hook-form'

const PINNED_FORM_OPTIONS = {
    mode: 'onBlur',
    reValidateMode: 'onSubmit',
    criteriaMode: 'all',
    shouldFocusError: true,
} as const

export function useAsmaForm<TFieldValues extends FieldValues = FieldValues, TContext = unknown>(
    props?: UseFormProps<TFieldValues, TContext>,
): UseFormReturn<TFieldValues, TContext> {
    return useForm<TFieldValues, TContext>({
        ...props,
        ...PINNED_FORM_OPTIONS,
    })
}
