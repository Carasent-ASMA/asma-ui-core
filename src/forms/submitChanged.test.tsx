/**
 * @vitest-environment jsdom
 */
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react'
import { FormProvider } from 'react-hook-form'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createAsmaForms } from './createAsmaForms'
import { getDirtyValues } from './getDirtyValues'
import { submitChanged } from './submitChanged'
import { useAsmaForm } from './useAsmaForm'

const { AsmaFieldController } = createAsmaForms({ getLanguageCode: () => 'en' })

afterEach(() => {
    cleanup()
})

describe('submitChanged', () => {
    interface EmployeeValues {
        empno: number
        epost: string
        Navn: string
    }

    it('sends only dirty fields to onPatch and re-baselines', async () => {
        const { result } = renderHook(() =>
            useAsmaForm<EmployeeValues>({ defaultValues: { empno: 1, epost: 'a@b.co', Navn: 'Ada' } }),
        )

        expect(result.current.formState.dirtyFields).toEqual({})

        act(() => {
            result.current.setValue('Navn', 'Grace', { shouldDirty: true })
            result.current.setValue('epost', 'g@b.co', { shouldDirty: true })
        })

        expect(result.current.formState.dirtyFields).toEqual({ epost: true, Navn: true })

        const onPatch = vi.fn((dirty: Partial<{ Navn: string; epost: string; empno: number }>) => {
            expect(dirty).toEqual({ epost: 'g@b.co', Navn: 'Grace' })
            expect(dirty).not.toHaveProperty('empno')
            return Promise.resolve({ empno: 1, epost: 'g@b.co', Navn: 'Grace' })
        })

        await act(async () => {
            const ok = await submitChanged<EmployeeValues>(result.current, onPatch)
            expect(ok).toBe(true)
        })

        expect(onPatch).toHaveBeenCalledOnce()
        expect(result.current.formState.isDirty).toBe(false)
    })

    it('re-baselines with the submitted values when onPatch resolves undefined', async () => {
        const { result } = renderHook(() => useAsmaForm<{ Navn: string }>({ defaultValues: { Navn: 'Ada' } }))

        act(() => {
            result.current.setValue('Navn', 'Grace', { shouldDirty: true })
        })

        await act(async () => {
            await submitChanged<{ Navn: string }>(result.current, () => Promise.resolve(undefined))
        })

        expect(result.current.getValues('Navn')).toBe('Grace')
        expect(result.current.formState.isDirty).toBe(false)
    })

    it('MUT guard: only the genuinely dirty field is included, not the untouched complement', () => {
        const values = { empno: 1, epost: 'a@b.co', Navn: 'Ada' }
        const dirtyFields = { Navn: true as const }

        const result = getDirtyValues(dirtyFields, values)

        expect(result).toEqual({ Navn: 'Ada' })
        expect(result).not.toHaveProperty('epost')
        expect(result).not.toHaveProperty('empno')
    })
})

describe('submitChanged without any formState subscription', () => {
    // methods.formState is a render-time proxy: if no rendered component reads dirtyFields
    // (a form of rule-less fields), it serves a stale empty snapshot on the first submit.
    interface FormValues {
        minutes: string
    }

    function BareForm({ onPatch }: { onPatch: (dirty: Partial<FormValues>) => Promise<undefined> }) {
        const methods = useAsmaForm<FormValues>({ defaultValues: { minutes: '10' } })
        return (
            <FormProvider {...methods}>
                <AsmaFieldController<FormValues, 'minutes'>
                    name='minutes'
                    render={(props) => (
                        <input
                            data-testid='minutes'
                            name={props.name}
                            onBlur={props.onBlur}
                            onChange={(event) => props.onChange(event.target.value)}
                            ref={props.ref}
                            value={props.value ?? ''}
                        />
                    )}
                />
                <button onClick={() => void submitChanged<FormValues>(methods, onPatch)} type='button'>
                    Save
                </button>
            </FormProvider>
        )
    }

    it('still sees a field dirtied through the DOM on the very first submit', async () => {
        const onPatch = vi.fn((_dirty: Partial<FormValues>) => Promise.resolve(undefined))
        render(<BareForm onPatch={onPatch} />)

        fireEvent.change(screen.getByTestId('minutes'), { target: { value: '11' } })
        fireEvent.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(onPatch).toHaveBeenCalledOnce()
        })
        expect(onPatch).toHaveBeenCalledWith({ minutes: '11' }, { minutes: '11' })
    })
})

describe('submitChanged focus-on-invalid (REQ-010)', () => {
    interface FormValues {
        title: string
    }

    function TestForm({ onInvalid }: { onInvalid?: () => void }) {
        const methods = useAsmaForm<FormValues>({ defaultValues: { title: '' } })
        return (
            <FormProvider {...methods}>
                <AsmaFieldController<FormValues, 'title'>
                    name='title'
                    render={(props) => (
                        <input
                            data-testid='title'
                            name={props.name}
                            onBlur={props.onBlur}
                            onChange={(event) => props.onChange(event.target.value)}
                            ref={props.ref}
                            value={props.value ?? ''}
                        />
                    )}
                    rules={{ required: 'Required' }}
                />
                <button
                    onClick={() => {
                        void submitChanged<FormValues>(methods, () => Promise.resolve(undefined), onInvalid)
                    }}
                    type='button'
                >
                    Save
                </button>
            </FormProvider>
        )
    }

    it('falls back to trigger(..., { shouldFocus: true }) when no onInvalid is given', async () => {
        render(<TestForm />)

        fireEvent.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(document.activeElement).toBe(screen.getByTestId('title'))
        })
    })

    it('MUT guard: delegates to onInvalid instead of auto-focusing when a callback is provided', async () => {
        const onInvalid = vi.fn()
        render(<TestForm onInvalid={onInvalid} />)

        fireEvent.click(screen.getByRole('button', { name: 'Save' }))

        await waitFor(() => {
            expect(onInvalid).toHaveBeenCalledOnce()
        })
        expect(document.activeElement).not.toBe(screen.getByTestId('title'))
    })
})

describe('submitChanged touchInvalidFields option', () => {
    interface FormValues {
        title: string
    }

    it('touches the errored fields before onInvalid runs', async () => {
        const { result } = renderHook(() => useAsmaForm<FormValues>({ defaultValues: { title: '' } }))

        act(() => {
            result.current.register('title', { required: 'Required' })
        })

        const onInvalid = vi.fn(() => {
            expect(result.current.getFieldState('title').isTouched).toBe(true)
        })

        await act(async () => {
            const ok = await submitChanged<FormValues>(result.current, () => Promise.resolve(undefined), onInvalid, {
                touchInvalidFields: true,
            })
            expect(ok).toBe(false)
        })

        expect(onInvalid).toHaveBeenCalledOnce()
    })

    it('touches the errored fields on the no-onInvalid path too', async () => {
        const { result } = renderHook(() => useAsmaForm<FormValues>({ defaultValues: { title: '' } }))

        act(() => {
            result.current.register('title', { required: 'Required' })
        })

        await act(async () => {
            const ok = await submitChanged<FormValues>(result.current, () => Promise.resolve(undefined), undefined, {
                touchInvalidFields: true,
            })
            expect(ok).toBe(false)
        })

        expect(result.current.getFieldState('title').isTouched).toBe(true)
    })

    it('touches nothing when the option is off', async () => {
        const { result } = renderHook(() => useAsmaForm<FormValues>({ defaultValues: { title: '' } }))

        act(() => {
            result.current.register('title', { required: 'Required' })
        })

        const onInvalid = vi.fn()

        await act(async () => {
            await submitChanged<FormValues>(result.current, () => Promise.resolve(undefined), onInvalid)
        })

        expect(onInvalid).toHaveBeenCalledOnce()
        expect(result.current.getFieldState('title').isTouched).toBe(false)
    })
})
