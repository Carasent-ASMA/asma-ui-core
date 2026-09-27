/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { touchInvalidFields } from './touchInvalidFields'
import { useAsmaForm } from './useAsmaForm'

interface Values {
    title: string
    email: string
}

describe('touchInvalidFields', () => {
    it('touches every top-level errored field', () => {
        const { result } = renderHook(() => useAsmaForm<Values>({ defaultValues: { email: '', title: '' } }))

        act(() => {
            result.current.setError('title', { type: 'required', message: 'Required' })
            result.current.setError('email', { type: 'required', message: 'Email required' })
            touchInvalidFields(result.current)
        })

        expect(result.current.getFieldState('title').isTouched).toBe(true)
        expect(result.current.getFieldState('email').isTouched).toBe(true)
    })

    it('leaves the values and the dirty state unchanged', () => {
        const { result } = renderHook(() => useAsmaForm<Values>({ defaultValues: { email: '', title: 'Ada' } }))

        act(() => {
            result.current.setError('email', { type: 'required', message: 'Email required' })
            touchInvalidFields(result.current)
        })

        expect(result.current.getValues()).toEqual({ email: '', title: 'Ada' })
        expect(result.current.formState.isDirty).toBe(false)
    })

    it('does not validate the touched fields', () => {
        const { result } = renderHook(() => useAsmaForm<Values>({ defaultValues: { email: '', title: '' } }))
        const triggerSpy = vi.spyOn(result.current, 'trigger')

        act(() => {
            result.current.setError('title', { type: 'required', message: 'Required' })
            touchInvalidFields(result.current)
        })

        expect(triggerSpy).not.toHaveBeenCalled()
    })
})
