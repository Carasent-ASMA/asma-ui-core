import { describe, expect, it, vi } from 'vitest'
import { resolveSx } from './sx'

describe('resolveSx — flat MUI system shorthand → CSSProperties', () => {
    it('returns an empty object for nullish input', () => {
        expect(resolveSx(undefined)).toEqual({})
        expect(resolveSx(null)).toEqual({})
    })

    it('maps spacing shorthand with the 8px MUI unit', () => {
        expect(resolveSx({ mt: 2, mb: 1 })).toEqual({ marginTop: 16, marginBottom: 8 })
        expect(resolveSx({ p: 3 })).toEqual({ padding: 24 })
        expect(resolveSx({ px: 2, py: 1 })).toEqual({
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 8,
            paddingBottom: 8,
        })
        expect(resolveSx({ mx: 'auto' })).toEqual({ marginLeft: 'auto', marginRight: 'auto' })
    })

    it('passes string spacing values through untouched', () => {
        expect(resolveSx({ mt: '10px', width: '50%' })).toEqual({ marginTop: '10px', width: '50%' })
    })

    it('maps the common non-spacing aliases', () => {
        expect(resolveSx({ bgcolor: 'red', color: 'blue' })).toEqual({ backgroundColor: 'red', color: 'blue' })
        expect(resolveSx({ maxWidth: 130, minWidth: 130, width: 130 })).toEqual({
            maxWidth: 130,
            minWidth: 130,
            width: 130,
        })
    })

    it('passes through already-valid CSS properties verbatim', () => {
        expect(resolveSx({ display: 'flex', borderRadius: 4 })).toEqual({ display: 'flex', borderRadius: 4 })
    })

    it('merges an array of sx objects left-to-right', () => {
        expect(resolveSx([{ mt: 1 }, { mt: 2, mb: 1 }])).toEqual({ marginTop: 16, marginBottom: 8 })
    })

    it('drops nested-selector keys and warns once', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(vi.fn())
        expect(resolveSx({ mt: 1, '&:hover': { color: 'red' } })).toEqual({ marginTop: 8 })
        expect(warn).toHaveBeenCalledOnce()
        warn.mockRestore()
    })

    it('ignores function-valued sx (theme callbacks) gracefully', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(vi.fn())
        expect(resolveSx(() => ({ mt: 1 }))).toEqual({})
        warn.mockRestore()
    })
})
