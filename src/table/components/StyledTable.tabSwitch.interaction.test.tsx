import { useLayoutEffect, useRef, useState } from 'react'
import type { ColumnDef, SortingState, Table } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { ariaSorts, callsFor, headerCell, people, personColumns, sortButton, type Person } from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'
import type { StyledTableProps } from '../types'

/**
 * One mounted table, a different key per tab (ASMA-8698, Step T follow-up). The apps used to give the table a React `key`
 * per tab, which rebuilds everything on every switch; they should keep the table and only change `uniqueKey` and
 * `persistColumnOrderKey`. So a switch has to bring in the new key's sort, order, widths and page size by itself, write
 * nothing, and leave the `<table>` element where it is. U-K01..U-K04 cover each setting on its own; this covers the switch.
 */

const DEFINITION_ORDER = ['Name', 'Role', 'Age', 'Notes']
/** The default width of the fixture's sortable 160 px columns: the declared 160 plus 20 px (ASMA-8597, D16). */
const SORTABLE_160 = 180

type Props = Partial<Omit<StyledTableProps<Person, Record<string, unknown>>, 'footer' | 'hideFooter'>>

interface Tab {
    uniqueKey?: string
    orderKey?: string
    /** What the tab brings with its keys, in the same render: its own columns and defaults. */
    columns?: ColumnDef<Person>[]
    initialState?: Props['initialState']
}

const TAB_A: Tab = { uniqueKey: 'tab-a', orderKey: 'tab-a-order' }
const TAB_B: Tab = { uniqueKey: 'tab-b', orderKey: 'tab-b-order' }
const TAB_C: Tab = { uniqueKey: 'tab-c', orderKey: 'tab-c-order' }
const NO_KEYS: Tab = {}

const ORDER_A = ['role', 'name', 'age', 'notes']
const ORDER_B = ['age', 'name', 'role', 'notes']
const SORT_A: SortingState = [{ id: 'name', desc: false }]
const SORT_B: SortingState = [{ id: 'age', desc: true }]
const DEFAULT_SORT: SortingState = [{ id: 'role', desc: false }]

const seed = (tab: Tab, saved: { order?: string[]; sorting?: SortingState; widths?: Record<string, number>; pageSize?: number }): void => {
    if (saved.order) localStorage.setItem(tab.orderKey!, JSON.stringify(saved.order))
    if (saved.sorting) localStorage.setItem(`${tab.uniqueKey}:sorting`, JSON.stringify({ v: 1, sorting: saved.sorting }))
    if (saved.widths) localStorage.setItem(`${tab.uniqueKey}:column-sizing`, JSON.stringify(saved.widths))
    if (saved.pageSize) localStorage.setItem(`${tab.uniqueKey}:page-size`, JSON.stringify(saved.pageSize))
}

const seedTabs = (): void => {
    seed(TAB_A, { order: ORDER_A, sorting: SORT_A, widths: { name: 240 }, pageSize: 10 })
    seed(TAB_B, { order: ORDER_B, sorting: SORT_B, widths: { name: 300, role: 220 }, pageSize: 25 })
}

interface Harness {
    /** Switch tab from outside React's batching, as a click in an app would not: default lane, passive effects after paint. */
    switchTo: (tab: Tab) => void
    table: () => Table<Person>
}

/** What each commit showed once the browser got to a microtask after it: the tab it was for and the header order. */
interface Frame {
    tab: Tab
    headers: string[]
}

const headerLabels = (): string[] =>
    [...document.querySelectorAll('thead th')].map((cell) => cell.textContent?.trim() ?? '').filter(Boolean)
const widthOf = (label: string): number => Number.parseFloat(headerCell(label).style.width)
const stored = (key: string): unknown => JSON.parse(localStorage.getItem(key) ?? 'null') as unknown

const TabbedTable = ({
    initial,
    onHarness,
    onFrame,
    ...props
}: Props & { initial: Tab; onHarness: (harness: Harness) => void; onFrame?: (frame: Frame) => void }): JSX.Element => {
    const [tab, setTab] = useState(initial)
    const tableRef = useRef<Table<Person> | null>(null)

    useLayoutEffect(() => {
        onHarness({ switchTo: (next) => setTimeout(() => setTab(next)), table: () => tableRef.current! })
    }, [onHarness])

    return (
        <>
            <StyledTable<Person>
                columns={tab.columns ?? personColumns}
                data={people}
                enableColumnResizing
                hideFooter
                initialState={tab.initialState}
                locale='en'
                persistSorting
                tableInstanceRef={tableRef}
                uniqueKey={tab.uniqueKey}
                persistColumnOrderKey={tab.orderKey}
                {...props}
            />
            <FrameProbe tab={tab} onFrame={onFrame} />
        </>
    )
}

/** Samples the header order from a microtask queued by a layout effect: after the commit and everything React runs
 * synchronously with it (a state update from a layout effect), before anything React schedules (passive effects). */
const FrameProbe = ({ tab, onFrame }: { tab: Tab; onFrame?: (frame: Frame) => void }): null => {
    useLayoutEffect(() => {
        queueMicrotask(() => onFrame?.({ tab, headers: headerLabels() }))

        // React's scheduler runs the passive effects of a commit in the same macrotask unless the commit used up its time
        // slice, and then the microtask above would see them already applied. A commit that takes longer than a slice (5 ms)
        // makes React yield before them, as a real page with a heavy tab does, so a plain effect shows as the flash it would be.
        if (onFrame) {
            const start = performance.now()

            while (performance.now() - start < 12) continue
        }
    })

    return null
}

const mountTabs = (props: Props & { initial?: Tab; onFrame?: (frame: Frame) => void } = {}) => {
    const { initial = TAB_A, ...rest } = props
    const api: { current: Harness | null } = { current: null }
    const onHarness = (next: Harness): void => {
        api.current = next
    }
    const view = mount(<TabbedTable initial={initial} onHarness={onHarness} {...rest} />)

    return {
        view,
        table: () => api.current!.table(),
        switchTo: (tab: Tab) => api.current!.switchTo(tab),
        /** The `<table>` element, to show a switch did not rebuild the table. */
        tableElement: () => view.container.querySelector('table')!,
    }
}

const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 100))

/** Every write and removal the storage saw, on any key: a tab switch must make none. */
const watchStorage = () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem')

    return { calls: (): unknown[][] => [...callsFor(setItem.mock.calls, /.*/), ...callsFor(removeItem.mock.calls, /.*/)] }
}

const snapshot = (): Record<string, string | null> =>
    Object.fromEntries(Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)]))

describe('StyledTable tab switch on one mounted table (ASMA-8698)', () => {
    beforeEach(() => localStorage.clear())
    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it('T-01: a switch brings in the new key\'s order, sort, widths and page size, and switching back restores the first', async () => {
        seedTabs()
        const before = snapshot()
        const { table, tableElement, switchTo } = mountTabs()
        const element = tableElement()

        await expect(headerLabels()).toEqual(['Role', 'Name', 'Age', 'Notes'])
        await expect(ariaSorts()['Name']).toBe('ascending')
        await expect(widthOf('Name')).toBe(240)
        await expect(table().getState().pagination.pageSize).toBe(10)

        const writes = watchStorage()

        switchTo(TAB_B)

        await waitFor(() => expect(headerLabels()).toEqual(['Age', 'Name', 'Role', 'Notes']))
        await expect(ariaSorts()).toMatchObject({ Age: 'descending', Name: 'none' })
        await waitFor(() => expect(widthOf('Name')).toBe(300))
        await expect(widthOf('Role')).toBe(220)
        await waitFor(() => expect(table().getState().pagination.pageSize).toBe(25))
        await expect(tableElement()).toBe(element)

        switchTo(TAB_A)

        await waitFor(() => expect(headerLabels()).toEqual(['Role', 'Name', 'Age', 'Notes']))
        await expect(ariaSorts()).toMatchObject({ Name: 'ascending', Age: 'none' })
        await waitFor(() => expect(widthOf('Name')).toBe(240))
        await waitFor(() => expect(table().getState().pagination.pageSize).toBe(10))
        await expect(tableElement()).toBe(element)

        await settle()
        await expect(writes.calls()).toEqual([])
        await expect(snapshot()).toEqual(before)
    })

    it('T-02: a tab with nothing saved shows the table\'s defaults, never the previous tab\'s settings', async () => {
        seedTabs()
        const { table, tableElement, switchTo } = mountTabs({ initialState: { sorting: DEFAULT_SORT }, pageSize: 20 })
        const element = tableElement()

        await expect(headerLabels()).toEqual(['Role', 'Name', 'Age', 'Notes'])
        // The saved sort beats the app's default, which a tab without one falls back to.
        await expect(ariaSorts()['Name']).toBe('ascending')
        const writes = watchStorage()

        switchTo(TAB_C)

        await waitFor(() => expect(headerLabels()).toEqual(DEFINITION_ORDER))
        await expect(ariaSorts()).toMatchObject({ Role: 'ascending', Name: 'none' })
        await waitFor(() => expect(widthOf('Name')).toBe(SORTABLE_160))
        await waitFor(() => expect(table().getState().pagination.pageSize).toBe(20))
        await expect(tableElement()).toBe(element)

        await settle()
        await expect(writes.calls()).toEqual([])
    })

    it('T-03: without a default sort, a tab with nothing saved is unsorted, not sorted like the previous tab', async () => {
        seedTabs()
        const { switchTo } = mountTabs()

        await expect(ariaSorts()['Name']).toBe('ascending')

        switchTo(TAB_C)

        await waitFor(() => expect(ariaSorts()).toMatchObject({ Name: 'none', Role: 'none', Age: 'none' }))
    })

    it('T-04: a reorder after a switch is saved under the new key only, and the old entry stays as it was', async () => {
        seedTabs()
        const { table, switchTo } = mountTabs()

        switchTo(TAB_B)
        await waitFor(() => expect(headerLabels()).toEqual(['Age', 'Name', 'Role', 'Notes']))
        await settle()

        const writes = watchStorage()
        table().setColumnOrder(['notes', 'age', 'role', 'name'])

        await waitFor(() => expect(stored(TAB_B.orderKey!)).toEqual(['notes', 'age', 'role', 'name']))
        await expect(stored(TAB_A.orderKey!)).toEqual(ORDER_A)
        await expect(callsFor(writes.calls(), TAB_A.orderKey!)).toHaveLength(0)
    })

    it('T-05: a tab with nothing saved takes the default order, and a reorder there is saved under its key only', async () => {
        seedTabs()
        const { table, switchTo } = mountTabs()

        switchTo(TAB_C)
        await waitFor(() => expect(headerLabels()).toEqual(DEFINITION_ORDER))
        await settle()
        await expect(localStorage.getItem(TAB_C.orderKey!)).toBeNull()

        table().setColumnOrder(['age', 'name', 'role', 'notes'])

        await waitFor(() => expect(stored(TAB_C.orderKey!)).toEqual(['age', 'name', 'role', 'notes']))
        await expect(stored(TAB_A.orderKey!)).toEqual(ORDER_A)
        await expect(stored(TAB_B.orderKey!)).toEqual(ORDER_B)
    })

    it('T-06: when the key goes away the order returns to the default and nothing is written; the key coming back reloads', async () => {
        seedTabs()
        const before = snapshot()
        const { switchTo } = mountTabs()

        await expect(headerLabels()).toEqual(['Role', 'Name', 'Age', 'Notes'])
        const writes = watchStorage()

        switchTo(NO_KEYS)
        await waitFor(() => expect(headerLabels()).toEqual(DEFINITION_ORDER))

        switchTo(TAB_B)
        await waitFor(() => expect(headerLabels()).toEqual(['Age', 'Name', 'Role', 'Notes']))

        await settle()
        await expect(writes.calls()).toEqual([])
        await expect(snapshot()).toEqual(before)
    })

    it('T-07: a key that arrives late loads that key\'s order', async () => {
        seedTabs()
        const { switchTo } = mountTabs({ initial: NO_KEYS })

        await expect(headerLabels()).toEqual(DEFINITION_ORDER)
        const writes = watchStorage()

        switchTo(TAB_A)

        await waitFor(() => expect(headerLabels()).toEqual(['Role', 'Name', 'Age', 'Notes']))
        await settle()
        await expect(writes.calls()).toEqual([])
    })

    // A timing guard, not the guarantee. The guarantee is structural: the order loads in a layout effect, and React flushes a
    // state update from a layout effect before the browser paints. A plain effect is only visible as a flash when React yields
    // between the commit and its passive effects, so this test makes the commit longer than a time slice (12 ms) and samples
    // from a microtask. It is a stress check: it depends on the scheduler, and may stop detecting a plain effect on a future
    // React. If it does, the structural argument above is what to re-check, not this test's timing.
    it('T-08: the old order is never what a commit with the new key shows (loaded in a layout effect, no flash)', async () => {
        seedTabs()
        const frames: Frame[] = []
        // Only the order key: the sort and width writers also load in a layout effect, and their update would flush a plain
        // effect of the order before the browser could paint, hiding the difference this test is about.
        const { switchTo } = mountTabs({
            enableColumnResizing: false,
            onFrame: (frame) => frames.push(frame),
            persistSorting: false,
            uniqueKey: undefined,
        })

        await expect(headerLabels()).toEqual(['Role', 'Name', 'Age', 'Notes'])
        frames.length = 0

        switchTo(TAB_B)
        await waitFor(() => expect(headerLabels()).toEqual(['Age', 'Name', 'Role', 'Notes']))

        const forB = frames.filter((frame) => frame.tab === TAB_B)

        await expect(forB.length).toBeGreaterThan(0)
        for (const frame of forB) await expect(frame.headers).toEqual(['Age', 'Name', 'Role', 'Notes'])
    })

    it('T-09: with initialState.columnOrder a switch shows what a fresh mount of that tab shows', async () => {
        seedTabs()
        const initialState = { columnOrder: ['notes', 'age', 'role', 'name'] }
        const { switchTo, view } = mountTabs({ initialState })

        // Legacy tables keep their order of precedence (REQ-08): the table's own order beats a saved one, on mount and on a switch.
        await expect(headerLabels()).toEqual(['Notes', 'Age', 'Role', 'Name'])
        switchTo(TAB_B)
        await settle()
        const switched = headerLabels()

        view.unmount()
        mountTabs({ initial: TAB_B, initialState })

        await expect(headerLabels()).toEqual(switched)
        await expect(switched).toEqual(['Notes', 'Age', 'Role', 'Name'])
    })

    it('T-12: a tab with other columns and defaults, switched in the same render as its keys, shows what a fresh mount of it shows', async () => {
        const extra: ColumnDef<Person> = { id: 'extra', header: 'Extra', size: 120 }
        // Saved under the tab's key: an id that is no column now ('gone') next to one only this tab has ('extra').
        const tabWithExtraColumn: Tab = {
            ...TAB_B,
            columns: [...personColumns, extra],
            initialState: { sorting: [{ id: 'age', desc: false }] },
        }
        seed(TAB_A, { order: ORDER_A })
        seed(TAB_B, { order: ['extra', 'gone', 'age'], sorting: [{ id: 'name', desc: true }] })
        const { switchTo, view } = mountTabs()
        const writes = watchStorage()

        await expect(headerLabels()).toEqual(['Role', 'Name', 'Age', 'Notes'])
        switchTo(tabWithExtraColumn)

        await waitFor(() => expect(headerLabels()).toContain('Extra'))
        await settle()
        const switched = { headers: headerLabels(), sorts: ariaSorts() }

        await expect(writes.calls()).toEqual([])

        view.unmount()
        mountTabs({ initial: tabWithExtraColumn })

        await expect({ headers: headerLabels(), sorts: ariaSorts() }).toEqual(switched)
        await expect(switched.headers[0]).toBe('Extra')
        await expect(switched.sorts['Name']).toBe('descending')
    })

    it('T-10: a table that opts out of saving the sort keeps its in-memory sort across a key switch (documents today)', async () => {
        seedTabs()
        const { switchTo } = mountTabs({ persistSorting: false, initialState: { sorting: DEFAULT_SORT } })

        await expect(ariaSorts()['Role']).toBe('ascending')
        await userEvent.click(sortButton('Age'))
        await expect(ariaSorts()).toMatchObject({ Age: 'descending', Role: 'none' })

        switchTo(TAB_B)
        await waitFor(() => expect(headerLabels()).toEqual(['Age', 'Name', 'Role', 'Notes']))
        await settle()

        // Saved sorting is ignored without `persistSorting` (D1), and nothing resets the in-memory one: the app must.
        await expect(ariaSorts()).toMatchObject({ Age: 'descending', Role: 'none' })
    })

    it('T-11: a controlled order is not set by a key change, and nothing is written', async () => {
        seedTabs()
        const writes = { current: [] as unknown[][] }
        const Controlled = (): JSX.Element => {
            const [tab, setTab] = useState(TAB_A)
            const [columnOrder, setColumnOrder] = useState(['name', 'role', 'age', 'notes'])

            return (
                <>
                    <button type='button' onClick={() => setTab(TAB_B)}>
                        Next tab
                    </button>
                    <StyledTable<Person>
                        columns={personColumns}
                        data={people}
                        hideFooter
                        locale='en'
                        onColumnOrderChange={(updater) =>
                            setColumnOrder((previous) => (typeof updater === 'function' ? updater(previous) : updater))
                        }
                        persistColumnOrderKey={tab.orderKey}
                        state={{ columnOrder }}
                        uniqueKey={tab.uniqueKey}
                    />
                </>
            )
        }

        mount(<Controlled />)
        const setItem = vi.spyOn(Storage.prototype, 'setItem')
        const removeItem = vi.spyOn(Storage.prototype, 'removeItem')

        await userEvent.click([...document.querySelectorAll('button')].find((button) => button.textContent === 'Next tab')!)
        await settle()

        writes.current = [...callsFor(setItem.mock.calls, /.*/), ...callsFor(removeItem.mock.calls, /.*/)]
        await expect(headerLabels()).toEqual(['Name', 'Role', 'Age', 'Notes'])
        await expect(writes.current).toEqual([])
    })
})
