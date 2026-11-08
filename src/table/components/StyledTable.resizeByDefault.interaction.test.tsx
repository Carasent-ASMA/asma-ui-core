import type { ColumnDef, Table } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { callsFor, headerCell, people, personColumns, sortButton, type Person } from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'
import type { StyledTableProps } from '../types'

/**
 * Resizing in every table, and +20 px for sortable columns (ASMA-8597, UX round 4, P2e: D15, D16, D17, DEC-NARROW,
 * DEC-D16-OPTOUTS; U-R01 to U-R12 and ST-18 to ST-20). Asserted on a real table in a real browser: the widths are the
 * `th` widths a user sees, and the handles are the ones a user can grab.
 *
 * The fixture's columns declare Name 160, Role 160, Age 120 (all sortable) and Notes 120 (cannot sort, the last data
 * column). With D16 they open at 180, 180, 140 and 120.
 */

const KEY = 'resize-default'
const SIZING_KEY = `${KEY}:column-sizing`
const NAME = 180
const ROLE = 180

type TableProps = Partial<Omit<StyledTableProps<Person, Record<string, unknown>>, 'footer' | 'hideFooter'>> & {
    setData?: (callback: (data: Person[]) => Person[]) => void
}

const widthOf = (label: string): number => Number.parseFloat(headerCell(label).style.width)
const handle = (label: string): HTMLElement | null => headerCell(label).querySelector<HTMLElement>('[class*="resizer"]')
const hasHandle = (label: string): boolean => handle(label) !== null
const stored = (key: string): unknown => JSON.parse(localStorage.getItem(key) ?? 'null') as unknown

const mountTable = (props: TableProps = {}) => {
    const ref: { current: Table<Person> | null } = { current: null }
    const view = mount(
        <StyledTable<Person>
            columns={personColumns}
            data={people}
            hideFooter
            locale='en'
            columnResizeMode='onChange'
            tableInstanceRef={ref}
            {...props}
        />,
    )

    return { ref, view, table: (): Table<Person> => ref.current! }
}

const mouse = (type: string, target: EventTarget, clientX: number): void => {
    target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX, view: window }))
}
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 30))

/** Drags a column's handle by `delta` px in three moves, then ends the drag the way a real one ends. */
const drag = async (label: string, delta: number): Promise<void> => {
    const grip = handle(label)!
    const start = Math.round(grip.getBoundingClientRect().left)

    mouse('mousedown', grip, start)
    for (let step = 1; step <= 3; step += 1) {
        mouse('mousemove', document, start + Math.round((delta * step) / 3))
        // React flushes updates from a native document listener asynchronously.
        await settle()
    }
    mouse('mouseup', document, start + delta)
    await settle()
    // A real drag ends with a click on the handle; without it the next header click would be swallowed.
    mouse('click', grip, start + delta)
    await settle()
}

/** Which header columns have a handle, by column id, read from the table and the DOM in the same order. */
const handlesByColumn = (table: Table<Person>): Record<string, boolean> => {
    const headers = table.getHeaderGroups()[0]!.headers
    const cells = [...document.querySelectorAll<HTMLElement>('thead th')]

    return Object.fromEntries(
        headers.map((header, index) => [header.column.id, cells[index]!.querySelector('[class*="resizer"]') !== null]),
    )
}

const parkPointer = async (): Promise<void> => {
    const parking = document.createElement('button')

    parking.type = 'button'
    parking.setAttribute('aria-label', 'parking')
    parking.style.cssText = 'position:fixed;right:0;bottom:0;width:40px;height:40px;opacity:0.01'
    document.body.appendChild(parking)
    await userEvent.hover(parking)
    parking.remove()
}

beforeEach(() => localStorage.clear())
afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
})

describe('D15: resizing is on in every table', () => {
    it('U-R01: a table that does not pass enableColumnResizing is resizable, and its data columns have handles', async () => {
        const { table } = mountTable()

        await expect(table().options.enableColumnResizing).toBe(true)
        await expect(hasHandle('Name')).toBe(true)
        await expect(hasHandle('Role')).toBe(true)
        await expect(hasHandle('Age')).toBe(true)
        cleanup()

        // A prop that is there but undefined (a wrapper that forwards its own optional prop) is the same as no prop.
        const forwarded = mountTable({ enableColumnResizing: undefined })

        await expect(forwarded.table().options.enableColumnResizing).toBe(true)
        await expect(hasHandle('Name')).toBe(true)
        cleanup()
        mountTable()

        // Dragging a handle changes the width.
        await drag('Name', 40)
        await expect(widthOf('Name')).toBe(NAME + 40)
    })

    it('U-R01 / OQ-16: the last data column has no handle and keeps filling the remaining width', async () => {
        mountTable()

        await expect(hasHandle('Notes')).toBe(false)
        await expect(headerCell('Notes').style.width).toBe('100%')
    })

    it('U-R02: enableColumnResizing={false} turns resizing off: no handle, and no :column-sizing read or write', async () => {
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: 240 }))
        const getItem = vi.spyOn(Storage.prototype, 'getItem')
        const setItem = vi.spyOn(Storage.prototype, 'setItem')
        const { table } = mountTable({ enableColumnResizing: false, uniqueKey: KEY })

        await expect(table().options.enableColumnResizing).toBe(false)
        for (const label of ['Name', 'Role', 'Age', 'Notes']) await expect(hasHandle(label), label).toBe(false)
        // Saved widths are not applied either: the table does not resize, and does not save.
        await expect(widthOf('Name')).toBe(NAME)
        await expect(callsFor(getItem.mock.calls, SIZING_KEY)).toHaveLength(0)
        await expect(callsFor(setItem.mock.calls, /:column-sizing$/)).toHaveLength(0)
    })

    it('U-R03: ui-core\'s own columns have no handle: select, expand, actions (the pin)', async () => {
        const { table } = mountTable({
            enableRowSelection: true,
            expandArrow: true,
            initialState: { columnVisibility: { select: true } },
        })

        const handles = handlesByColumn(table())

        await expect(Object.keys(handles)).toEqual(expect.arrayContaining(['select', 'expand-column-id', 'actions']))
        for (const id of ['select', 'expand-column-id', 'actions']) await expect(handles[id], id).toBe(false)
        await expect(handles['name']).toBe(true)
    })

    it('U-R03: the drag handle and the show-full-text column have none either', async () => {
        const dnd = mountTable({ enableDnd: true, setData: () => undefined })

        await expect(handlesByColumn(dnd.table())['dnd-handle']).toBe(false)
        await expect(handlesByColumn(dnd.table())['name']).toBe(true)
        cleanup()

        const text = mountTable({ textExpandArrow: true })

        await expect(handlesByColumn(text.table())['show-full-text']).toBe(false)
        await expect(handlesByColumn(text.table())['name']).toBe(true)
    })
})

describe('OQ-15 and DEC-D16-OPTOUTS: the apps\' opt-outs keep no handle, and still take the +20', () => {
    // An app's own columns: a sortable opt-out, a sortable fixed width with no flag (min === max), a non-sortable
    // opt-out, the care receiver bar's drag column (no accessor, 78 fixed) and the calendar's `unread-badge` (10/10/10).
    const optOutColumns: ColumnDef<Person>[] = [
        { accessorKey: 'name', header: 'Name', size: 160 },
        { accessorKey: 'role', header: 'Role', size: 160, enableResizing: false },
        { accessorKey: 'age', header: 'Age', size: 50, minSize: 50, maxSize: 50 },
        { id: 'status', header: 'Status', size: 60, enableResizing: false },
        { id: 'drag', header: 'Drag', size: 78, minSize: 78, maxSize: 78 },
        { id: 'unread-badge', header: 'Unread', accessorFn: (row) => row.id, size: 10, minSize: 10, maxSize: 10, enableResizing: false },
        { id: 'notes', header: 'Notes', size: 120 },
    ]

    it('U-R04: a column with enableResizing: false, and one with minSize === maxSize and no flag, have no handle', async () => {
        const { table } = mountTable({ columns: optOutColumns })
        const handles = handlesByColumn(table())

        await expect(handles['name']).toBe(true)
        for (const id of ['role', 'age', 'status', 'drag', 'unread-badge']) await expect(handles[id], id).toBe(false)
    })

    it('U-R04 / U-R07: their widths still take D16: a sortable opt-out grows and stays fixed, a non-sortable one keeps its width', async () => {
        mountTable({ columns: optOutColumns })

        await expect(widthOf('Name')).toBe(NAME)
        // Sortable opt-outs: +20.
        await expect(widthOf('Role')).toBe(180)
        await expect(widthOf('Age')).toBe(70)
        await expect(widthOf('Unread')).toBe(30)
        // No accessor, or sorting off: unchanged.
        await expect(widthOf('Status')).toBe(60)
        await expect(widthOf('Drag')).toBe(78)
    })
})

describe('DEC-NARROW: a narrow column keeps its declared width as its minimum', () => {
    const narrowColumns: ColumnDef<Person>[] = [
        { id: 'narrow', header: 'Narrow', size: 60 },
        { accessorKey: 'name', header: 'Name', size: 60 },
        { accessorKey: 'role', header: 'Role', size: 60, minSize: 40 },
        { accessorKey: 'age', header: 'Age' },
        { id: 'notes', header: 'Notes', size: 120 },
    ]

    it('U-R05: a non-sortable size 60 renders at 60 and a sortable one at 80, not clamped up to 100', async () => {
        const { table } = mountTable({ columns: narrowColumns })

        await expect(widthOf('Narrow')).toBe(60)
        await expect(table().getColumn('narrow')!.columnDef.minSize).toBe(60)
        await expect(widthOf('Name')).toBe(80)
        await expect(table().getColumn('name')!.columnDef.minSize).toBe(80)
    })

    it('U-R05: a column with its own minSize keeps it (+20 if sortable); one without a size keeps the 100 px minimum', async () => {
        const { table } = mountTable({ columns: narrowColumns })

        await expect(table().getColumn('role')!.columnDef.minSize).toBe(60)
        // No size: TanStack's 150, +20, and a minimum of 100 (ui-core's own minimum does not grow).
        await expect(widthOf('Age')).toBe(170)
        await expect(table().getColumn('age')!.columnDef.minSize).toBe(100)
    })

    it('U-R05: dragging a narrow column smaller stops at its declared width', async () => {
        mountTable({ columns: narrowColumns })

        await drag('Narrow', -50)
        await expect(widthOf('Narrow')).toBe(60)
        await drag('Name', -50)
        await expect(widthOf('Name')).toBe(80)
    })
})

describe('D16: +20 px for a sortable data column', () => {
    it('U-R06: a sortable column with size 120 opens at 140; one without a size at 170; the table\'s defaultColumn size + 20', async () => {
        const sized = mountTable({
            columns: [
                { accessorKey: 'name', header: 'Name', size: 120 },
                { accessorKey: 'role', header: 'Role' },
                { id: 'notes', header: 'Notes', size: 120 },
            ],
        })

        await expect(widthOf('Name')).toBe(140)
        await expect(widthOf('Role')).toBe(170)
        sized.view.unmount()

        mountTable({
            columns: [
                { accessorKey: 'name', header: 'Name' },
                { id: 'notes', header: 'Notes', size: 120 },
            ],
            defaultColumn: { size: 200 },
        })
        await expect(widthOf('Name')).toBe(220)
    })

    it('U-R06: minSize and maxSize, when set, grow by 20 too', async () => {
        const { table } = mountTable({
            columns: [
                { accessorKey: 'name', header: 'Name', size: 120, minSize: 80, maxSize: 300 },
                { id: 'notes', header: 'Notes', size: 120 },
            ],
        })
        const name = table().getColumn('name')!.columnDef

        await expect([name.size, name.minSize, name.maxSize]).toEqual([140, 100, 320])
    })

    it('U-R07: columns that cannot sort, ui-core\'s own columns and group headers keep their widths', async () => {
        const plain = mountTable({
            columns: [
                { accessorKey: 'name', header: 'Name', size: 120, enableSorting: false },
                { id: 'free', header: 'Free', size: 90 },
                { id: 'notes', header: 'Notes', size: 120 },
            ],
            enableRowSelection: true,
            initialState: { columnVisibility: { select: true } },
        })

        await expect(widthOf('Name')).toBe(120)
        await expect(widthOf('Free')).toBe(90)
        // The select column keeps its 38 px.
        await expect(plain.table().getColumn('select')!.getSize()).toBe(38)
        plain.view.unmount()

        // The table's own enableSorting={false}: nothing sorts, so nothing grows.
        mountTable({ enableSorting: false })
        await expect(widthOf('Name')).toBe(160)
        await expect(widthOf('Age')).toBe(120)
    })

    it('U-R07: the leaves of a group header grow when sortable; the group follows its leaves', async () => {
        mountTable({
            columns: [
                {
                    header: 'Group',
                    columns: [
                        { accessorKey: 'name', header: 'Name', size: 120 },
                        { id: 'free', header: 'Free', size: 90 },
                    ],
                },
                { id: 'notes', header: 'Notes', size: 120 },
            ],
        })

        await expect(widthOf('Name')).toBe(140)
        await expect(widthOf('Free')).toBe(90)
    })

    it('U-R08: a saved width is applied as saved, without the +20; Reset returns to the new default and removes the entry', async () => {
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: 240 }))
        const { table } = mountTable({ enableColumnResizing: true, uniqueKey: KEY })

        await expect(widthOf('Name')).toBe(240)
        table().resetColumnSettings()
        await settle()
        await expect(widthOf('Name')).toBe(NAME)
        await expect(localStorage.getItem(SIZING_KEY)).toBeNull()
    })

    it('U-R10 (DEC-D16): an app\'s initialState.columnSizing and a controlled state.columnSizing win over the defaults', async () => {
        const initial = mountTable({ initialState: { columnSizing: { name: 300 } } })

        await expect(widthOf('Name')).toBe(300)
        initial.view.unmount()

        mountTable({ state: { columnSizing: { name: 310 } }, onColumnSizingChange: () => undefined })
        await expect(widthOf('Name')).toBe(310)
        // The other columns still take the default.
        await expect(widthOf('Role')).toBe(ROLE)
    })

    // The rule is on the whole state: `usePersistedStateWriter` removes the entry when the state equals the app's default
    // (`initialState.columnSizing`, here `{}`) and writes it otherwise. It does not compare each column with its own width.
    it('U-R11: a double-click on each changed handle, and Reset columns, bring the state back to the default and remove the entry', async () => {
        const { table } = mountTable({ enableColumnResizing: true, uniqueKey: KEY })

        await drag('Name', 60)
        await drag('Role', 30)
        await expect(widthOf('Name')).toBe(NAME + 60)
        await expect(stored(SIZING_KEY)).toEqual({ name: NAME + 60, role: ROLE + 30 })

        // One column is back to size + 20, the other is still changed: the entry stays, with that column only.
        mouse('dblclick', handle('Name')!, 0)
        await settle()
        await expect(widthOf('Name')).toBe(NAME)
        await expect(stored(SIZING_KEY)).toEqual({ role: ROLE + 30 })

        // The last changed column is back: the state is the default, and the entry is removed.
        mouse('dblclick', handle('Role')!, 0)
        await settle()
        await expect(widthOf('Role')).toBe(ROLE)
        await expect(localStorage.getItem(SIZING_KEY)).toBeNull()

        // Reset columns does the same for several changed columns at once.
        await drag('Name', 40)
        await drag('Age', 20)
        await expect(stored(SIZING_KEY)).toEqual({ name: NAME + 40, age: 140 + 20 })
        table().resetColumnSettings()
        await settle()
        await expect(widthOf('Name')).toBe(NAME)
        await expect(widthOf('Age')).toBe(140)
        await expect(localStorage.getItem(SIZING_KEY)).toBeNull()
    })

    it('U-R11: a mouse drag that lands exactly on the default width (size + 20) writes an explicit entry: the rule compares the whole state, not each column', async () => {
        mountTable({ enableColumnResizing: true, uniqueKey: KEY })

        await drag('Name', 60)
        await drag('Name', -60)

        // Back at the default width, but by a drag: the state is `{ name: 180 }`, not `{}`, so it is written.
        await expect(widthOf('Name')).toBe(NAME)
        await expect(stored(SIZING_KEY)).toEqual({ name: NAME })
    })
})

describe('U-R13: a column group', () => {
    const groupColumns: ColumnDef<Person>[] = [
        {
            header: 'Group',
            columns: [
                { accessorKey: 'name', header: 'Name', size: 120 },
                { accessorKey: 'role', header: 'Role', size: 120 },
            ],
        },
        { id: 'notes', header: 'Notes', size: 120 },
    ]

    it("U-R13: the group's header shows a handle, and dragging it resizes its leaves; the group gets no +20 of its own and its span follows its leaves", async () => {
        const { table } = mountTable({ columns: groupColumns })

        // Two sortable 120 px leaves: 140 + 140 = 280. The group has no size of its own, so nothing is added to it.
        await expect(widthOf('Name')).toBe(140)
        await expect(widthOf('Role')).toBe(140)
        await expect(widthOf('Group')).toBe(280)
        // TanStack's own default (150) for a definition with no size; nothing is added.
        await expect(table().getColumn('Group')!.columnDef.size).toBe(150)

        // TanStack's own behaviour, which a table that already resized has always had: the group has a handle, and
        // dragging it spreads the change over its leaves by their share.
        await expect(hasHandle('Group')).toBe(true)
        await drag('Group', 40)
        await expect(widthOf('Name')).toBe(160)
        await expect(widthOf('Role')).toBe(160)
        await expect(widthOf('Group')).toBe(320)
    })
})

describe('U-R14 (RISK-27): a narrow sortable column crosses the compact-padding threshold', () => {
    const paddingOf = (label: string): string =>
        getComputedStyle(headerCell(label).querySelector('[class*="show-table-header"]')!).paddingLeft
    /** The padding of the column's body cell: the `td` in the same position as the header cell (`TableRow.tsx`). */
    const bodyPaddingOf = (label: string): string => {
        const position = [...document.querySelectorAll('thead th')].indexOf(headerCell(label))

        return getComputedStyle(document.querySelectorAll('tbody tr')[0]!.children[position]!).paddingLeft
    }

    it('U-R14: a sortable column declared at 50 px opens at 70 and takes the data-cell padding; a non-sortable 50 px column keeps the compact padding', async () => {
        mountTable({
            columns: [
                { id: 'first', header: 'First', size: 120, enableSorting: false },
                { accessorKey: 'name', header: 'Sortable 50', size: 50 },
                { id: 'plain', header: 'Plain 50', size: 50 },
                { id: 'notes', header: 'Notes', size: 120 },
            ],
        })

        // 70 px is above the 64 px compact limit (`COMPACT_COLUMN_MAX_WIDTH`), so it is a data cell: 10 px.
        await expect(widthOf('Sortable 50')).toBe(70)
        await expect(paddingOf('Sortable 50')).toBe('10px')
        await expect(bodyPaddingOf('Sortable 50')).toBe('10px')
        await expect(widthOf('Plain 50')).toBe(50)
        await expect(paddingOf('Plain 50')).toBe('5px')
        await expect(bodyPaddingOf('Plain 50')).toBe('5px')
    })

    it('U-R14: a sortable column declared at 44 px opens at 64 px, still within the limit, and keeps the compact padding', async () => {
        mountTable({
            columns: [
                { id: 'first', header: 'First', size: 120, enableSorting: false },
                { accessorKey: 'name', header: 'Sortable 44', size: 44 },
                { id: 'notes', header: 'Notes', size: 120 },
            ],
        })

        await expect(widthOf('Sortable 44')).toBe(64)
        await expect(paddingOf('Sortable 44')).toBe('5px')
        await expect(bodyPaddingOf('Sortable 44')).toBe('5px')
    })
})

describe('D17: a table saves widths only when it sets enableColumnResizing itself', () => {
    it('U-R09: a table that gets resizing from the default resizes but neither reads nor writes :column-sizing, and its Reset touches no storage', async () => {
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: 240 }))
        const getItem = vi.spyOn(Storage.prototype, 'getItem')
        const setItem = vi.spyOn(Storage.prototype, 'setItem')
        const removeItem = vi.spyOn(Storage.prototype, 'removeItem')
        const { table } = mountTable({ uniqueKey: KEY })

        // Resizes, in memory.
        await drag('Role', 30)
        await expect(widthOf('Role')).toBe(ROLE + 30)
        table().resetColumnSettings()
        await settle()
        await expect(widthOf('Role')).toBe(ROLE)

        await expect(callsFor(getItem.mock.calls, SIZING_KEY)).toHaveLength(0)
        await expect(callsFor(setItem.mock.calls, /:column-sizing$/)).toHaveLength(0)
        await expect(callsFor(removeItem.mock.calls, /:column-sizing$/)).toHaveLength(0)
    })

    it('U-R09: with enableColumnResizing set explicitly to true it reads and writes as before, and Reset removes the entry', async () => {
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: 240 }))
        const getItem = vi.spyOn(Storage.prototype, 'getItem')
        const { table } = mountTable({ enableColumnResizing: true, uniqueKey: KEY })

        await expect(callsFor(getItem.mock.calls, SIZING_KEY).length).toBeGreaterThan(0)
        await drag('Role', 30)
        await expect(stored(SIZING_KEY)).toEqual({ name: 240, role: ROLE + 30 })
        table().resetColumnSettings()
        await settle()
        await expect(localStorage.getItem(SIZING_KEY)).toBeNull()
    })

    it('U-R12: an entry saved earlier is applied when the table sets enableColumnResizing; with only the default it is ignored and left in place', async () => {
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: 240 }))
        const saving = mountTable({ enableColumnResizing: true, uniqueKey: KEY })

        await expect(widthOf('Name')).toBe(240)
        saving.view.unmount()

        const entry = localStorage.getItem(SIZING_KEY)
        const { table } = mountTable({ uniqueKey: KEY })

        // The default width, not the saved 240.
        await expect(widthOf('Name')).toBe(NAME)
        await drag('Name', 20)
        table().resetColumnSettings()
        await settle()
        // And the entry is exactly as it was: not read, not rewritten, not removed.
        await expect(localStorage.getItem(SIZING_KEY)).toBe(entry)
    })

    it('ST-18: with a uniqueKey and no enableColumnResizing a dragged width does not survive a remount; with it, it does', async () => {
        const defaulted = mountTable({ uniqueKey: KEY })

        await drag('Name', 50)
        await expect(widthOf('Name')).toBe(NAME + 50)
        defaulted.view.unmount()
        mountTable({ uniqueKey: KEY })
        await expect(widthOf('Name')).toBe(NAME)
        cleanup()

        const saved = mountTable({ uniqueKey: KEY, enableColumnResizing: true })

        await drag('Name', 50)
        saved.view.unmount()
        mountTable({ uniqueKey: KEY, enableColumnResizing: true })
        await expect(widthOf('Name')).toBe(NAME + 50)
    })
})

describe('ST-19: +20 px measured as the user sees it', () => {
    it('ST-19: 140 px for a sortable size 120 column, unchanged for a non-sortable one, and the saved width when one is saved', async () => {
        localStorage.setItem(SIZING_KEY, JSON.stringify({ role: 260 }))
        mountTable({
            enableColumnResizing: true,
            uniqueKey: KEY,
            columns: [
                { accessorKey: 'name', header: 'Name', size: 120 },
                { accessorKey: 'role', header: 'Role', size: 120 },
                { id: 'free', header: 'Free', size: 120 },
                { id: 'notes', header: 'Notes', size: 120 },
            ],
        })

        await expect(widthOf('Name')).toBe(140)
        await expect(widthOf('Free')).toBe(120)
        await expect(widthOf('Role')).toBe(260)
    })
})

describe('ST-20: the sort triangle fits its 20 px slot', () => {
    beforeEach(parkPointer)

    const indicator = (label: string): HTMLElement => headerCell(label).querySelector<HTMLElement>('[data-sort-state]')!
    /** The glyph the user sees: the one that is visible, and the triangle it draws (the path's own box). */
    const triangle = (label: string): DOMRect => {
        const glyph = [...indicator(label).querySelectorAll<SVGElement>('svg')].find(
            (svg) => getComputedStyle(svg).visibility === 'visible',
        )

        if (!glyph) throw new Error(`Header "${label}" shows no triangle`)

        return glyph.querySelector('path')!.getBoundingClientRect()
    }
    const intersects = (left: DOMRect, right: DOMRect): boolean =>
        left.left < right.right - 0.5 && left.right > right.left + 0.5

    /** Slot exactly 20 px, triangle at most 20 px wide and inside the slot, and clear of the label and the resize zone. */
    const expectFits = async (label: string): Promise<void> => {
        const slot = indicator(label).getBoundingClientRect()
        const mark = triangle(label)
        const text = headerCell(label).querySelector<HTMLElement>('[class*="header-content"]')!.getBoundingClientRect()
        const zone = handle(label)?.getBoundingClientRect()

        await expect(slot.width, `${label}: slot`).toBe(20)
        await expect(mark.width, `${label}: triangle width`).toBeLessThanOrEqual(20)
        await expect(mark.width).toBeGreaterThan(0)
        await expect(mark.left).toBeGreaterThanOrEqual(slot.left - 0.5)
        await expect(mark.right).toBeLessThanOrEqual(slot.right + 0.5)
        await expect(intersects(mark, text), `${label}: triangle and label`).toBe(false)
        if (zone) await expect(intersects(mark, zone), `${label}: triangle and resize zone`).toBe(false)
    }

    const columns: ColumnDef<Person>[] = [
        { accessorKey: 'name', header: 'Name', size: 120 },
        { accessorKey: 'role', header: 'An extremely long column label that cannot possibly fit here', size: 100 },
        { accessorKey: 'age', header: 'Age', size: 120 },
        { id: 'notes', header: 'Notes', size: 120 },
    ]

    it('ST-20: sorted, hovered and keyboard-focused, with a short label and with a truncated one', async () => {
        const LONG = 'An extremely long column label that cannot possibly fit here'

        mountTable({ columns, initialState: { sorting: [{ id: 'name', desc: false }] } })

        // Sorted, at rest.
        await expectFits('Name')

        // Hovered: an unsorted column shows its preview triangle, in its 20 px slot.
        await userEvent.hover(sortButton('Age'))
        await expectFits('Age')
        await userEvent.hover(sortButton(LONG))
        await expectFits(LONG)
        await userEvent.unhover(sortButton(LONG))

        // Keyboard-focused.
        await userEvent.keyboard('{Shift}')
        sortButton('Age').focus()
        await expect(sortButton('Age').matches(':focus-visible')).toBe(true)
        await expectFits('Age')
        sortButton('Age').blur()
    })
})
