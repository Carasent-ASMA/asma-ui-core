import type { Table } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { expect, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { callsFor, headerCell, people, personColumns, type Person } from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'
import type { StyledTableProps } from '../types'

/**
 * Saved column widths (ASMA-8597, REQ-003, REQ-004, REQ-005): the legacy flat `:column-sizing` map keeps
 * loading, bad values are dropped, nothing is written on mount or during a drag, and a key change loads the
 * new key's widths instead of copying the old ones over it.
 */

const KEY = 'sizing-table'
const SIZING_KEY = `${KEY}:column-sizing`
const OTHER_KEY = 'other-sizing-table'
const OTHER_SIZING_KEY = `${OTHER_KEY}:column-sizing`

type Props = Partial<Omit<StyledTableProps<Person, Record<string, unknown>>, 'footer' | 'hideFooter'>>

const SizedTable = (props: Props): JSX.Element => (
    <StyledTable<Person>
        columns={personColumns}
        data={people}
        enableColumnResizing
        hideFooter
        locale='en'
        uniqueKey={KEY}
        {...props}
    />
)

const widthOf = (label: string): number => Number.parseFloat(headerCell(label).style.width)
const stored = (key: string): unknown => JSON.parse(localStorage.getItem(key) ?? 'null') as unknown
/** Whether the saved width map for `key` holds a number for column `id`. */
const hasSavedWidth = (key: string, id: string): boolean =>
    typeof (stored(key) as Record<string, unknown> | null)?.[id] === 'number'
const resizer = (label: string): HTMLElement => headerCell(label).querySelector<HTMLElement>('[class*="resizer"]')!

const mouse = (type: string, target: EventTarget, clientX: number): void => {
    target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX, view: window }))
}

const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 30))

/** Drags a column's handle by `delta` px in three moves, calling `duringDrag` after each one has rendered. */
const drag = async (label: string, delta: number, duringDrag: () => void = () => undefined): Promise<void> => {
    const handle = resizer(label)
    const start = Math.round(handle.getBoundingClientRect().left)

    mouse('mousedown', handle, start)
    for (let step = 1; step <= 3; step += 1) {
        mouse('mousemove', document, start + Math.round((delta * step) / 3))
        // React flushes updates from a native document listener asynchronously.
        await settle()
        duringDrag()
    }
    mouse('mouseup', document, start + delta)
    await settle()
}

describe('StyledTable saved column widths', () => {
    beforeEach(() => localStorage.clear())
    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it('U-W01 / ST-08: a legacy flat width map still loads (AC 4)', async () => {
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: 240, role: 200 }))

        mount(<SizedTable />)

        await expect(widthOf('Name')).toBe(240)
        await expect(widthOf('Role')).toBe(200)
        await expect(widthOf('Age')).toBe(120)
    })

    it('U-W02 / ST-08: a legacy entry with an id that matches no column: known widths apply, the unknown id stays in the state and the next write, has no visible effect and no error (AC 4, AC 7)', async () => {
        const output = ['error', 'warn'].map((method) => vi.spyOn(console, method as 'error'))
        const seeded = JSON.stringify({ name: 240, 'column-that-was-removed': 500 })
        let table: Table<Person> | null = null
        const ref = {
            get current() {
                return table
            },
            set current(value: Table<Person> | null) {
                table = value
            },
        }

        localStorage.setItem(SIZING_KEY, seeded)

        mount(<SizedTable columnResizeMode='onChange' tableInstanceRef={ref} />)

        // Known widths apply; the unknown id changes nothing on screen.
        await expect(widthOf('Name')).toBe(240)
        await expect(widthOf('Role')).toBe(160)
        await expect(widthOf('Age')).toBe(120)
        // It is kept: in the table state, and in the entry (mounting writes nothing).
        await expect(table!.getState().columnSizing).toEqual({ name: 240, 'column-that-was-removed': 500 })
        await expect(localStorage.getItem(SIZING_KEY)).toBe(seeded)

        // The next write carries it along.
        await drag('Role', 40)
        await waitFor(() => expect(hasSavedWidth(SIZING_KEY, 'role')).toBe(true))
        await expect(stored(SIZING_KEY)).toMatchObject({ name: 240 })
        await expect((stored(SIZING_KEY) as Record<string, unknown>)['column-that-was-removed']).toBe(500)
        await expect(table!.getState().columnSizing['column-that-was-removed']).toBe(500)
        for (const spy of output) await expect(spy).not.toHaveBeenCalled()
    })

    it('U-W03: NaN-like, zero, negative and non-number values are dropped, the valid rest is kept', async () => {
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: -5, role: '200', age: 150, notes: 0 }))

        mount(<SizedTable />)

        await expect(widthOf('Name')).toBe(160)
        await expect(widthOf('Role')).toBe(160)
        await expect(widthOf('Age')).toBe(150)
    })

    it('U-W05: mounting writes nothing', async () => {
        const setItem = vi.spyOn(Storage.prototype, 'setItem')
        const removeItem = vi.spyOn(Storage.prototype, 'removeItem')

        mount(<SizedTable />)
        await new Promise((resolve) => setTimeout(resolve, 100))

        await expect(callsFor(setItem.mock.calls, SIZING_KEY)).toHaveLength(0)
        await expect(callsFor(removeItem.mock.calls, SIZING_KEY)).toHaveLength(0)
    })

    it('U-W04 / U-W08: nothing is written during a drag, one flat map when it ends (AC 10)', async () => {
        const setItem = vi.spyOn(Storage.prototype, 'setItem')

        mount(<SizedTable columnResizeMode='onChange' />)

        let writesDuringDrag = 0
        let widthChangedDuringDrag = false

        await drag('Name', 80, () => {
            writesDuringDrag += callsFor(setItem.mock.calls, SIZING_KEY).length
            widthChangedDuringDrag ||= widthOf('Name') !== 160
        })

        await waitFor(() => expect(callsFor(setItem.mock.calls, SIZING_KEY)).toHaveLength(1))

        await expect(widthChangedDuringDrag, 'the column followed the pointer').toBe(true)
        await expect(writesDuringDrag, 'no write while dragging').toBe(0)

        const value = stored(SIZING_KEY) as Record<string, unknown>

        // U-W08: a flat { "<columnId>": <number> } map, unversioned, with no wrapper.
        await expect(Object.keys(value)).not.toContain('v')
        await expect(Object.values(value).every((width) => typeof width === 'number')).toBe(true)
        await expect(Object.keys(value)).toContain('name')
        await expect(value['name']).toBe(widthOf('Name'))
    })

    it('U-W06: widths are only saved with enableColumnResizing and a uniqueKey', async () => {
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: 240 }))
        const getItem = vi.spyOn(Storage.prototype, 'getItem')
        const setItem = vi.spyOn(Storage.prototype, 'setItem')

        const withoutResizing = mount(<SizedTable enableColumnResizing={false} />)
        await expect(widthOf('Name')).toBe(160)
        withoutResizing.unmount()

        mount(<SizedTable uniqueKey={undefined} />)
        await expect(widthOf('Name')).toBe(160)

        await expect(callsFor(getItem.mock.calls, SIZING_KEY)).toHaveLength(0)
        await expect(callsFor(setItem.mock.calls, /:column-sizing$/)).toHaveLength(0)
    })

    it('U-W07: saved widths merge over the app\'s initialState.columnSizing', async () => {
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: 240 }))

        mount(<SizedTable initialState={{ columnSizing: { name: 150, role: 200 } }} />)

        await expect(widthOf('Name')).toBe(240)
        await expect(widthOf('Role')).toBe(200)
    })

    it('U-C01 / U-C02: a width that differs from the default is written, and back to the default removes the entry', async () => {
        mount(<SizedTable columnResizeMode='onChange' />)

        await drag('Name', 60)
        await waitFor(() => expect(hasSavedWidth(SIZING_KEY, 'name')).toBe(true))

        // Double-click on the handle resets the column's width: the state is the default again.
        mouse('dblclick', resizer('Name'), 0)

        await waitFor(() => expect(localStorage.getItem(SIZING_KEY)).toBeNull())
        await expect(widthOf('Name')).toBe(160)
    })
})

describe('StyledTable saved column widths: key change (AC 14)', () => {
    beforeEach(() => localStorage.clear())
    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it('U-K02 / U-K03 / ST-07: loads the new key\'s widths and leaves both entries byte-identical', async () => {
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: 240 }))
        localStorage.setItem(OTHER_SIZING_KEY, JSON.stringify({ name: 300, role: 220 }))
        const before = { a: localStorage.getItem(SIZING_KEY), b: localStorage.getItem(OTHER_SIZING_KEY) }
        const view = mount(<SizedTable />)

        await expect(widthOf('Name')).toBe(240)

        view.rerender(<SizedTable uniqueKey={OTHER_KEY} />)

        await waitFor(() => expect(widthOf('Name')).toBe(300))
        await expect(widthOf('Role')).toBe(220)
        await new Promise((resolve) => setTimeout(resolve, 100))
        await expect({ a: localStorage.getItem(SIZING_KEY), b: localStorage.getItem(OTHER_SIZING_KEY) }).toEqual(before)
    })

    it('U-K01: nothing is written or removed under the new key before its widths load, and the old widths are not copied over it', async () => {
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: 240 }))
        const view = mount(<SizedTable />)
        const setItem = vi.spyOn(Storage.prototype, 'setItem')
        const removeItem = vi.spyOn(Storage.prototype, 'removeItem')

        view.rerender(<SizedTable uniqueKey={OTHER_KEY} />)

        // The new key has nothing saved: the table shows its defaults, not the old key's 240.
        await waitFor(() => expect(widthOf('Name')).toBe(160))
        await new Promise((resolve) => setTimeout(resolve, 100))

        await expect(callsFor(setItem.mock.calls, /:column-sizing$/)).toHaveLength(0)
        await expect(callsFor(removeItem.mock.calls, /:column-sizing$/)).toHaveLength(0)
        await expect(localStorage.getItem(OTHER_SIZING_KEY)).toBeNull()
        await expect(stored(SIZING_KEY)).toEqual({ name: 240 })
    })

    it('U-K04: a key that arrives late loads that key\'s widths', async () => {
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: 240 }))
        const setItem = vi.spyOn(Storage.prototype, 'setItem')
        const view = mount(<SizedTable uniqueKey={undefined} />)

        await expect(widthOf('Name')).toBe(160)

        view.rerender(<SizedTable />)

        await waitFor(() => expect(widthOf('Name')).toBe(240))
        await expect(callsFor(setItem.mock.calls, SIZING_KEY)).toHaveLength(0)
    })

    it('F2: when the key goes away the widths return to the defaults and nothing is written; the key coming back reloads', async () => {
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: 240 }))
        const before = localStorage.getItem(SIZING_KEY)
        const view = mount(<SizedTable />)

        await expect(widthOf('Name')).toBe(240)

        const setItem = vi.spyOn(Storage.prototype, 'setItem')
        const removeItem = vi.spyOn(Storage.prototype, 'removeItem')

        view.rerender(<SizedTable uniqueKey={undefined} />)

        await waitFor(() => expect(widthOf('Name')).toBe(160))
        await new Promise((resolve) => setTimeout(resolve, 100))
        await expect(callsFor(setItem.mock.calls, /:column-sizing$/)).toHaveLength(0)
        await expect(callsFor(removeItem.mock.calls, /:column-sizing$/)).toHaveLength(0)

        view.rerender(<SizedTable />)
        await waitFor(() => expect(widthOf('Name')).toBe(240))
        await expect(localStorage.getItem(SIZING_KEY)).toBe(before)
    })

    it('a resize after a key change is saved under the new key only', async () => {
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: 240 }))
        const view = mount(<SizedTable columnResizeMode='onChange' />)

        view.rerender(<SizedTable columnResizeMode='onChange' uniqueKey={OTHER_KEY} />)
        await waitFor(() => expect(widthOf('Name')).toBe(160))

        await drag('Role', 50)

        await waitFor(() => expect(hasSavedWidth(OTHER_SIZING_KEY, 'role')).toBe(true))
        await expect(stored(SIZING_KEY)).toEqual({ name: 240 })
    })
})

describe('StyledTable saved column widths: columns that are not there yet (U-W09, DEC-W)', () => {
    beforeEach(() => localStorage.clear())
    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    const [name, role, age, notes] = personColumns as [
        (typeof personColumns)[number],
        (typeof personColumns)[number],
        (typeof personColumns)[number],
        (typeof personColumns)[number],
    ]

    it('U-W09: a width saved for an absent column stays in the entry, renders when the column appears, and survives a remount', async () => {
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: 240, age: 150 }))
        // `notes` has no saved width and stays the last column: the table sizes the last column itself.
        const view = mount(<SizedTable columnResizeMode='onChange' columns={[name, notes]} />)

        await expect(widthOf('Name')).toBe(240)

        // A real resize writes the width map: it holds the new width AND the one for the column that is not there.
        await drag('Name', 60)
        await waitFor(() => expect(stored(SIZING_KEY)).toEqual({ name: 300, age: 150 }))
        await expect(widthOf('Name')).toBe(300)

        // The column appears: its saved width is simply there.
        view.rerender(<SizedTable columnResizeMode='onChange' columns={[name, age, notes]} />)
        await waitFor(() => expect(widthOf('Age')).toBe(150))
        await expect(widthOf('Name')).toBe(300)
        await expect(stored(SIZING_KEY)).toEqual({ name: 300, age: 150 })

        // After a remount both come back.
        view.unmount()
        mount(<SizedTable columnResizeMode='onChange' columns={[name, age, notes]} />)

        await expect(widthOf('Name')).toBe(300)
        await expect(widthOf('Age')).toBe(150)
    })

    it('U-W09: a column that appears later renders at its saved width, and nothing is written', async () => {
        const seeded = JSON.stringify({ name: 240, role: 200, age: 150 })

        localStorage.setItem(SIZING_KEY, seeded)
        const view = mount(<SizedTable columns={[name, notes]} />)
        const setItem = vi.spyOn(Storage.prototype, 'setItem')
        const removeItem = vi.spyOn(Storage.prototype, 'removeItem')

        view.rerender(<SizedTable columns={[name, role, notes]} />)
        await waitFor(() => expect(widthOf('Role')).toBe(200))

        view.rerender(<SizedTable columns={[name, role, age, notes]} />)
        await waitFor(() => expect(widthOf('Age')).toBe(150))
        await expect(widthOf('Name')).toBe(240)
        await new Promise((resolve) => setTimeout(resolve, 100))

        await expect(callsFor(setItem.mock.calls, SIZING_KEY)).toHaveLength(0)
        await expect(callsFor(removeItem.mock.calls, SIZING_KEY)).toHaveLength(0)
        await expect(localStorage.getItem(SIZING_KEY)).toBe(seeded)
    })

    it('U-W09: a table that mounts with no columns at all gets every saved width when the columns arrive', async () => {
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: 240, role: 200 }))
        const view = mount(<SizedTable columns={[]} />)

        view.rerender(<SizedTable />)

        await waitFor(() => expect(widthOf('Name')).toBe(240))
        await expect(widthOf('Role')).toBe(200)
        await expect(widthOf('Age')).toBe(120)
    })
})
