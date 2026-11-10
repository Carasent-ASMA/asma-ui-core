import { useEffect, useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ColumnDef, Table } from '@tanstack/react-table'
import { expect, userEvent, waitFor } from 'storybook/test'

import { StyledTable } from '../components/StyledTableIndex'

/**
 * ASMA-8597, P2f (UX round 5, D21, D22, DEC-SORTFN): the comparison every column sorts with unless it names its own
 * `sortingFn`. These stories pin what a user sees; the comparison itself is unit-tested in
 * `helpers/defaultSortingFn.test.ts`. Fake data.
 */

interface Entry {
    id: string
    name: string
    score?: number | null
    note?: string | null
    updated?: Date | string | null
    written?: string
}

const headerOf = (canvasElement: HTMLElement, label: string): HTMLElement =>
    Array.from(canvasElement.querySelectorAll<HTMLElement>('th')).find((cell) => cell.textContent?.trim() === label)!
const clickHeader = async (canvasElement: HTMLElement, label: string): Promise<void> => {
    await userEvent.click(headerOf(canvasElement, label).querySelector<HTMLElement>('[role="button"]')!)
}
/** The first column of each body row, in the order shown. */
const bodyNames = (canvasElement: HTMLElement): string[] =>
    Array.from(canvasElement.querySelectorAll<HTMLElement>('tbody tr')).map(
        (row) => row.querySelector('td')?.textContent ?? '',
    )
/** `2026-10-30 10:00 UTC`: short enough for a narrow column, and the same wherever the story runs. */
const formatWhen = (value: Entry['updated']): string =>
    value instanceof Date ? `${value.toISOString().slice(0, 16).replace('T', ' ')} UTC` : (value ?? '')
const clearStorage = () => {
    localStorage.clear()
    return {}
}

const meta = {
    title: 'Table/Default sort',
    component: StyledTable,
    args: { columns: [], data: [] },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof StyledTable>

export default meta
type Story = StoryObj<typeof meta>

const nameColumns: ColumnDef<Entry>[] = [{ accessorKey: 'name', header: 'Name', size: 200 }]

// Seven names: a table of ten rows or fewer, which TanStack used to sort as plain, case-sensitive text.
const nameRows: Entry[] = ['Åse', 'ole', 'Ole', 'Zara', 'Ærlig', 'Øyvind', 'anne'].map((name, index) => ({
    id: String(index + 1),
    name,
}))

/**
 * A table of ten rows or fewer sorts text case-insensitively and in the table language: `anne` before `Zara`, and with
 * `locale='no'` æ, ø and å after z. `ole` and `Ole` differ only by case, so they tie and keep the data order. Sorting by Name
 * ascending, then descending.
 */
export const SmallTableTextSort: Story = {
    loaders: [clearStorage],
    render: () => (
        <div className='w-[320px]'>
            <StyledTable columns={nameColumns} data={nameRows} hideFooter locale='no' />
        </div>
    ),
    play: async ({ canvasElement }) => {
        await clickHeader(canvasElement, 'Name')
        await expect(headerOf(canvasElement, 'Name')).toHaveAttribute('aria-sort', 'ascending')
        await expect(bodyNames(canvasElement)).toEqual(['anne', 'ole', 'Ole', 'Zara', 'Ærlig', 'Øyvind', 'Åse'])

        await clickHeader(canvasElement, 'Name')
        await expect(headerOf(canvasElement, 'Name')).toHaveAttribute('aria-sort', 'descending')
        await expect(bodyNames(canvasElement)).toEqual(['Åse', 'Øyvind', 'Ærlig', 'Zara', 'ole', 'Ole', 'anne'])
    },
}

const emptyColumns: ColumnDef<Entry>[] = [
    { accessorKey: 'name', header: 'Name', size: 120 },
    // Explicit first directions, so the cycle below does not depend on which value TanStack samples.
    { accessorKey: 'note', header: 'Note', size: 140, sortDescFirst: false },
    { accessorKey: 'score', header: 'Score', size: 120, sortDescFirst: true },
]

const emptyRows: Entry[] = [
    { id: '1', name: 'Row 1', note: 'b', score: 2 },
    { id: '2', name: 'Row 2', note: undefined, score: undefined },
    { id: '3', name: 'Row 3', note: 'a', score: 3 },
    { id: '4', name: 'Row 4', note: null, score: null },
    { id: '5', name: 'Row 5', note: '', score: 1 },
    { id: '6', name: 'Row 6', note: 'c', score: NaN },
]

/**
 * Empty cells (`undefined`, `null`, `''`, and `NaN` in a number column) always go last, in both directions (D22). Note
 * ascending, then descending (an `undefined` cell used to come first here), then off, which returns to the data order. Then
 * Score the same way: its empty cells stay at the bottom in the descending sort it starts with.
 */
export const EmptiesLast: Story = {
    loaders: [clearStorage],
    render: () => (
        <div className='w-[420px]'>
            <StyledTable columns={emptyColumns} data={emptyRows} hideFooter locale='en' />
        </div>
    ),
    play: async ({ canvasElement }) => {
        const data = ['Row 1', 'Row 2', 'Row 3', 'Row 4', 'Row 5', 'Row 6']

        await expect(bodyNames(canvasElement)).toEqual(data)

        await clickHeader(canvasElement, 'Note')
        await expect(headerOf(canvasElement, 'Note')).toHaveAttribute('aria-sort', 'ascending')
        await expect(bodyNames(canvasElement)).toEqual(['Row 3', 'Row 1', 'Row 6', 'Row 2', 'Row 4', 'Row 5'])

        await clickHeader(canvasElement, 'Note')
        await expect(headerOf(canvasElement, 'Note')).toHaveAttribute('aria-sort', 'descending')
        // `undefined` last here: TanStack alone would put it first.
        await expect(bodyNames(canvasElement)).toEqual(['Row 6', 'Row 1', 'Row 3', 'Row 2', 'Row 4', 'Row 5'])

        await clickHeader(canvasElement, 'Note')
        await expect(headerOf(canvasElement, 'Note')).toHaveAttribute('aria-sort', 'none')
        await expect(bodyNames(canvasElement)).toEqual(data)

        await clickHeader(canvasElement, 'Score')
        await expect(headerOf(canvasElement, 'Score')).toHaveAttribute('aria-sort', 'descending')
        await expect(bodyNames(canvasElement)).toEqual(['Row 3', 'Row 1', 'Row 5', 'Row 2', 'Row 4', 'Row 6'])

        await clickHeader(canvasElement, 'Score')
        await expect(headerOf(canvasElement, 'Score')).toHaveAttribute('aria-sort', 'ascending')
        await expect(bodyNames(canvasElement)).toEqual(['Row 5', 'Row 1', 'Row 3', 'Row 2', 'Row 4', 'Row 6'])

        await clickHeader(canvasElement, 'Score')
        await expect(headerOf(canvasElement, 'Score')).toHaveAttribute('aria-sort', 'none')
        await expect(bodyNames(canvasElement)).toEqual(data)
    },
}

const tieColumns: ColumnDef<Entry>[] = [
    { accessorKey: 'name', header: 'Name', size: 100 },
    {
        accessorKey: 'updated',
        header: 'Updated',
        size: 160,
        sortDescFirst: false,
        cell: ({ row }) => formatWhen(row.original.updated),
    },
    { accessorKey: 'written', header: 'Written', size: 240, sortDescFirst: false },
]

// Equal times: four equal `Date`s, and four ISO strings written with other offsets and fractions. And names that differ only
// by case.
const tieRows: Entry[] = [
    { id: '1', name: 'ole', updated: new Date('2026-10-30T10:00:00Z'), written: '2026-10-30T11:00:00+01:00' },
    { id: '2', name: 'OLE', updated: new Date('2026-10-30T10:00:00Z'), written: '2026-10-30T10:00:00Z' },
    { id: '3', name: 'Ole', updated: new Date('2026-10-30T10:00:00Z'), written: '2026-10-30T10:00:00.000Z' },
    { id: '4', name: 'oLe', updated: new Date('2026-10-30T10:00:00Z'), written: '2026-10-30T10:00:00.00Z' },
]

/**
 * Rows that tie keep the data order, in both directions: equal timestamps (equal `Date`s, and ISO strings written with other
 * offsets or fractions that stand for the same time), and names that differ only by case. TanStack alone would swap equal
 * `Date`s in a small table.
 */
export const StableTies: Story = {
    loaders: [clearStorage],
    render: () => (
        <div className='w-[560px]'>
            <StyledTable columns={tieColumns} data={tieRows} hideFooter locale='en' />
        </div>
    ),
    play: async ({ canvasElement }) => {
        const data = ['ole', 'OLE', 'Ole', 'oLe']

        await clickHeader(canvasElement, 'Updated')
        await expect(headerOf(canvasElement, 'Updated')).toHaveAttribute('aria-sort', 'ascending')
        await expect(bodyNames(canvasElement)).toEqual(data)

        await clickHeader(canvasElement, 'Updated')
        await expect(headerOf(canvasElement, 'Updated')).toHaveAttribute('aria-sort', 'descending')
        await expect(bodyNames(canvasElement)).toEqual(data)

        await clickHeader(canvasElement, 'Written')
        await expect(headerOf(canvasElement, 'Written')).toHaveAttribute('aria-sort', 'ascending')
        await expect(bodyNames(canvasElement)).toEqual(data)

        await clickHeader(canvasElement, 'Written')
        await expect(headerOf(canvasElement, 'Written')).toHaveAttribute('aria-sort', 'descending')
        await expect(bodyNames(canvasElement)).toEqual(data)

        await clickHeader(canvasElement, 'Name')
        await expect(headerOf(canvasElement, 'Name')).toHaveAttribute('aria-sort', 'ascending')
        await expect(bodyNames(canvasElement)).toEqual(data)

        await clickHeader(canvasElement, 'Name')
        await expect(headerOf(canvasElement, 'Name')).toHaveAttribute('aria-sort', 'descending')
        await expect(bodyNames(canvasElement)).toEqual(data)
    },
}

const directionColumns: ColumnDef<Entry>[] = [
    { accessorKey: 'name', header: 'Name', size: 140 },
    { accessorKey: 'score', header: 'Score', size: 120 },
    { accessorKey: 'updated', header: 'Updated', size: 160, cell: ({ row }) => formatWhen(row.original.updated) },
]

const directionRows: Entry[] = [
    { id: '1', name: 'Bravo', score: 3, updated: new Date('2026-10-01T10:00:00Z') },
    { id: '2', name: 'Alfa', score: 1, updated: new Date('2026-10-03T10:00:00Z') },
    { id: '3', name: 'Charlie', score: 2, updated: new Date('2026-10-02T10:00:00Z') },
]

/**
 * The first click is unchanged: a text column starts ascending and a number or date column starts descending, because
 * TanStack reads the first row's value, not the comparison. The hover and focus preview (D13) shows the same direction
 * before the click, and the click gives it.
 */
export const FirstSortDirection: Story = {
    loaders: [clearStorage],
    render: () => (
        <div className='w-[460px]'>
            <StyledTable columns={directionColumns} data={directionRows} hideFooter locale='en' />
        </div>
    ),
    play: async ({ canvasElement }) => {
        const preview = (label: string) =>
            headerOf(canvasElement, label).querySelector<HTMLElement>('[data-sort-state]')!.getAttribute('data-preview-direction')

        await expect(preview('Name')).toBe('asc')
        await expect(preview('Score')).toBe('desc')
        await expect(preview('Updated')).toBe('desc')

        await clickHeader(canvasElement, 'Name')
        await expect(headerOf(canvasElement, 'Name')).toHaveAttribute('aria-sort', 'ascending')
        await expect(bodyNames(canvasElement)).toEqual(['Alfa', 'Bravo', 'Charlie'])

        await clickHeader(canvasElement, 'Score')
        await expect(headerOf(canvasElement, 'Score')).toHaveAttribute('aria-sort', 'descending')
        await expect(bodyNames(canvasElement)).toEqual(['Bravo', 'Charlie', 'Alfa'])

        await clickHeader(canvasElement, 'Updated')
        await expect(headerOf(canvasElement, 'Updated')).toHaveAttribute('aria-sort', 'descending')
        await expect(bodyNames(canvasElement)).toEqual(['Alfa', 'Charlie', 'Bravo'])
    },
}

const PERSIST_KEY = 'p2f-persist-and-reset'
const persistedTables: Table<Entry>[] = []

const PersistedTable = (): JSX.Element => {
    const tableRef = useRef<Table<Entry>>(null)

    useEffect(() => {
        if (tableRef.current) persistedTables.push(tableRef.current)
    })

    return (
        <div className='w-[460px]'>
            <StyledTable
                columns={directionColumns}
                data={directionRows}
                hideFooter
                initialState={{ sorting: [{ id: 'name', desc: false }] }}
                locale='en'
                persistSorting
                tableInstanceRef={tableRef}
                uniqueKey={PERSIST_KEY}
            />
        </div>
    )
}

/**
 * Saving and Reset columns are unchanged: a saved sort (Score, descending) beats the table's default (Name, ascending) when
 * the table opens, and Reset columns returns to the default and removes the entry.
 */
export const PersistAndReset: Story = {
    loaders: [
        () => {
            localStorage.clear()
            localStorage.setItem(`${PERSIST_KEY}:sorting`, JSON.stringify({ v: 1, sorting: [{ id: 'score', desc: true }] }))
            persistedTables.length = 0
            return {}
        },
    ],
    render: () => <PersistedTable />,
    play: async ({ canvasElement }) => {
        await expect(headerOf(canvasElement, 'Score')).toHaveAttribute('aria-sort', 'descending')
        await expect(headerOf(canvasElement, 'Name')).toHaveAttribute('aria-sort', 'none')
        await expect(bodyNames(canvasElement)).toEqual(['Bravo', 'Charlie', 'Alfa'])

        // The call Reset columns makes; the button itself also shows a snackbar, which would stay in the capture.
        persistedTables.at(-1)!.resetColumnSettings()

        await waitFor(() => expect(headerOf(canvasElement, 'Name')).toHaveAttribute('aria-sort', 'ascending'))
        await expect(headerOf(canvasElement, 'Score')).toHaveAttribute('aria-sort', 'none')
        await expect(localStorage.getItem(`${PERSIST_KEY}:sorting`)).toBeNull()
        await expect(bodyNames(canvasElement)).toEqual(['Alfa', 'Bravo', 'Charlie'])
    },
}
