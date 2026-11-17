import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { tabbableWithin } from 'src/helpers/focusable'
import { expect, fn, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { button, enterBody, press as pressKeys, row } from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'
import type { StyledTableProps } from '../types'

/**
 * ASMA-8875: the rows of a StyledTable nested in a sub-row (`renderSubRows`) are rows of the outermost table. The apps
 * render a `<tr>` whose cell holds a StyledTable with `hideHeader hideFooter` (Outbox, Anonymous questionnaires). The
 * outermost table owns the keys: Up/Down/Home/End walk its rows and the nested table's rows, in visual order; Left/Right
 * walk the focused row's own controls; Enter on a nested row is that table's `onRowClick`. The whole body is one tab stop.
 * Every key is a real press.
 */

interface Outer {
    id: string
    name: string
}
interface Inner {
    id: string
    title: string
}

const outer: Outer[] = [
    { id: 'r-1', name: 'First' },
    { id: 'r-2', name: 'Second' },
    { id: 'r-3', name: 'Third' },
]
const innerOf = (parent: string): Inner[] => [
    { id: `${parent}-n1`, title: 'Question 1' },
    { id: `${parent}-n2`, title: 'Question 2' },
]

const outerColumns: ColumnDef<Outer>[] = [
    { accessorKey: 'name', header: 'Name' },
    {
        id: 'open',
        header: 'Open',
        enableSorting: false,
        cell: ({ row }) => <button type='button'>{`Open ${row.id}`}</button>,
    },
]
const innerColumns: ColumnDef<Inner>[] = [
    { accessorKey: 'title', header: 'Title' },
    {
        id: 'edit',
        header: 'Edit',
        enableSorting: false,
        cell: ({ row }) => <button type='button'>{`Edit ${row.id}`}</button>,
    },
]

type OuterProps = Partial<Omit<StyledTableProps<Outer, Inner>, 'footer'>>

const mountNested = ({ onNestedRowClick = fn(), ...props }: OuterProps & { onNestedRowClick?: ReturnType<typeof fn> } = {}): void => {
    mount(
        <div>
            <button type='button'>Before</button>
            <StyledTable<Outer, Inner>
                locale='en'
                columns={outerColumns}
                data={outer}
                hideFooter
                expandArrow
                getRowCanExpand={() => true}
                initialState={{ expanded: { 'r-1': true } }}
                customSubRowData={new Map(outer.map((row) => [row.id, innerOf(row.id)]))}
                renderSubRows={({ rows, row }) => (
                    <tr id={`sub-${row.id}`}>
                        <td colSpan={4}>
                            <StyledTable<Inner>
                                locale='en'
                                columns={innerColumns}
                                data={rows}
                                hideHeader
                                hideFooter
                                headerPin={false}
                                onRowClick={(_event, nestedRow) => {
                                    onNestedRowClick(nestedRow.id)
                                }}
                                actions={() => [{ label: 'Delete', onClick: () => undefined }]}
                            />
                        </td>
                    </tr>
                )}
                {...props}
            />
            <button type='button'>After</button>
        </div>,
    )
}

const outerTable = (): HTMLTableElement => document.querySelector<HTMLTableElement>('table')!

/** Where the focus is: a row by its id, a control by its name and its row, the header, or a button. */
const focusName = (): string => {
    const active = document.activeElement as HTMLElement | null

    if (!active || active === document.body) return 'nothing'
    if (active.tagName === 'TR') return active.closest('thead') ? 'header row' : `row ${active.id}`
    if (active.closest('thead') === outerTable().tHead) return `header ${active.textContent || (active.getAttribute('aria-label') ?? '')}`

    const owner = active.closest('tr')

    return owner ? `${active.getAttribute('aria-label') ?? active.textContent} (${owner.id})` : active.textContent || active.tagName
}

const press = (keys: string): Promise<string> => pressKeys(keys, focusName)

describe('ASMA-8875 sub-rows: the keys walk the outer rows and the nested rows as one list', () => {
    afterEach(cleanup)

    it('Down and Up walk outer row → nested rows → next outer row; Home and End reach the ends of the whole list', async () => {
        mountNested()
        await enterBody()

        const down = [await press('{ArrowDown}'), await press('{ArrowDown}'), await press('{ArrowDown}'), await press('{ArrowDown}')]

        await expect(down).toEqual(['row r-1-n1', 'row r-1-n2', 'row r-2', 'row r-3'])
        await expect([await press('{ArrowUp}'), await press('{ArrowUp}')]).toEqual(['row r-2', 'row r-1-n2'])
        await expect(await press('{End}')).toBe('row r-3')
        await expect(await press('{Home}')).toBe('row r-1')
    })

    it("Left and Right walk the focused row's own controls: the outer row's (not the nested table's), a nested row's", async () => {
        mountNested()
        await enterBody()

        await expect([await press('{ArrowRight}'), await press('{ArrowRight}'), await press('{ArrowRight}')]).toEqual([
            'Collapse row 1 (r-1)',
            'Open r-1 (r-1)',
            'Open r-1 (r-1)',
        ])
        await expect(await press('{ArrowLeft}{ArrowLeft}{ArrowDown}{ArrowRight}')).toBe('Edit r-1-n1 (r-1-n1)')
        await expect(await press('{ArrowRight}')).toBe('Row actions (r-1-n1)')
        await expect(await press('{ArrowLeft}{ArrowLeft}')).toBe('row r-1-n1')
    })

    it("Enter on a nested row is that table's onRowClick; Enter on a nested control is the control's", async () => {
        const onNestedRowClick = fn()

        mountNested({ onNestedRowClick })
        await enterBody()

        await press('{ArrowDown}{ArrowDown}')
        await userEvent.keyboard('{Enter}')
        await expect(onNestedRowClick).toHaveBeenCalledTimes(1)
        await expect(onNestedRowClick).toHaveBeenCalledWith('r-1-n2')

        await press('{ArrowRight}{ArrowRight}')
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(document.querySelector('[role="menu"]')).not.toBeNull())
        await expect(onNestedRowClick).toHaveBeenCalledTimes(1)
    })

    it('Tab from a nested row or control leaves the outermost table; Shift+Tab goes to the outermost header', async () => {
        mountNested()
        await enterBody()

        await expect(await press('{ArrowDown}')).toBe('row r-1-n1')
        await expect(await press('{Tab}')).toBe('After')
        await expect(await press('{Shift>}{Tab}{/Shift}')).toBe('row r-1-n1')
        await expect(await press('{ArrowRight}')).toBe('Edit r-1-n1 (r-1-n1)')
        await expect(await press('{Shift>}{Tab}{/Shift}')).toBe('header row')
        await expect(await press('{Tab}')).toBe('row r-1-n1')
        await expect(await press('{ArrowUp}{ArrowRight}{Tab}')).toBe('After')
    })
})

describe('ASMA-8875 sub-rows: one tab stop for the whole body', () => {
    afterEach(cleanup)

    const bodyStops = (): HTMLElement[] =>
        tabbableWithin(outerTable()).filter((stop) => stop.closest('thead') !== outerTable().tHead)

    it('the body has one tab stop wherever the active row is, nested or not; nested tables give up theirs, header included', async () => {
        mountNested()

        await expect(bodyStops()).toEqual([row('r-1')])
        await expect(tabbableWithin(outerTable())).toHaveLength(2)

        await enterBody()
        await press('{ArrowDown}{ArrowDown}')
        await expect(focusName()).toBe('row r-1-n2')
        await expect(bodyStops()).toEqual([row('r-1-n2')])

        // From before and after the table, the keys come back to it.
        button('Before').focus()
        await expect(await press('{Tab}{Tab}')).toBe('row r-1-n2')
        button('After').focus()
        await expect(await press('{Shift>}{Tab}{/Shift}')).toBe('row r-1-n2')
    })

    it('a mouse focus on a nested control moves the tab stop to its row', async () => {
        mountNested()

        await userEvent.click(button('Edit r-1-n2'))
        await expect(focusName()).toBe('Edit r-1-n2 (r-1-n2)')
        await expect(bodyStops()).toEqual([row('r-1-n2')])
    })

    it('settles: once a nested table re-renders its own tab stops, the outermost table corrects them once, then nothing moves', async () => {
        mountNested()
        await enterBody()

        // Into the nested table: its React state moves its own focused row (and its own tabIndex) on every press.
        await press('{ArrowDown}{ArrowDown}{ArrowUp}{ArrowDown}')
        await expect(focusName()).toBe('row r-1-n2')

        const writes: MutationRecord[] = []
        const watcher = new MutationObserver((records) => writes.push(...records))

        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        watcher.observe(outerTable(), { subtree: true, attributes: true, attributeFilter: ['tabindex'] })
        await new Promise((resolve) => setTimeout(resolve, 300))
        watcher.disconnect()

        await expect(writes, 'no tabindex write after the table settled').toHaveLength(0)
        await expect(bodyStops()).toEqual([row('r-1-n2')])
    })

    it("a control in the nested table frames its own cell, never the sub-row's cell around the nested table", async () => {
        mountNested({
            renderSubRows: ({ rows, row: parent }) => (
                <tr id={`sub-${parent.id}`}>
                    <td colSpan={4}>
                        <StyledTable<Inner>
                            locale='en'
                            columns={innerColumns}
                            data={rows}
                            hideHeader
                            hideFooter
                            headerPin={false}
                            expandArrow
                            getRowCanExpand={() => true}
                        />
                    </td>
                </tr>
            ),
        })
        await enterBody()

        await expect(await press('{ArrowDown}{ArrowRight}')).toBe('Expand row 1 (r-1-n1)')

        const nestedCell = (document.activeElement as HTMLElement).closest('td')!
        const subRowCell = row('sub-r-1').cells[0]!

        await expect(getComputedStyle(nestedCell).boxShadow).toContain('inset')
        await expect(getComputedStyle(subRowCell).boxShadow).toBe('none')
    })

    it("the context-menu key on a nested row opens that row's ⋮", async () => {
        mountNested()
        await enterBody()
        await press('{ArrowDown}')

        await userEvent.keyboard('{ContextMenu}')
        await waitFor(() => expect(focusName()).toBe('Delete'))
    })
})

describe('ASMA-8875 rows in DOM order', () => {
    afterEach(cleanup)

    it('a hideFooter table with more rows than the page size (50) walks them all: Down past row 50, End on the last', async () => {
        const many: Outer[] = Array.from({ length: 60 }, (_, index) => ({ id: `m-${String(index + 1)}`, name: `Row ${String(index + 1)}` }))

        mount(<StyledTable<Outer> locale='en' columns={outerColumns} data={many} hideFooter />)
        row('m-50').focus()

        await expect(await press('{ArrowDown}')).toBe('row m-51')
        await expect(await press('{End}')).toBe('row m-60')
        await expect(await press('{ArrowUp}')).toBe('row m-59')
    })

    it('TanStack sub-rows (getSubRows) are rows of the table: Down walks into them and on', async () => {
        interface Tree extends Outer {
            children?: Tree[]
        }
        const tree: Tree[] = [
            { id: 'p-1', name: 'Parent', children: [{ id: 'a', name: 'Child A' }, { id: 'b', name: 'Child B' }] },
            { id: 'p-2', name: 'Next' },
        ]

        mount(
            <StyledTable<Tree>
                locale='en'
                columns={outerColumns as ColumnDef<Tree>[]}
                data={tree}
                hideFooter
                getSubRows={(row) => row.children}
                initialState={{ expanded: true }}
            />,
        )
        row('p-1').focus()

        await expect([await press('{ArrowDown}'), await press('{ArrowDown}'), await press('{ArrowDown}')]).toEqual([
            'row p-1.a',
            'row p-1.b',
            'row p-2',
        ])
    })
})
