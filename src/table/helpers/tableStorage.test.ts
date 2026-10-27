import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryStorage } from 'src/test-utils/memoryStorage'
import { readJson, tableStorage } from './tableStorage'

const securityError = () => new DOMException('The operation is insecure.', 'SecurityError')
const quotaError = () => new DOMException('The quota has been exceeded.', 'QuotaExceededError')

describe('tableStorage (ASMA-8597, REQ-007)', () => {
    let storage: ReturnType<typeof installMemoryStorage>
    let output: ReturnType<typeof vi.spyOn>[]

    beforeEach(() => {
        storage = installMemoryStorage()
        output = ['error', 'warn', 'log', 'info'].map((method) => vi.spyOn(console, method as 'log'))
    })

    afterEach(() => {
        storage.restore()
        vi.restoreAllMocks()
    })

    const expectSilent = () => {
        for (const spy of output) expect(spy).not.toHaveBeenCalled()
    }

    it('reads, writes and removes like localStorage', () => {
        tableStorage.set('k', 'v')
        expect(tableStorage.get('k')).toBe('v')
        tableStorage.remove('k')
        expect(tableStorage.get('k')).toBeNull()
        expect(readJson('k')).toBeUndefined()

        storage.data.set('json', '{"a":1}')
        expect(readJson('json')).toEqual({ a: 1 })
        storage.data.set('broken', '{')
        expect(readJson('broken')).toBeUndefined()
        expectSilent()
    })

    it('U-X01: getItem throwing SecurityError gives the default and does not throw (AC 8)', () => {
        vi.spyOn(globalThis.localStorage, 'getItem').mockImplementation(() => {
            throw securityError()
        })

        expect(tableStorage.get('k')).toBeNull()
        expect(readJson('k')).toBeUndefined()
        expectSilent()
    })

    it('U-X02: setItem throwing QuotaExceededError does not throw (AC 8)', () => {
        vi.spyOn(globalThis.localStorage, 'setItem').mockImplementation(() => {
            throw quotaError()
        })

        expect(() => tableStorage.set('k', 'v')).not.toThrow()
        expectSilent()
    })

    it('U-X03: removeItem throwing does not throw', () => {
        vi.spyOn(globalThis.localStorage, 'removeItem').mockImplementation(() => {
            throw securityError()
        })

        expect(() => tableStorage.remove('k')).not.toThrow()
        expectSilent()
    })

    it('U-X04: a localStorage getter that throws does not throw either', () => {
        Object.defineProperty(globalThis, 'localStorage', {
            get() {
                throw securityError()
            },
            configurable: true,
        })

        expect(tableStorage.get('k')).toBeNull()
        expect(() => tableStorage.set('k', 'v')).not.toThrow()
        expect(() => tableStorage.remove('k')).not.toThrow()
        expect(readJson('k')).toBeUndefined()
        expectSilent()
    })
})
