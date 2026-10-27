import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { installMemoryStorage } from 'src/test-utils/memoryStorage'
import {
    getSortingStorageKey,
    readPersistedSorting,
    readSortingFromStorage,
    sanitizeSorting,
    serializeSorting,
    type SortingRules,
} from './usePersistedSorting'

const rules: SortingRules = {
    sortableColumns: [
        { id: 'name', canMultiSort: true },
        { id: 'role', canMultiSort: true },
        { id: 'age', canMultiSort: true },
    ],
}
const ids = ['name', 'role', 'age']
const saved = (sorting: unknown, v: unknown = 1): unknown => ({ v, sorting })

describe('sanitizeSorting (ASMA-8597)', () => {
    it('U-S03: a wrong shape gives undefined', () => {
        for (const raw of [[], null, 42, 'text', true, {}, { v: 1 }, { sorting: [] }, { v: 1, sorting: 'name' }]) {
            expect(sanitizeSorting(raw, rules), JSON.stringify(raw)).toBeUndefined()
        }
    })

    it('U-S04: an unknown version gives undefined', () => {
        expect(sanitizeSorting(saved([{ id: 'name', desc: false }], 2), rules)).toBeUndefined()
        expect(sanitizeSorting(saved([{ id: 'name', desc: false }], '1'), rules)).toBeUndefined()
        expect(sanitizeSorting({ sorting: [{ id: 'name', desc: false }] }, rules)).toBeUndefined()
    })

    it('U-S05: an unknown column is dropped and the rest keeps its order', () => {
        expect(
            sanitizeSorting(
                saved([
                    { id: 'role', desc: true },
                    { id: 'removed', desc: false },
                    { id: 'name', desc: false },
                ]),
                rules,
            ),
        ).toEqual([
            { id: 'role', desc: true },
            { id: 'name', desc: false },
        ])
    })

    it('U-S06: a column that cannot sort is dropped', () => {
        const partial: SortingRules = { sortableColumns: [{ id: 'name', canMultiSort: true }] }

        expect(
            sanitizeSorting(
                saved([
                    { id: 'notes', desc: false },
                    { id: 'name', desc: true },
                ]),
                partial,
            ),
        ).toEqual([{ id: 'name', desc: true }])
        expect(sanitizeSorting(saved([{ id: 'notes', desc: false }]), partial)).toBeUndefined()
    })

    it('U-S07: a non-string id, a non-boolean direction and a duplicate id are dropped', () => {
        expect(
            sanitizeSorting(
                saved([
                    { id: 1, desc: false },
                    { id: 'name', desc: 'true' },
                    { id: 'name', desc: 1 },
                    null,
                    'role',
                    { id: 'role', desc: false },
                    { id: 'role', desc: true },
                    { id: 'age', desc: true, extra: 'x' },
                ]),
                rules,
            ),
        ).toEqual([
            { id: 'role', desc: false },
            { id: 'age', desc: true },
        ])
    })

    it('U-S08: several columns keep their order and directions when multi-sort is allowed (AC 3)', () => {
        const sorting = [
            { id: 'age', desc: true },
            { id: 'name', desc: false },
            { id: 'role', desc: true },
        ]

        expect(sanitizeSorting(saved(sorting), rules)).toEqual(sorting)
    })

    it('U-S09: multi-sort off keeps the first valid entry only; maxMultiSortColCount truncates', () => {
        const sorting = [
            { id: 'removed', desc: false },
            { id: 'role', desc: true },
            { id: 'name', desc: false },
            { id: 'age', desc: false },
        ]

        expect(sanitizeSorting(saved(sorting), { ...rules, enableMultiSort: false })).toEqual([
            { id: 'role', desc: true },
        ])
        expect(sanitizeSorting(saved(sorting), { ...rules, maxMultiSortColCount: 2 })).toEqual([
            { id: 'role', desc: true },
            { id: 'name', desc: false },
        ])
        // A later column that cannot multi-sort is dropped (`name`); the first one may stand alone, and a later
        // one that can multi-sort (`age`) stays.
        expect(
            sanitizeSorting(saved(sorting), {
                sortableColumns: [
                    { id: 'role', canMultiSort: false },
                    { id: 'name', canMultiSort: false },
                    { id: 'age', canMultiSort: true },
                ],
            }),
        ).toEqual([
            { id: 'role', desc: true },
            { id: 'age', desc: false },
        ])
    })

    it('U-S10: a saved empty list is a real answer: unsorted, not the default', () => {
        expect(sanitizeSorting(saved([]), rules)).toEqual([])
    })

    it('treats a list with no valid entry as nothing saved, so the default applies', () => {
        expect(sanitizeSorting(saved([{ id: 'removed', desc: false }]), rules)).toBeUndefined()
    })
})

describe('serializeSorting (ASMA-8597)', () => {
    it('U-S14: writes exactly {"v":1,"sorting":[{"id","desc"}]} and nothing else', () => {
        const parsed = JSON.parse(
            serializeSorting([
                { id: 'name', desc: false, extra: 'leak' } as never,
                { id: 'age', desc: true },
            ]),
        ) as Record<string, unknown>

        expect(Object.keys(parsed).sort()).toEqual(['sorting', 'v'])
        expect(parsed['v']).toBe(1)
        expect(parsed['sorting']).toEqual([
            { id: 'name', desc: false },
            { id: 'age', desc: true },
        ])
        for (const entry of parsed['sorting'] as Record<string, unknown>[]) {
            expect(Object.keys(entry).sort()).toEqual(['desc', 'id'])
        }
    })
})

describe('readPersistedSorting (ASMA-8597)', () => {
    let storage: ReturnType<typeof installMemoryStorage>

    beforeEach(() => {
        storage = installMemoryStorage()
    })

    afterEach(() => {
        storage.restore()
        vi.restoreAllMocks()
    })

    it('keys the entry as ${uniqueKey}:sorting', () => {
        expect(getSortingStorageKey('table-a')).toBe('table-a:sorting')
        expect(getSortingStorageKey(undefined)).toBeUndefined()
        expect(getSortingStorageKey('')).toBeUndefined()
    })

    it('U-S01: no entry gives undefined, so the app default applies', () => {
        expect(readPersistedSorting('table-a', { sortableColumnIds: ids })).toBeUndefined()
    })

    it('U-S02: invalid JSON gives undefined, with no throw and no console output', () => {
        const output = ['error', 'warn', 'log'].map((method) => vi.spyOn(console, method as 'log'))
        storage.data.set('table-a:sorting', '{')

        expect(readPersistedSorting('table-a', { sortableColumnIds: ids })).toBeUndefined()
        for (const spy of output) expect(spy).not.toHaveBeenCalled()
    })

    it('U-E01: validates against the sortable column ids it is given', () => {
        storage.data.set(
            'table-a:sorting',
            serializeSorting([
                { id: 'name', desc: true },
                { id: 'age', desc: false },
            ]),
        )

        expect(readPersistedSorting('table-a', { sortableColumnIds: ['age', 'role'] })).toEqual([
            { id: 'age', desc: false },
        ])
        expect(readPersistedSorting('table-a', { sortableColumnIds: ids, enableMultiSort: false })).toEqual([
            { id: 'name', desc: true },
        ])
        expect(readPersistedSorting('table-a', { sortableColumnIds: ids })).toEqual([
            { id: 'name', desc: true },
            { id: 'age', desc: false },
        ])
    })

    it('reads nothing for a table without a key, and never touches storage then', () => {
        const getItem = vi.spyOn(globalThis.localStorage, 'getItem')

        expect(readPersistedSorting(undefined, { sortableColumnIds: ids })).toBeUndefined()
        expect(readSortingFromStorage('', rules)).toBeUndefined()
        expect(getItem).not.toHaveBeenCalled()
    })

    it("does not read another table's entry", () => {
        storage.data.set('table-b:sorting', serializeSorting([{ id: 'name', desc: true }]))

        expect(readPersistedSorting('table-a', { sortableColumnIds: ids })).toBeUndefined()
    })
})
