/**
 * @vitest-environment jsdom
 */
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type ReactNode, forwardRef, useState } from 'react'
import { FormProvider, type UseFormReturn } from 'react-hook-form'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createAsmaForms } from './createAsmaForms'
import type { AsmaFieldRenderProps } from './createAsmaFieldController'
import { useAsmaForm } from './useAsmaForm'

const { AsmaFieldController } = createAsmaForms({ getLanguageCode: () => 'en' })

const { AsmaFieldController: AutofillFieldController, submitChanged: autofillSubmitChanged } = createAsmaForms({
    getLanguageCode: () => 'en',
    browserAutofill: true,
})

afterEach(() => {
    cleanup()
    vi.useRealTimers()
})

interface FieldInputProps {
    label: string
    testId: string
    value: unknown
    onChange: (...event: unknown[]) => void
    onBlur: () => void
    onAnimationStart?: (event: { animationName: string; target: EventTarget | null }) => void
    error: boolean
    helperText: ReactNode
    name: string
}

// React 18 drops `ref` when it is spread onto a plain function component (the apps run React 19,
// where ref-as-prop works), so the harness forwards it explicitly.
const FieldInput = forwardRef<HTMLInputElement, FieldInputProps>(function FieldInput(
    { label, testId, value, onChange, onBlur, onAnimationStart, error, helperText, name },
    ref,
) {
    return (
        <label>
            {label}
            <input
                aria-invalid={error || undefined}
                data-testid={testId}
                name={name}
                onAnimationStart={onAnimationStart}
                onBlur={onBlur}
                onChange={(event) => onChange(event.target.value)}
                ref={ref}
                value={(value as string) ?? ''}
            />
            {helperText ? <span role={error ? 'alert' : 'status'}>{helperText}</span> : null}
        </label>
    )
})

interface TestFormValues {
    title: string
    email: string
}

function TestForm({
    required,
    validate,
    explicitControl,
}: {
    required?: string | boolean
    validate?: (v: string) => true | string
    explicitControl?: boolean
}) {
    const methods = useAsmaForm<TestFormValues>({ defaultValues: { email: '', title: '' } })
    return (
        <FormProvider {...methods}>
            <form onSubmit={(...args) => void methods.handleSubmit(() => undefined)(...args)}>
                <AsmaFieldController<TestFormValues, 'title'>
                    control={explicitControl ? methods.control : undefined}
                    name='title'
                    render={(props) => <FieldInput {...props} label='Title' testId='title' />}
                    rules={{
                        ...(required ? { required: required === true ? 'Required' : required } : {}),
                        ...(validate ? { validate } : {}),
                    }}
                />
                <AsmaFieldController<TestFormValues, 'email'>
                    name='email'
                    render={(props) => <FieldInput {...props} label='Email' testId='email' />}
                    rules={{ required: 'Email required' }}
                />
                <button type='submit'>Save</button>
                <button
                    onClick={() => methods.setValue('title', 'a@b.co', { shouldDirty: true })}
                    type='button'
                >
                    External fix
                </button>
            </form>
        </FormProvider>
    )
}

// Stands in for a rule that is a closure over component state outside the form (the roles and
// offers pickers narrow their own scope): the rule is re-registered as that state changes.
function ModeDependentRuleForm() {
    const methods = useAsmaForm<TestFormValues>({ defaultValues: { email: '', title: '' } })
    const [narrowed, setNarrowed] = useState(false)
    return (
        <FormProvider {...methods}>
            <AsmaFieldController<TestFormValues, 'title'>
                name='title'
                render={(props) => <FieldInput {...props} label='Title' testId='title' />}
                rules={{ validate: () => (narrowed ? 'Pick something' : undefined) }}
            />
            <button onClick={() => setNarrowed(true)} type='button'>
                Narrow
            </button>
            <button onClick={() => void methods.trigger()} type='button'>
                Check
            </button>
        </FormProvider>
    )
}

describe('AsmaFieldController default preset', () => {
    it('REQ-001: empty required field has no error on first paint', async () => {
        render(<TestForm required='Required' />)

        await act(async () => {
            await Promise.resolve()
        })

        expect(screen.queryByRole('alert')).toBeNull()
        expect(screen.getByTestId('title').getAttribute('aria-invalid')).not.toBe('true')
        expect(screen.getByTestId('email').getAttribute('aria-invalid')).not.toBe('true')
    })

    it('REQ-011: blurring an empty optional field shows no error', async () => {
        render(<TestForm validate={(v: string) => (v.length >= 3 ? true : 'Too short')} />)

        fireEvent.blur(screen.getByTestId('title'))

        await act(async () => {
            await Promise.resolve()
        })

        expect(screen.queryByRole('alert')).toBeNull()
        expect(screen.getByTestId('title').getAttribute('aria-invalid')).not.toBe('true')
    })

    it('REQ-011: blurring an empty required field shows an error', async () => {
        render(<TestForm required='This field is required' />)

        fireEvent.blur(screen.getByTestId('title'))

        await waitFor(() => {
            expect(screen.getByRole('alert').textContent).toBe('This field is required')
        })
    })

    it('REQ-011: blurring a whitespace-only optional field shows no error', async () => {
        render(<TestForm validate={(v: string) => (v.includes('@') ? true : 'Invalid email')} />)

        const input = screen.getByTestId('title')
        fireEvent.change(input, { target: { value: '   ' } })
        fireEvent.blur(input)

        await act(async () => {
            await Promise.resolve()
        })

        expect(screen.queryByRole('alert')).toBeNull()
        expect(input.getAttribute('aria-invalid')).not.toBe('true')
    })

    it('REQ-001/002: error appears on blur, clears on change once valid (reward-early)', async () => {
        render(<TestForm required='Required' validate={(v: string) => (v.includes('@') ? true : 'Invalid email')} />)

        const input = screen.getByTestId('title')
        fireEvent.change(input, { target: { value: 'bad' } })
        fireEvent.blur(input)

        await waitFor(() => {
            expect(screen.getByRole('alert').textContent).toBe('Invalid email')
        })

        fireEvent.change(input, { target: { value: 'a@b.co' } })

        await waitFor(() => {
            expect(screen.queryByRole('alert')).toBeNull()
        })
    })

    it('REQ-002: typing an invalid value never raises an error before blur/submit (reward-early only clears)', async () => {
        render(<TestForm required='Required' validate={(v: string) => (v.includes('@') ? true : 'Invalid email')} />)

        const input = screen.getByTestId('title')
        fireEvent.change(input, { target: { value: 'not-an-email' } })

        await act(async () => {
            await Promise.resolve()
        })

        expect(screen.queryByRole('alert')).toBeNull()
        expect(input.getAttribute('aria-invalid')).not.toBe('true')
    })

    it('REQ-002: a value written with setValue also clears a displayed error', async () => {
        render(<TestForm required='Required' validate={(v: string) => (v.includes('@') ? true : 'Invalid email')} />)

        const input = screen.getByTestId('title')
        fireEvent.change(input, { target: { value: 'bad' } })
        fireEvent.blur(input)

        await waitFor(() => {
            expect(screen.getByRole('alert').textContent).toBe('Invalid email')
        })

        fireEvent.click(screen.getByRole('button', { name: 'External fix' }))

        await waitFor(() => {
            expect(screen.queryByRole('alert')).toBeNull()
        })
    })

    it('REQ-010: failed submit focuses the first invalid field', async () => {
        render(<TestForm required='Required' />)

        fireEvent.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(document.activeElement).toBe(screen.getByTestId('title'))
            expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
        })
    })

    it('shows exactly one error message per invalid field (no double Required)', async () => {
        render(<TestForm required='Required' />)

        fireEvent.blur(screen.getByTestId('title'))

        await waitFor(() => {
            expect(screen.getAllByRole('alert')).toHaveLength(1)
            expect(screen.getByRole('alert').textContent).toBe('Required')
        })
    })

    it('validates against the rule as it stands now, not the one registered on first render', async () => {
        render(<ModeDependentRuleForm />)

        fireEvent.click(screen.getByText('Check'))

        await act(async () => {
            await Promise.resolve()
        })
        expect(screen.queryByRole('alert')).toBeNull()

        fireEvent.click(screen.getByText('Narrow'))
        fireEvent.click(screen.getByText('Check'))

        await waitFor(() => {
            expect(screen.getByRole('alert').textContent).toBe('Pick something')
        })
    })

    it('works when control is passed explicitly', async () => {
        render(<TestForm required='This field is required' explicitControl />)

        fireEvent.blur(screen.getByTestId('title'))

        await waitFor(() => {
            expect(screen.getByRole('alert').textContent).toBe('This field is required')
        })
    })

    it('shows the helperText prop when there is no error', () => {
        function HintForm() {
            const methods = useAsmaForm<TestFormValues>({ defaultValues: { email: '', title: '' } })
            return (
                <FormProvider {...methods}>
                    <AsmaFieldController<TestFormValues, 'title'>
                        helperText='Hint'
                        name='title'
                        render={(props) => <FieldInput {...props} label='Title' testId='title' />}
                    />
                </FormProvider>
            )
        }

        render(<HintForm />)

        expect(screen.getByRole('status').textContent).toBe('Hint')
        expect(screen.queryByRole('alert')).toBeNull()
    })

    it('reserves the helper row exactly when the field carries rules', () => {
        const seen: boolean[] = []
        function ReserveForm() {
            const methods = useAsmaForm<TestFormValues>({ defaultValues: { email: '', title: '' } })
            return (
                <FormProvider {...methods}>
                    <AsmaFieldController<TestFormValues, 'title'>
                        name='title'
                        render={({ reserveHelperText, value, onChange, onBlur, ref }) => {
                            seen.push(reserveHelperText)
                            return (
                                <input
                                    data-testid='title'
                                    onBlur={onBlur}
                                    onChange={(event) => onChange(event.target.value)}
                                    ref={ref}
                                    value={value}
                                />
                            )
                        }}
                        rules={{ required: 'Required' }}
                    />
                    <AsmaFieldController<TestFormValues, 'email'>
                        name='email'
                        render={({ reserveHelperText, value, onChange, onBlur, ref }) => {
                            seen.push(reserveHelperText)
                            return (
                                <input
                                    data-testid='email'
                                    onBlur={onBlur}
                                    onChange={(event) => onChange(event.target.value)}
                                    ref={ref}
                                    value={value}
                                />
                            )
                        }}
                    />
                </FormProvider>
            )
        }

        render(<ReserveForm />)

        expect(seen[0]).toBe(true)
        expect(seen[1]).toBe(false)
    })

    it('onAnimationStart is a no-op in the default preset', async () => {
        const methodsRef: { current: UseFormReturn<TestFormValues> | null } = { current: null }
        function CaptureForm() {
            const methods = useAsmaForm<TestFormValues>({ defaultValues: { email: '', title: '' } })
            // eslint-disable-next-line react-hooks/immutability -- test harness: expose the live form handle to assertions
            methodsRef.current = methods
            return (
                <FormProvider {...methods}>
                    <AsmaFieldController<TestFormValues, 'title'>
                        name='title'
                        render={(props) => <FieldInput {...props} label='Title' testId='title' />}
                    />
                </FormProvider>
            )
        }

        render(<CaptureForm />)
        const input = screen.getByTestId<HTMLInputElement>('title')
        input.value = 'a@b.co'

        fireEvent.animationStart(input, { animationName: 'onAutoFillStart' })

        await act(async () => {
            await Promise.resolve()
        })
        expect(methodsRef.current?.getValues('title')).toBe('')
    })

    it('never starts the autofill poll in the default preset', () => {
        const setIntervalSpy = vi.spyOn(globalThis, 'setInterval')

        render(<TestForm required='Required' />)

        expect(setIntervalSpy).not.toHaveBeenCalled()
        setIntervalSpy.mockRestore()
    })

    it('hands the field ref through, so setFocus lands on the input', async () => {
        const methodsRef: { current: UseFormReturn<TestFormValues> | null } = { current: null }
        function CaptureForm() {
            const methods = useAsmaForm<TestFormValues>({ defaultValues: { email: '', title: '' } })
            // eslint-disable-next-line react-hooks/immutability -- test harness: expose the live form handle to assertions
            methodsRef.current = methods
            return (
                <FormProvider {...methods}>
                    <AsmaFieldController<TestFormValues, 'title'>
                        name='title'
                        render={(props) => <FieldInput {...props} label='Title' testId='title' />}
                    />
                </FormProvider>
            )
        }

        render(<CaptureForm />)

        act(() => {
            methodsRef.current?.setFocus('title')
        })

        await waitFor(() => {
            expect(document.activeElement).toBe(screen.getByTestId('title'))
        })
    })
})

describe('AsmaFieldController language re-validation', () => {
    it('re-validates an invalid field when the language changes and leaves pristine fields alone', async () => {
        let language = 'en'
        const { AsmaFieldController: LangFieldController } = createAsmaForms({
            getLanguageCode: () => language,
        })
        const methodsRef: { current: UseFormReturn<TestFormValues> | null } = { current: null }

        function LangForm() {
            const methods = useAsmaForm<TestFormValues>({ defaultValues: { email: '', title: '' } })
            // eslint-disable-next-line react-hooks/immutability -- test harness: expose the live form handle to assertions
            methodsRef.current = methods
            return (
                <FormProvider {...methods}>
                    <LangFieldController<TestFormValues, 'title'>
                        name='title'
                        render={(props) => <FieldInput {...props} label='Title' testId='title' />}
                        rules={{ required: language === 'en' ? 'Required' : 'Påkrevd' }}
                    />
                    <LangFieldController<TestFormValues, 'email'>
                        name='email'
                        render={(props) => <FieldInput {...props} label='Email' testId='email' />}
                        rules={{ required: 'Email required' }}
                    />
                </FormProvider>
            )
        }

        const { rerender } = render(<LangForm />)

        fireEvent.blur(screen.getByTestId('title'))

        await waitFor(() => {
            expect(screen.getByRole('alert').textContent).toBe('Required')
        })

        const triggerSpy = vi.spyOn(methodsRef.current!, 'trigger')
        language = 'nb'
        rerender(<LangForm />)

        await waitFor(() => {
            expect(screen.getByRole('alert').textContent).toBe('Påkrevd')
        })
        expect(triggerSpy).toHaveBeenCalledWith('title')
        expect(triggerSpy).not.toHaveBeenCalledWith('email')
    })
})

describe('AsmaFieldController mount re-trigger (the default for every app)', () => {
    it('a field that mounts over an existing error calls trigger on mount and re-validates the current value', async () => {
        const methodsRef: { current: UseFormReturn<TestFormValues> | null } = { current: null }

        function RemountForm() {
            const methods = useAsmaForm<TestFormValues>({ defaultValues: { email: '', title: '' } })
            // eslint-disable-next-line react-hooks/immutability -- test harness: expose the live form handle to assertions
            methodsRef.current = methods
            const [shown, setShown] = useState(true)
            return (
                <FormProvider {...methods}>
                    {shown ? (
                        <AsmaFieldController<TestFormValues, 'title'>
                            name='title'
                            render={(props) => <FieldInput {...props} label='Title' testId='title' />}
                            rules={{ required: 'Required' }}
                        />
                    ) : null}
                    <button onClick={() => setShown((value) => !value)} type='button'>
                        Toggle
                    </button>
                </FormProvider>
            )
        }

        render(<RemountForm />)

        // Create the error the way the user does (blur an empty required field), so the value that
        // stays invalid is also the value the reward-early effect keeps watching. Writing a valid
        // value with setValue would make reward-early clear the error itself before the unmount.
        fireEvent.blur(screen.getByTestId('title'))
        await act(async () => {
            await Promise.resolve()
        })
        expect(methodsRef.current?.control._formState.errors.title).toBeTruthy()

        fireEvent.click(screen.getByRole('button', { name: 'Toggle' }))
        await act(async () => {
            await Promise.resolve()
        })
        expect(screen.queryByTestId('title')).toBeNull()
        expect(methodsRef.current?.control._formState.errors.title).toBeTruthy()

        const triggerSpy = vi.spyOn(methodsRef.current!, 'trigger')
        fireEvent.click(screen.getByRole('button', { name: 'Toggle' }))

        await act(async () => {
            await Promise.resolve()
        })

        // Both the language effect and the reward-early effect run on mount and re-validate an
        // existing error. Neither may be suppressed: skipping the mount run is chat's former
        // hasMounted crutch, whose root cause is fixed in chat instead.
        expect(triggerSpy).toHaveBeenCalledTimes(2)
        expect(triggerSpy).toHaveBeenCalledWith('title')
        expect(methodsRef.current?.control._formState.errors.title).toBeTruthy()
    })
})

describe('AsmaFieldController requestFocus', () => {
    it('REQ-010: requestFocus callback is invoked when submit focuses a combobox field', async () => {
        const requestFocus = vi.fn()

        function ComboboxForm() {
            const methods = useAsmaForm<{ title: string }>({ defaultValues: { title: '' } })
            return (
                <FormProvider {...methods}>
                    <AsmaFieldController<{ title: string }, 'title'>
                        name='title'
                        render={(props) => (
                            <button
                                data-testid='title'
                                onBlur={props.onBlur}
                                onClick={() => props.onChange('')}
                                type='button'
                            />
                        )}
                        requestFocus={requestFocus}
                        rules={{ required: 'Required' }}
                    />
                    <button onClick={() => void methods.trigger(undefined, { shouldFocus: true })} type='button'>
                        Save
                    </button>
                </FormProvider>
            )
        }

        render(<ComboboxForm />)
        fireEvent.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(requestFocus).toHaveBeenCalledOnce()
        })
    })
})

describe('AsmaFieldController browserAutofill preset', () => {
    interface Values {
        title: string
    }

    function AutofillForm({
        defaultValue = '',
        validate,
    }: {
        defaultValue?: string
        validate?: (v: string) => true | string
    }) {
        const methods = useAsmaForm<Values>({ defaultValues: { title: defaultValue } })
        // eslint-disable-next-line react-hooks/immutability -- test harness: expose the live form handle to assertions
        methodsRef.current = methods
        return (
            <FormProvider {...methods}>
                <AutofillFieldController<Values, 'title'>
                    name='title'
                    render={(props) => <FieldInput {...props} label='Title' testId='title' />}
                    rules={{
                        required: 'Required',
                        ...(validate ? { validate } : {}),
                    }}
                />
                <button
                    onClick={() => {
                        void autofillSubmitChanged<Values>(methods, () => Promise.resolve(undefined))
                    }}
                    type='button'
                >
                    Save
                </button>
            </FormProvider>
        )
    }

    const methodsRef: { current: UseFormReturn<Values> | null } = { current: null }

    it('validates a remembered valid value on mount, so isValid gated submits enable without interaction', async () => {
        render(<AutofillForm defaultValue='a@b.co' validate={(v: string) => (v.includes('@') ? true : 'Invalid email')} />)

        await waitFor(() => {
            expect(methodsRef.current?.formState.isValid).toBe(true)
        })
        expect(screen.queryByRole('alert')).toBeNull()
    })

    it('keeps an error on a remembered invalid value invisible until the field is touched', async () => {
        render(<AutofillForm defaultValue='bad' validate={(v: string) => (v.includes('@') ? true : 'Invalid email')} />)

        await waitFor(() => {
            expect(methodsRef.current?.control._formState.errors.title).toBeTruthy()
        })
        expect(screen.queryByRole('alert')).toBeNull()
        expect(screen.getByTestId('title').getAttribute('aria-invalid')).not.toBe('true')

        fireEvent.blur(screen.getByTestId('title'))

        await waitFor(() => {
            expect(screen.getByRole('alert').textContent).toBe('Invalid email')
        })
    })

    it('does not validate an empty field on mount', async () => {
        render(<AutofillForm />)

        await act(async () => {
            await Promise.resolve()
        })

        expect(methodsRef.current?.control._formState.errors).toEqual({})
    })

    it('polls for autofill, syncs the DOM value and then stops', () => {
        vi.useFakeTimers()
        let matchesCalls = 0
        const matchesSpy = vi.spyOn(HTMLInputElement.prototype, 'matches').mockImplementation(function (selector: string) {
            if (selector !== ':-webkit-autofill') throw new Error(`unexpected selector: ${selector}`)
            matchesCalls += 1
            return matchesCalls >= 3
        })

        render(<AutofillForm />)
        const input = screen.getByTestId<HTMLInputElement>('title')
        input.value = 'saved@x.y'

        for (let tick = 0; tick < 3; tick += 1) {
            act(() => {
                vi.advanceTimersByTime(150)
            })
        }

        expect(methodsRef.current?.getValues('title')).toBe('saved@x.y')
        const callsAfterAutofill = matchesCalls

        for (let tick = 0; tick < 10; tick += 1) {
            act(() => {
                vi.advanceTimersByTime(150)
            })
        }

        expect(matchesCalls).toBe(callsAfterAutofill)
        matchesSpy.mockRestore()
    })

    it('stops polling after 20 attempts when nothing autofills', () => {
        vi.useFakeTimers()
        let matchesCalls = 0
        vi.spyOn(HTMLInputElement.prototype, 'matches').mockImplementation(() => {
            matchesCalls += 1
            return false
        })

        render(<AutofillForm />)

        for (let tick = 0; tick < 20; tick += 1) {
            act(() => {
                vi.advanceTimersByTime(150)
            })
        }
        expect(matchesCalls).toBe(20)

        for (let tick = 0; tick < 10; tick += 1) {
            act(() => {
                vi.advanceTimersByTime(150)
            })
        }
        expect(matchesCalls).toBe(20)
    })

    it('clears the poll when the field unmounts', () => {
        vi.useFakeTimers()
        let matchesCalls = 0
        vi.spyOn(HTMLInputElement.prototype, 'matches').mockImplementation(() => {
            matchesCalls += 1
            return false
        })

        const { unmount } = render(<AutofillForm />)
        for (let tick = 0; tick < 2; tick += 1) {
            act(() => {
                vi.advanceTimersByTime(150)
            })
        }
        const callsBeforeUnmount = matchesCalls

        unmount()
        for (let tick = 0; tick < 10; tick += 1) {
            act(() => {
                vi.advanceTimersByTime(150)
            })
        }

        expect(matchesCalls).toBe(callsBeforeUnmount)
    })

    it('syncs the DOM value on the autofill animation and ignores other animations', async () => {
        // jsdom has no window.AnimationEvent, so React never registers onAnimationStart and the
        // handler is unreachable through a DOM event. Call the render prop directly instead —
        // browsers invoke it through the CSS onAutoFillStart keyframe.
        let renderProps: AsmaFieldRenderProps | null = null
        function CaptureForm() {
            const methods = useAsmaForm<Values>({ defaultValues: { title: '' } })
            // eslint-disable-next-line react-hooks/immutability -- test harness: expose the live form handle to assertions
            methodsRef.current = methods
            return (
                <FormProvider {...methods}>
                    <AutofillFieldController<Values, 'title'>
                        name='title'
                        render={(props) => {
                            // eslint-disable-next-line react-hooks/globals -- test harness: capture the render props for a direct handler call
                            renderProps = props
                            return <FieldInput {...props} label='Title' testId='title' />
                        }}
                    />
                </FormProvider>
            )
        }

        render(<CaptureForm />)
        const input = screen.getByTestId<HTMLInputElement>('title')
        input.value = 'z@z.zz'

        act(() => {
            renderProps?.onAnimationStart({ animationName: 'onAutoFillStart', target: input })
        })

        await waitFor(() => {
            expect(methodsRef.current?.getValues('title')).toBe('z@z.zz')
        })

        input.value = 'w@w.ww'
        act(() => {
            renderProps?.onAnimationStart({ animationName: 'someOtherAnimation', target: input })
        })

        await act(async () => {
            await Promise.resolve()
        })
        expect(methodsRef.current?.getValues('title')).toBe('z@z.zz')
    })

    it('the merged ref keeps RHF setFocus working', async () => {
        render(<AutofillForm />)

        act(() => {
            methodsRef.current?.setFocus('title')
        })

        await waitFor(() => {
            expect(document.activeElement).toBe(screen.getByTestId('title'))
        })
    })

    it('a failed submit through the factory submitChanged touches the fields and shows the errors', async () => {
        render(<AutofillForm />)

        fireEvent.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(screen.getByRole('alert').textContent).toBe('Required')
        })
        expect(methodsRef.current?.getFieldState('title').isTouched).toBe(true)
    })
})
