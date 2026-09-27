/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useAsmaForm } from './useAsmaForm'

interface ControlWithOptions {
    _options: {
        mode?: string
        reValidateMode?: string
        criteriaMode?: string
        shouldFocusError?: boolean
    }
}

describe('useAsmaForm', () => {
    it('pins mode, reValidateMode, criteriaMode and shouldFocusError over the caller values', () => {
        const { result } = renderHook(() =>
            useAsmaForm<{ name: string }>({
                defaultValues: { name: '' },
                mode: 'onChange',
                reValidateMode: 'onBlur',
                criteriaMode: 'firstError',
                shouldFocusError: false,
            }),
        )

        const { _options: options }: ControlWithOptions = result.current.control

        expect(options.mode).toBe('onBlur')
        expect(options.reValidateMode).toBe('onSubmit')
        expect(options.criteriaMode).toBe('all')
        expect(options.shouldFocusError).toBe(true)
    })

    it('passes defaultValues through', () => {
        const { result } = renderHook(() => useAsmaForm<{ name: string }>({ defaultValues: { name: 'Ada' } }))

        expect(result.current.getValues('name')).toBe('Ada')
    })
})
