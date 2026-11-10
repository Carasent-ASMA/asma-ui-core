import type { ColumnDef, SortingFn } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { ariaSorts, sortButton } from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'
import type { StyledTableProps } from '../types'

/**
 * The default sort comparison, wired into `StyledTable` (ASMA-8597, P2f, DEC-SORTFN; U-SF09, U-SF10 and the wiring the
 * unit tests cannot see). Real Chromium and the real `useStyledTable`.
 */

interface Item {
    id: string
    name: string
    score?: number | null
    note?: string
}

/** Out of order on purpose: neither the name nor the score order is the data order. */
const items: Item[] = [
    { id: '1', name: 'Åse', score: 3, note: 'b' },
    { id: '2', name: 'anne', score: undefined, note: 'a' },
    { id: '3', name: 'Zara', score: 1, note: undefined },
    { id: '4', name: 'Øyvind', score: null, note: 'c' },
    { id: '5', name: 'Ærlig', score: 2, note: '' },
]

const baseColumns: ColumnDef<Item>[] = [
    { accessorKey: 'name', header: 'Name', size: 160 },
    { accessorKey: 'score', header: 'Score', size: 120 },
    { accessorKey: 'note', header: 'Note', size: 120 },
]

type Props = Partial<Omit<StyledTableProps<Item, Record<string, unknown>>, 'footer' | 'hideFooter'>>

const ItemsTable = ({ columns = baseColumns, ...props }: Props & { columns?: ColumnDef<Item>[] }): JSX.Element => (
    <StyledTable<Item> columns={columns} data={items} hideFooter locale='no' {...props} />
)

/** The first column of each body row. */
const names = (): string[] =>
    [...document.querySelectorAll<HTMLElement>('tbody tr')].map((row) => row.querySelector('td')?.textContent ?? '')

describe('StyledTable default sort comparison', () => {
    beforeEach(() => localStorage.clear())
    afterEach(cleanup)

    it('sorts text in the table locale, ignoring case, in a table of five rows (the rows TanStack used to compare as plain text)', async () => {
        mount(<ItemsTable />)

        await userEvent.click(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('ascending')
        await expect(names()).toEqual(['anne', 'Zara', 'Ærlig', 'Øyvind', 'Åse'])

        await userEvent.click(sortButton('Name'))
        await expect(names()).toEqual(['Åse', 'Øyvind', 'Ærlig', 'Zara', 'anne'])
    })

    it('uses the table locale: English puts å, æ and ø elsewhere', async () => {
        mount(<ItemsTable locale='en' />)

        await userEvent.click(sortButton('Name'))
        // In English, æ is "ae" and ø is an o, so they fall among the other letters.
        await expect(names()).toEqual(['Ærlig', 'anne', 'Åse', 'Øyvind', 'Zara'])
    })

    it('sorts again when the locale of a mounted table changes (audit round 1, fix 4)', async () => {
        const sorted = { sorting: [{ id: 'name', desc: false }] }
        const view = mount(<ItemsTable locale='en' initialState={sorted} />)

        await expect(names()).toEqual(['Ærlig', 'anne', 'Åse', 'Øyvind', 'Zara'])

        view.rerender(<ItemsTable locale='no' initialState={sorted} />)

        await waitFor(() => expect(names()).toEqual(['anne', 'Zara', 'Ærlig', 'Øyvind', 'Åse']))
        await expect(ariaSorts()['Name']).toBe('ascending')

        // And back, in the descending sort the user picks next.
        view.rerender(<ItemsTable locale='en' initialState={sorted} />)
        await waitFor(() => expect(names()).toEqual(['Ærlig', 'anne', 'Åse', 'Øyvind', 'Zara']))
        await userEvent.click(sortButton('Name'))
        await expect(names()).toEqual(['Zara', 'Øyvind', 'Åse', 'anne', 'Ærlig'])
    })

    it('leaves an unsorted table alone when its locale changes', async () => {
        const view = mount(<ItemsTable locale='en' />)

        view.rerender(<ItemsTable locale='no' />)

        await expect(names()).toEqual(['Åse', 'anne', 'Zara', 'Øyvind', 'Ærlig'])
        await expect(ariaSorts()['Name']).toBe('none')
    })

    it('puts empty cells last in both directions, undefined included (the descending sort used to put it first)', async () => {
        mount(<ItemsTable />)

        // A number column starts descending.
        await userEvent.click(sortButton('Score'))
        await expect(ariaSorts()['Score']).toBe('descending')
        await expect(names()).toEqual(['Åse', 'Ærlig', 'Zara', 'anne', 'Øyvind'])

        await userEvent.click(sortButton('Score'))
        await expect(ariaSorts()['Score']).toBe('ascending')
        await expect(names()).toEqual(['Zara', 'Ærlig', 'Åse', 'anne', 'Øyvind'])

        // Off: back to the data order.
        await userEvent.click(sortButton('Score'))
        await expect(ariaSorts()['Score']).toBe('none')
        await expect(names()).toEqual(['Åse', 'anne', 'Zara', 'Øyvind', 'Ærlig'])
    })

    describe('a column or an app that sets its own comparison keeps it (U-SF09)', () => {
        const byLength: SortingFn<Item> = (rowA, rowB) => rowA.original.name.length - rowB.original.name.length

        it("keeps a column's own sortingFn", async () => {
            const columns: ColumnDef<Item>[] = [
                { accessorKey: 'name', header: 'Name', size: 160, sortingFn: byLength },
                baseColumns[1]!,
            ]
            mount(<ItemsTable columns={columns} />)

            await userEvent.click(sortButton('Name'))
            // By name length, ties in the data order: not the Norwegian text order.
            await expect(names()).toEqual(['Åse', 'anne', 'Zara', 'Ærlig', 'Øyvind'])
        })

        it("keeps an app's defaultColumn.sortingFn", async () => {
            mount(<ItemsTable defaultColumn={{ sortingFn: byLength }} />)

            await userEvent.click(sortButton('Name'))
            await expect(names()).toEqual(['Åse', 'anne', 'Zara', 'Ærlig', 'Øyvind'])
        })

        it("keeps a column's own sortUndefined and an app's defaultColumn.sortUndefined", async () => {
            const first: ColumnDef<Item>[] = [baseColumns[0]!, { ...baseColumns[1]!, sortUndefined: 'first' }]
            const view = mount(<ItemsTable columns={first} />)

            // `sortUndefined: 'first'` puts an `undefined` score first in both directions, as TanStack does.
            await userEvent.click(sortButton('Score'))
            await expect(names()[0]).toBe('anne')
            await userEvent.click(sortButton('Score'))
            await expect(names()[0]).toBe('anne')
            view.unmount()

            mount(<ItemsTable defaultColumn={{ sortUndefined: 'first' }} />)
            await userEvent.click(sortButton('Score'))
            await expect(names()[0]).toBe('anne')
        })
    })

    describe("a column that sorts with its own comparison keeps TanStack's handling of undefined (audit round 1, fix 1)", () => {
        const received: unknown[] = []
        // Written for TanStack: it never sees `undefined`, so it does not check for it.
        const byScore: SortingFn<Item> = (rowA, rowB, columnId) => {
            const a = rowA.getValue<number | null>(columnId)
            const b = rowB.getValue<number | null>(columnId)
            received.push(a, b)

            return Number(a ?? 0) - Number(b ?? 0)
        }
        // `undefined` is last ascending and first descending: what TanStack's default does.
        const ascending = ['Øyvind', 'Zara', 'Ærlig', 'Åse', 'anne']
        const descending = ['anne', 'Åse', 'Ærlig', 'Zara', 'Øyvind']

        beforeEach(() => {
            received.length = 0
        })

        const expectTanStackPlacement = async (): Promise<void> => {
            await userEvent.click(sortButton('Score'))
            await expect(ariaSorts()['Score']).toBe('descending')
            await expect(names()).toEqual(descending)

            await userEvent.click(sortButton('Score'))
            await expect(ariaSorts()['Score']).toBe('ascending')
            await expect(names()).toEqual(ascending)
            // The comparator never saw an `undefined`.
            await expect(received.length).toBeGreaterThan(0)
            await expect(received.includes(undefined)).toBe(false)
        }

        it("on a column's own sortingFn", async () => {
            const columns: ColumnDef<Item>[] = [baseColumns[0]!, { ...baseColumns[1]!, sortingFn: byScore }]
            mount(<ItemsTable columns={columns} />)

            await expectTanStackPlacement()
        })

        it("on an app's defaultColumn.sortingFn", async () => {
            mount(<ItemsTable defaultColumn={{ sortingFn: byScore }} />)

            await expectTanStackPlacement()
        })

        it("on a column that names 'auto': TanStack's own comparison, capitals before lowercase, and its undefined handling", async () => {
            const columns: ColumnDef<Item>[] = [
                { accessorKey: 'name', header: 'Name', size: 160, sortingFn: 'auto' },
                { ...baseColumns[1]!, sortingFn: 'auto' },
            ]
            mount(<ItemsTable columns={columns} />)

            // Five rows, so `auto` picks `basic`: code-unit order, a capital before a lowercase letter (not Norwegian order).
            await userEvent.click(sortButton('Name'))
            await expect(names()).toEqual(['Zara', 'anne', 'Åse', 'Ærlig', 'Øyvind'])

            await userEvent.click(sortButton('Score'))
            await expect(names()).toEqual(descending)
            await userEvent.click(sortButton('Score'))
            await expect(names()).toEqual(ascending)
        })

        it('while a leaf of a column group that sorts with the default puts undefined last in both directions', async () => {
            const columns: ColumnDef<Item>[] = [{ header: 'Group', columns: [baseColumns[0]!, baseColumns[1]!] }]
            mount(<ItemsTable columns={columns} />)

            await userEvent.click(sortButton('Score'))
            await expect(names()).toEqual(['Åse', 'Ærlig', 'Zara', 'anne', 'Øyvind'])
            await userEvent.click(sortButton('Score'))
            await expect(names()).toEqual(['Zara', 'Ærlig', 'Åse', 'anne', 'Øyvind'])
        })
    })

    it('two tables on one page, sorted in opposite directions, each keep their own empty cells last (audit round 1, fix 3)', async () => {
        mount(
            <>
                <ItemsTable initialState={{ sorting: [{ id: 'score', desc: false }] }} />
                <ItemsTable initialState={{ sorting: [{ id: 'score', desc: true }] }} />
            </>,
        )
        const bodyOf = (index: number): string[] =>
            [...document.querySelectorAll('tbody')[index]!.querySelectorAll<HTMLElement>('tr')].map(
                (row) => row.querySelector('td')?.textContent ?? '',
            )
        const scoreButtonOf = (index: number): HTMLElement =>
            [...document.querySelectorAll('thead')[index]!.querySelectorAll<HTMLElement>('th')]
                .find((cell) => cell.textContent?.trim() === 'Score')!
                .querySelector<HTMLElement>('[role="button"]')!
        const ascending = ['Zara', 'Ærlig', 'Åse', 'anne', 'Øyvind']
        const descending = ['Åse', 'Ærlig', 'Zara', 'anne', 'Øyvind']
        const dataOrder = ['Åse', 'anne', 'Zara', 'Øyvind', 'Ærlig']

        await expect(bodyOf(0)).toEqual(ascending)
        await expect(bodyOf(1)).toEqual(descending)

        // Toggling the first table (ascending, then off, then descending) leaves the second as it was.
        await userEvent.click(scoreButtonOf(0))
        await expect(bodyOf(0)).toEqual(dataOrder)
        await expect(bodyOf(1)).toEqual(descending)
        await userEvent.click(scoreButtonOf(0))
        await expect(bodyOf(0)).toEqual(descending)
        await expect(bodyOf(1)).toEqual(descending)

        // And the other way round: the second table goes ascending and then off while the first stays descending.
        await userEvent.click(scoreButtonOf(1))
        await expect(bodyOf(1)).toEqual(ascending)
        await expect(bodyOf(0)).toEqual(descending)
        await userEvent.click(scoreButtonOf(1))
        await expect(bodyOf(1)).toEqual(dataOrder)
        await expect(bodyOf(0)).toEqual(descending)
    })

    it("keeps the app's own sortingFns available beside styledDefault (U-SF10)", async () => {
        const reversedName: SortingFn<Item> = (rowA, rowB) => rowB.original.name.localeCompare(rowA.original.name)
        const columns: ColumnDef<Item>[] = [
            // A column names the app's function; the others keep the default.
            { accessorKey: 'name', header: 'Name', size: 160, sortingFn: 'reversedName' as never },
            baseColumns[1]!,
        ]
        mount(<ItemsTable columns={columns} sortingFns={{ reversedName }} />)

        await userEvent.click(sortButton('Name'))
        await expect(names()).toEqual(['Zara', 'Øyvind', 'Åse', 'anne', 'Ærlig'])

        // The default is still registered for the column that names nothing.
        await userEvent.click(sortButton('Score'))
        await expect(names()).toEqual(['Åse', 'Ærlig', 'Zara', 'anne', 'Øyvind'])
    })
})
