import { afterEach, describe, expect, it, vi } from 'vitest'
import { getUiCoreLocale, setUiCoreLocale } from './uiCoreLocale'

afterEach(() => {
    vi.unstubAllGlobals()
    setUiCoreLocale(undefined)
})

describe('getUiCoreLocale', () => {
    it('uses the document language when storage is blocked', () => {
        vi.stubGlobal('document', { documentElement: { lang: 'en-GB' } })
        vi.stubGlobal('localStorage', {
            getItem: () => {
                throw new DOMException('Storage blocked', 'SecurityError')
            },
        })

        expect(getUiCoreLocale()).toBe('en')
    })

    it('prefers a stored language over the document language', () => {
        vi.stubGlobal('document', { documentElement: { lang: 'en' } })
        vi.stubGlobal('localStorage', { getItem: () => 'no' })

        expect(getUiCoreLocale()).toBe('no')
    })
})
