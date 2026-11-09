import {
    createTable,
    getCoreRowModel,
    getSortedRowModel,
    type ColumnDef,
    type SortingState,
    type Table,
} from '@tanstack/react-table'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    STYLED_DEFAULT_SORTING_FN,
    compareSortValues,
    createStyledDefaultSortingFn,
    getSortCollator,
    isEmptySortValue,
    resolveSortUndefinedDefaults,
} from './defaultSortingFn'

/**
 * The default sort comparison (ASMA-8597, P2f, DEC-SORTFN; U-SF01 to U-SF08, U-SF11 to U-SF13). The value rules run on the
 * comparison directly; the empty-cell rules run through a real TanStack table, because they depend on the flips TanStack
 * applies after the function (descending, `invertSorting`). Wiring into `StyledTable` (U-SF09, U-SF10) is in
 * `StyledTable.defaultSort.interaction.test.tsx`.
 */

interface Row {
    id: string
    value?: unknown
    other?: unknown
}

const compare = (a: unknown, b: unknown, locale: 'no' | 'en' = 'no'): number =>
    compareSortValues(a, b, getSortCollator(locale))

/** Builds a real table the way `useStyledTable` configures one: the function reads its direction from this table. */
const buildTable = (
    rows: Row[],
    {
        sorting,
        locale = 'no',
        columns,
    }: { sorting: SortingState; locale?: 'no' | 'en'; columns?: ColumnDef<Row>[] },
): Table<Row> => {
    // eslint-disable-next-line prefer-const -- the function below needs the table, which needs the function
    let table: Table<Row>
    const styledDefault = createStyledDefaultSortingFn<Row>(() => table)
    table = createTable<Row>({
        // The columns the way `useStyledTable` hands them to TanStack: `sortUndefined: false` on those that use the default.
        columns: resolveSortUndefinedDefaults(
            columns ?? [
                { id: 'value', accessorFn: (row) => row.value },
                { id: 'other', accessorFn: (row) => row.other },
            ],
        ),
        data: rows,
        state: {},
        onStateChange: () => undefined,
        renderFallbackValue: null,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        defaultColumn: { sortingFn: STYLED_DEFAULT_SORTING_FN },
        sortingFns: { styledDefault },
        meta: { locale },
    })
    table.setOptions((previous) => ({ ...previous, state: { ...table.initialState, sorting } }))

    return table
}

const orderOf = (table: Table<Row>): string[] => table.getSortedRowModel().rows.map((row) => row.original.id)

const sortValues = (values: unknown[], desc = false, locale: 'no' | 'en' = 'no'): unknown[] => {
    const rows = values.map((value, index) => ({ id: String(index), value }))
    const sorted = orderOf(buildTable(rows, { sorting: [{ id: 'value', desc }], locale }))

    return sorted.map((id) => rows[Number(id)]!.value)
}

afterEach(() => vi.restoreAllMocks())

describe('text (U-SF01, U-SF02, U-SF03, U-SF07, U-SF08)', () => {
    it('U-SF01: in Norwegian, anne, Zara, Ærlig, Øyvind, Åse sort in that order (æ < ø < å after z)', () => {
        expect(sortValues(['Åse', 'Ærlig', 'Zara', 'Øyvind', 'anne'])).toEqual(['anne', 'Zara', 'Ærlig', 'Øyvind', 'Åse'])
        expect(sortValues(['Åse', 'Ærlig', 'Zara', 'Øyvind', 'anne'], true)).toEqual([
            'Åse',
            'Øyvind',
            'Ærlig',
            'Zara',
            'anne',
        ])
    })

    it('U-SF02: case-only and accent-only differences tie', () => {
        expect(compare('ole', 'Ole')).toBe(0)
        expect(compare('e', 'é')).toBe(0)
        // A tie keeps the data order, in both directions and in a table of 10 rows or fewer.
        expect(sortValues(['Ole', 'ole', 'OLE'])).toEqual(['Ole', 'ole', 'OLE'])
        expect(sortValues(['Ole', 'ole', 'OLE'], true)).toEqual(['Ole', 'ole', 'OLE'])
    })

    it('U-SF03: digit runs compare as numbers', () => {
        expect(compare('svc-9', 'svc-10')).toBeLessThan(0)
        expect(compare('svc-10', 'svc-9')).toBeGreaterThan(0)
        expect(sortValues(['svc-10', 'svc-9', 'svc-100', 'svc-1'])).toEqual(['svc-1', 'svc-9', 'svc-10', 'svc-100'])
    })

    it('U-SF07: two different types compare as text, the same way every time', () => {
        // Numeric collation: 5 and "5" are the same text, "a" comes after a digit.
        expect(compare(5, '5')).toBe(0)
        expect(compare(5, 'a')).toBeLessThan(0)
        expect(compare('a', 5)).toBeGreaterThan(0)
        expect(compare(true, 'true')).toBe(0)
        expect(compare(new Date(0), 'x')).toBe(compare(new Date(0), 'x'))
        expect(compare({ a: 1 }, 'x')).toBe(compare({ a: 1 }, 'x'))
        expect(sortValues(['b', 2, true, 'a', 10])).toEqual(sortValues(['b', 2, true, 'a', 10]))
    })

    it('U-SF08: the locale is read: English and Norwegian order å, æ and ø differently', () => {
        const names = ['Øst', 'Ås', 'Bravo']

        expect(sortValues(names, false, 'no')).toEqual(['Bravo', 'Øst', 'Ås'])
        expect(sortValues(names, false, 'en')).toEqual(['Ås', 'Bravo', 'Øst'])
    })
})

describe('ISO date strings (U-SF04)', () => {
    it('compare by time: a fraction of .5 is after .123 in the same second', () => {
        expect(compare('2026-10-30T10:00:00.5Z', '2026-10-30T10:00:00.123Z')).toBeGreaterThan(0)
        expect(compare('2026-10-30T10:00:00.123Z', '2026-10-30T10:00:00.5Z')).toBeLessThan(0)
        expect(compare('2026-10-30T10:00:00.50Z', '2026-10-30T10:00:00.5Z')).toBe(0)
    })

    it('compare by time across offsets: +01:00 against Z', () => {
        expect(compare('2026-10-30T11:00:00+01:00', '2026-10-30T10:00:00Z')).toBe(0)
        expect(compare('2026-10-30T10:30:00+01:00', '2026-10-30T10:00:00Z')).toBeLessThan(0)
        expect(compare('2026-10-30T09:30:00-01:00', '2026-10-30T10:00:00Z')).toBeGreaterThan(0)
    })

    it('compare date-only strings, and a date-only string against a date-time', () => {
        expect(compare('2026-10-29', '2026-10-30')).toBeLessThan(0)
        expect(compare('2026-10-30', '2026-10-30T00:00:00Z')).toBe(0)
        expect(compare('2026-10-30', '2026-10-30T00:00:01Z')).toBeLessThan(0)
    })

    it('treat an impossible calendar date as text, not as the day it rolls over to (audit round 1, fix 2)', () => {
        // 30 February would roll over to 2 March (a later day than 1 March); as text it sorts before it.
        expect(compare('2026-02-30', '2026-03-01')).toBeLessThan(0)
        // 31 April would roll over to 1 May, which is not the same moment as 1 May 2026.
        expect(compare('2026-04-31', '2026-05-01')).toBeLessThan(0)
        expect(compare('2026-02-29', '2026-02-29T00:00:00Z')).not.toBe(0)
        expect(compare('1900-02-29', '1900-02-29T00:00:00Z')).not.toBe(0)
        expect(compare('2026-04-31T10:00:00Z', '2026-05-01T10:00:00Z')).toBeLessThan(0)
        expect(compare('2026-00-10', '2026-00-10T00:00:00Z')).not.toBe(0)
    })

    it('treat a real calendar date as a time, leap days included', () => {
        expect(compare('2024-02-29', '2024-02-29T00:00:00Z')).toBe(0)
        expect(compare('2000-02-29', '2000-02-29T00:00:00Z')).toBe(0)
        expect(compare('2026-04-30', '2026-04-30T00:00:00Z')).toBe(0)
        expect(compare('2024-02-29', '2024-03-01')).toBeLessThan(0)
        expect(compare('2026-12-31T23:59:59Z', '2027-01-01T00:00:00Z')).toBeLessThan(0)
    })

    it('are not compared as text: a string that only looks like a date falls back to text', () => {
        // 13 is not a month: not a date, so these are two names that happen to start with digits.
        expect(compare('2026-13-45', '2026-13-5')).toBeGreaterThan(0)
        // One date and one name: text, not time.
        expect(compare('2026-10-30', 'zebra')).toBeLessThan(0)
    })
})

describe('numbers, Dates and booleans (U-SF05)', () => {
    it('compare by value', () => {
        expect(compare(2, 10)).toBeLessThan(0)
        expect(compare(10, 2)).toBeGreaterThan(0)
        expect(compare(-1, 1)).toBeLessThan(0)
        expect(compare(Infinity, 1)).toBeGreaterThan(0)
        expect(compare(new Date('2026-01-01'), new Date('2026-01-02'))).toBeLessThan(0)
        expect(compare(false, true)).toBeLessThan(0)
        expect(compare(true, false)).toBeGreaterThan(0)
    })

    it('tie when equal: two equal Dates are not "less than" each other', () => {
        expect(compare(3, 3)).toBe(0)
        expect(compare(new Date(1000), new Date(1000))).toBe(0)
        expect(compare(true, true)).toBe(0)
        expect(sortValues([new Date(1000), new Date(1000), new Date(1000)]).length).toBe(3)

        const rows = [1, 2, 3].map((id) => ({ id: String(id), value: new Date(1000) }))

        expect(orderOf(buildTable(rows, { sorting: [{ id: 'value', desc: false }] }))).toEqual(['1', '2', '3'])
        expect(orderOf(buildTable(rows, { sorting: [{ id: 'value', desc: true }] }))).toEqual(['1', '2', '3'])
    })
})

describe('empty cells (U-SF06)', () => {
    const empties: [string, unknown][] = [
        ['undefined', undefined],
        ['null', null],
        ['an empty string', ''],
        ['whitespace', '   '],
        ['NaN', NaN],
        ['an invalid Date', new Date('nope')],
    ]
    const values: [string, unknown][] = [
        ['text', 'beta'],
        ['an ISO string', '2026-10-30T10:00:00Z'],
        ['a number', 7],
        ['a Date', new Date('2026-01-01')],
        ['a boolean', true],
    ]

    it('knows what is empty, and that 0, false and a zero Date are not', () => {
        for (const [, value] of empties) expect(isEmptySortValue(value)).toBe(true)
        for (const value of [0, false, 'a', ' a ', new Date(0), -1, Infinity]) expect(isEmptySortValue(value)).toBe(false)
    })

    const cases = empties.flatMap(([emptyName, empty]) =>
        values.map(([valueName, value]) => ({ emptyName, empty, valueName, value })),
    )

    it.each(cases)('puts $emptyName last against $valueName in both directions', ({ empty, value }) => {
        const rows: Row[] = [
            { id: 'empty', value: empty },
            { id: 'first', value },
            { id: 'second', value },
        ]

        expect(orderOf(buildTable(rows, { sorting: [{ id: 'value', desc: false }] }))).toEqual(['first', 'second', 'empty'])
        expect(orderOf(buildTable(rows, { sorting: [{ id: 'value', desc: true }] }))).toEqual(['first', 'second', 'empty'])
    })

    it('puts every kind of empty last, in the data order among themselves, and sorts the rest', () => {
        const rows: Row[] = [
            { id: 'u', value: undefined },
            { id: 'b', value: 'b' },
            { id: 'n', value: null },
            { id: 'a', value: 'a' },
            { id: 'e', value: '' },
            { id: 'w', value: '  ' },
            { id: 'nan', value: NaN },
            { id: 'c', value: 'c' },
        ]

        expect(orderOf(buildTable(rows, { sorting: [{ id: 'value', desc: false }] }))).toEqual([
            'a',
            'b',
            'c',
            'u',
            'n',
            'e',
            'w',
            'nan',
        ])
        expect(orderOf(buildTable(rows, { sorting: [{ id: 'value', desc: true }] }))).toEqual([
            'c',
            'b',
            'a',
            'u',
            'n',
            'e',
            'w',
            'nan',
        ])
    })

    it('returns 0 for two empty cells', () => {
        const rows: Row[] = [
            { id: 'one', value: undefined },
            { id: 'two', value: null },
        ]
        const table = buildTable(rows, { sorting: [{ id: 'value', desc: true }] })
        const fn = table.getColumn('value')!.getSortingFn()
        const [one, two] = table.getRowModel().rows

        expect(fn(one!, two!, 'value')).toBe(0)
        expect(fn(two!, one!, 'value')).toBe(0)
    })

    it('reads the direction live: the same table sorts the other way round after a state change', () => {
        const rows: Row[] = [
            { id: 'empty', value: undefined },
            { id: 'a', value: 'a' },
            { id: 'b', value: 'b' },
        ]
        const table = buildTable(rows, { sorting: [{ id: 'value', desc: false }] })

        expect(orderOf(table)).toEqual(['a', 'b', 'empty'])

        table.setOptions((previous) => ({ ...previous, state: { ...previous.state, sorting: [{ id: 'value', desc: true }] } }))

        expect(orderOf(table)).toEqual(['b', 'a', 'empty'])
    })
})

describe('several sorted columns (U-SF12)', () => {
    it('applies the empties rule to each column in its own direction', () => {
        // `value` descending, then `other` ascending to break ties; each has its own empty cells.
        const rows: Row[] = [
            { id: 'r1', value: 'b', other: undefined },
            { id: 'r2', value: 'b', other: 'z' },
            { id: 'r3', value: 'b', other: 'a' },
            { id: 'r4', value: undefined, other: 'a' },
            { id: 'r5', value: 'a', other: null },
        ]

        expect(
            orderOf(
                buildTable(rows, {
                    sorting: [
                        { id: 'value', desc: true },
                        { id: 'other', desc: false },
                    ],
                }),
            ),
        ).toEqual(['r3', 'r2', 'r1', 'r5', 'r4'])
        // The first column ascending, the second descending: its empties are still last.
        expect(
            orderOf(
                buildTable(rows, {
                    sorting: [
                        { id: 'value', desc: false },
                        { id: 'other', desc: true },
                    ],
                }),
            ),
        ).toEqual(['r5', 'r2', 'r3', 'r1', 'r4'])
    })

    it('does not take the direction of the first sorted column for the second', () => {
        const rows: Row[] = [
            { id: 'r1', value: 'x', other: undefined },
            { id: 'r2', value: 'x', other: 'a' },
        ]

        // The first column descending would flip a first-entry direction; the second is ascending and keeps `a` first.
        expect(
            orderOf(
                buildTable(rows, {
                    sorting: [
                        { id: 'value', desc: true },
                        { id: 'other', desc: false },
                    ],
                }),
            ),
        ).toEqual(['r2', 'r1'])
    })
})

describe('invertSorting (U-SF13)', () => {
    const invertedColumns: ColumnDef<Row>[] = [{ id: 'value', accessorFn: (row) => row.value, invertSorting: true }]

    it('still puts empty cells last, in both directions', () => {
        const rows: Row[] = [
            { id: 'empty', value: undefined },
            { id: 'null', value: null },
            { id: 'a', value: 'a' },
            { id: 'b', value: 'b' },
        ]

        // `invertSorting` flips the order of the values (a score where a lower number ranks higher), not where empties go.
        expect(orderOf(buildTable(rows, { sorting: [{ id: 'value', desc: false }], columns: invertedColumns }))).toEqual([
            'b',
            'a',
            'empty',
            'null',
        ])
        expect(orderOf(buildTable(rows, { sorting: [{ id: 'value', desc: true }], columns: invertedColumns }))).toEqual([
            'a',
            'b',
            'empty',
            'null',
        ])
    })
})

describe('the collator (U-SF11)', () => {
    it('is created once per locale', () => {
        const RealCollator = Intl.Collator
        let constructed = 0
        vi.spyOn(Intl, 'Collator').mockImplementation(function (...args: ConstructorParameters<typeof Intl.Collator>) {
            constructed += 1

            return new RealCollator(...args)
        })

        // A locale no other test uses, so the cache starts empty for it.
        const first = getSortCollator('sv')
        const second = getSortCollator('sv')
        for (let index = 0; index < 50; index += 1) compareSortValues(`a${index}`, 'b', getSortCollator('sv'))

        expect(second).toBe(first)
        expect(constructed).toBe(1)
        expect(getSortCollator('no')).toBe(getSortCollator('no'))
        expect(getSortCollator('no')).not.toBe(getSortCollator('en'))
    })

    it('maps no to nb and compares with numeric, base sensitivity', () => {
        const options = getSortCollator('no').resolvedOptions()

        expect(options.locale).toBe('nb')
        expect(options.numeric).toBe(true)
        expect(options.sensitivity).toBe('base')
    })
})

describe('where sortUndefined: false is set (audit round 1, fix 1)', () => {
    const own = () => 0
    const sortUndefinedOf = (columns: Parameters<typeof resolveSortUndefinedDefaults>[0], defaultColumn?: Parameters<typeof resolveSortUndefinedDefaults>[1]) =>
        resolveSortUndefinedDefaults(columns, defaultColumn).map((column) => (column as { sortUndefined?: unknown }).sortUndefined)

    it('sets it on a column that uses the default comparison, and on one that names styledDefault', () => {
        expect(sortUndefinedOf([{}, { sortingFn: STYLED_DEFAULT_SORTING_FN }])).toEqual([false, false])
        expect(sortUndefinedOf([{}], { sortingFn: STYLED_DEFAULT_SORTING_FN })).toEqual([false])
    })

    it('leaves a column with its own sortingFn alone, a function or a name, "auto" included', () => {
        expect(sortUndefinedOf([{ sortingFn: own }, { sortingFn: 'auto' }, { sortingFn: 'alphanumeric' }])).toEqual([
            undefined,
            undefined,
            undefined,
        ])
    })

    it("leaves every column alone when the app's defaultColumn names another sortingFn, unless a column names styledDefault", () => {
        expect(sortUndefinedOf([{}, { sortingFn: own }], { sortingFn: 'basic' })).toEqual([undefined, undefined])
        expect(sortUndefinedOf([{ sortingFn: STYLED_DEFAULT_SORTING_FN }], { sortingFn: 'basic' })).toEqual([false])
    })

    it("treats an app defaultColumn.sortingFn of null as unset, the way the table's default column does", () => {
        expect(sortUndefinedOf([{}], { sortingFn: null })).toEqual([false])
        expect(sortUndefinedOf([{ sortingFn: null }], { sortingFn: null })).toEqual([false])
        expect(sortUndefinedOf([{ sortingFn: own }], { sortingFn: null })).toEqual([undefined])
    })

    it("keeps a column's own sortUndefined when it also has its own sortingFn", () => {
        expect(sortUndefinedOf([{ sortingFn: own, sortUndefined: 'first' }, { sortingFn: own, sortUndefined: 1 }])).toEqual([
            'first',
            1,
        ])
    })

    it("leaves every column alone when the app's defaultColumn.sortingFn is 'auto', unless a column names styledDefault", () => {
        expect(sortUndefinedOf([{}, { sortingFn: own }], { sortingFn: 'auto' })).toEqual([undefined, undefined])
        expect(sortUndefinedOf([{ sortingFn: STYLED_DEFAULT_SORTING_FN }], { sortingFn: 'auto' })).toEqual([false])
    })

    it('keeps a sortUndefined the column or the app sets', () => {
        expect(sortUndefinedOf([{ sortUndefined: 'first' }, { sortUndefined: 1 }, { sortUndefined: false }])).toEqual([
            'first',
            1,
            false,
        ])
        expect(sortUndefinedOf([{}], { sortUndefined: 'last' })).toEqual([undefined])
    })

    it('walks into group columns and treats their leaves the same way', () => {
        const [group] = resolveSortUndefinedDefaults([
            { columns: [{}, { sortingFn: own }, { columns: [{}, { sortUndefined: 'first' }] }] },
        ])
        const leaves = (group as { columns: { sortUndefined?: unknown; columns?: { sortUndefined?: unknown }[] }[] }).columns

        expect(leaves[0]!.sortUndefined).toBe(false)
        expect(leaves[1]!.sortUndefined).toBeUndefined()
        expect(leaves[2]!.columns!.map((leaf) => leaf.sortUndefined)).toEqual([false, 'first'])
        expect((group as { sortUndefined?: unknown }).sortUndefined).toBeUndefined()
    })

    it('does not change the definitions it is given', () => {
        const column = {}
        const result = resolveSortUndefinedDefaults([column])

        expect(column).toEqual({})
        expect(result[0]).not.toBe(column)
    })
})
