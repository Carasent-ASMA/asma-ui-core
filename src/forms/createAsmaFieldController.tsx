import { type ReactElement, type ReactNode, useCallback, useEffect, useRef } from 'react'
import {
    type Control,
    type ControllerRenderProps,
    type FieldPath,
    type FieldPathValue,
    type FieldValues,
    type RegisterOptions,
    useController,
    useFormContext,
} from 'react-hook-form'

import type { AsmaFormsOptions } from './types'

const AUTOFILL_POLL_INTERVAL_MS = 150
const AUTOFILL_POLL_MAX_ATTEMPTS = 20
const AUTOFILL_ANIMATION_NAME = 'onAutoFillStart'

export interface AutofillAnimationEvent {
    animationName: string
    target: EventTarget | null
}

export interface AsmaFieldRenderProps<TValue = unknown> {
    value: TValue
    onChange: (...event: unknown[]) => void
    onBlur: () => void
    onAnimationStart: (event: AutofillAnimationEvent) => void
    name: string
    ref: ControllerRenderProps['ref']
    error: boolean
    helperText: ReactNode
    reserveHelperText: boolean
}

export interface AsmaFieldControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
    name: TName
    control?: Control<TFieldValues>
    rules?: Omit<RegisterOptions<TFieldValues, TName>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>
    helperText?: ReactNode
    /** For controls that own their input ref (comboboxes, rich editors): RHF focuses the field through this instead of a DOM node. */
    requestFocus?: () => void
    render: (props: AsmaFieldRenderProps<FieldPathValue<TFieldValues, TName>>) => ReactElement
}

function isEmptyValue(value: unknown): boolean {
    if (value == null) return true
    if (typeof value === 'string') return value.trim().length === 0
    if (typeof value === 'number') return Number.isNaN(value)
    return false
}

function isRequiredRule(rules: { required?: unknown } | undefined): boolean {
    if (!rules) return false
    if (rules.required === false || rules.required == null) return false
    return true
}

export function createAsmaFieldController({
    getLanguageCode,
    browserAutofill = false,
}: AsmaFormsOptions) {
    return function AsmaFieldController<
        TFieldValues extends FieldValues = FieldValues,
        TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    >({
        name,
        control,
        rules,
        helperText,
        requestFocus,
        render,
    }: AsmaFieldControllerProps<TFieldValues, TName>): ReactElement {
        const form = useFormContext<TFieldValues>()
        const { field, fieldState } = useController({
            name,
            control: control ?? form.control,
            rules,
        })
        const { trigger, setValue } = form
        const { ref: fieldRef } = field
        const required = isRequiredRule(rules)
        const languageCode = getLanguageCode()
        const inputRef = useRef<HTMLInputElement | null>(null)

        const syncAndValidate = (domValue: string | undefined) => {
            if (domValue != null && domValue !== field.value) field.onChange(domValue)
            void trigger(name)
        }

        // useController's ref wraps its target in a {focus, select, …} proxy and the shouldFocusError
        // path only ever calls .focus(), so a plain object is a valid target.
        useEffect(() => {
            if (!requestFocus) return
            fieldRef({ focus: requestFocus })
        }, [fieldRef, requestFocus])

        useEffect(() => {
            if (fieldState.invalid) void trigger(name)
            // eslint-disable-next-line react-hooks/exhaustive-deps -- language only
        }, [languageCode])

        // A remembered (prefilled) value is never validated by mode 'onBlur' on its own, so a submit
        // gated on formState.isValid would stay disabled. Empty fields stay silent (REQ-001).
        useEffect(() => {
            if (!browserAutofill) return
            if (!isEmptyValue(field.value)) void trigger(name)
            // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
        }, [])

        // Password managers write the DOM value directly, bypassing blur and React. The autofill
        // decision lands anywhere from 0 to ~1s after mount, so poll briefly instead of checking once.
        useEffect(() => {
            if (!browserAutofill) return
            let attempts = 0
            const intervalId = setInterval(() => {
                attempts += 1
                const element = inputRef.current
                if (element?.matches(':-webkit-autofill')) {
                    syncAndValidate(element.value)
                    clearInterval(intervalId)
                } else if (attempts >= AUTOFILL_POLL_MAX_ATTEMPTS) {
                    clearInterval(intervalId)
                }
            }, AUTOFILL_POLL_INTERVAL_MS)
            return () => clearInterval(intervalId)
            // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
        }, [])

        const onBlur = () => {
            if (!required && isEmptyValue(field.value)) {
                setValue(name, field.value, { shouldTouch: true, shouldValidate: false })
                return
            }
            field.onBlur()
            void trigger(name)
        }

        // Reward-early (REQ-002): watches the value, not onChange, because widgets owning several
        // fields write them with setValue. Guarded on a visible error, so it can only clear one.
        useEffect(() => {
            if (fieldState.error) void trigger(name)
            // eslint-disable-next-line react-hooks/exhaustive-deps -- value transitions only
        }, [field.value])

        const onChange = (...event: unknown[]) => {
            field.onChange(...event)
        }

        const onAnimationStart = (event: AutofillAnimationEvent) => {
            if (!browserAutofill) return
            if (event.animationName !== AUTOFILL_ANIMATION_NAME) return
            syncAndValidate((event.target as HTMLInputElement | null)?.value)
        }

        const setRef = useCallback(
            (element: HTMLInputElement | null) => {
                inputRef.current = element
                if (typeof fieldRef === 'function') fieldRef(element)
            },
            [fieldRef],
        )

        const errorMessage = fieldState.error?.message
        // Silent validation (mount check, autofill sync, language switch) must never paint an error
        // the user did not cause, so autofill-aware forms reveal errors only on touched fields.
        const showError = Boolean(fieldState.error) && (!browserAutofill || fieldState.isTouched)

        return render({
            value: field.value,
            onChange,
            onBlur,
            onAnimationStart,
            name: field.name,
            ref: browserAutofill ? setRef : fieldRef,
            error: showError,
            helperText: showError ? errorMessage : helperText,
            reserveHelperText: rules != null,
        })
    }
}
