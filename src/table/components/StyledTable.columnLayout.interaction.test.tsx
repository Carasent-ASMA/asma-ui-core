import { useState } from 'react'
import type { ColumnDef, Table } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { callsFor, people, personColumns, type Person } from 'src/test-utils/tableFixture'
import { SnackbarProvider } from 'src/components/feedback/snack-bar/SnackbarProvider'
import { StyledTable } from './StyledTableIndex'
import type { StyledTableProps } from '../types'

/**
 * Per-user column order and visibility, behind the `persistColumnLayout` opt-in (ASMA-8695, REQ-01 to REQ-08; L-01 to L-15).
 * The popover is driven the way a user does it. Moving a column needs a drag, so the tests move columns through the table
 * instance, which is exactly what the popover's drag handler calls.
 */

const KEY = 'layout-table'
const ORDER_KEY = `${KEY}:column-order`
const VISIBILITY_KEY = `${KEY}:column-visibility`
const SIZING_KEY = `${KEY}:column-sizing`
const OTHER_KEY = 'other-layout-table'
const OTHER_ORDER_KEY = `${OTHER_KEY}:column-order`
const OTHER_VISIBILITY_KEY = `${OTHER_KEY}:column-visibility`
const LEGACY_ORDER_KEY = 'NetworkColumnOrder'
const LEGACY_VISIBILITY_KEY = 'networkVisibilityColumns'

/** The fixture's leaf columns in definition order: the pin is the last one. */
const DEFINITION_ORDER = ['name', 'role', 'age', 'notes', 'actions']
const MOVED_ORDER = ['role', 'name', 'age', 'notes', 'actions']

type Props = Partial<Omit<StyledTableProps<Person, Record<string, unknown>>, 'footer' | 'hideFooter'>>

const tableRef: { current: Table<Person> | null } = { current: null }
const table = (): Table<Person> => tableRef.current!

const LayoutTable = (props: Props): JSX.Element => (
    <>
        <SnackbarProvider />
        <StyledTable<Person>
            columns={personColumns}
            data={people}
            hideFooter
            locale='en'
            persistColumnLayout
            tableInstanceRef={tableRef}
            uniqueKey={KEY}
            {...props}
        />
    </>
)

/** The header labels in order; the select column's checkbox is not a label. */
const headerLabels = (): string[] =>
    [...document.querySelectorAll('thead th')]
        .map((cell) => cell.textContent?.trim() ?? '')
        .filter((label) => label !== '' && label !== 'Check icon')
const stored = (key: string): unknown => JSON.parse(localStorage.getItem(key) ?? 'null') as unknown
const pin = (): HTMLElement => document.querySelector<HTMLElement>('button[aria-haspopup="true"]')!
const dot = (): HTMLElement | null => document.querySelector<HTMLElement>('[data-testid="column-settings-dot"]')
/** A button of the open popover: a column's row (matched by its label) or the Reset columns action. */
const popoverButton = (label: string): HTMLElement => {
    const button = [...document.querySelectorAll<HTMLElement>('button')].find(
        (candidate) =>
            candidate.textContent?.trim() === label ||
            [...candidate.querySelectorAll('span')].at(-1)?.textContent?.trim() === label,
    )

    if (!button) throw new Error(`No button "${label}"`)

    return button
}
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 40))
const act = async (change: () => void): Promise<void> => {
    // Table-instance calls run outside React's event system: let React flush them.
    change()
    await settle()
}
const openPopover = async (): Promise<void> => {
    await userEvent.click(pin())
    await waitFor(() => expect(pin().getAttribute('aria-expanded')).toBe('true'))
}
/** Hides or shows a column in the real popover, then closes it. */
const toggleInPopover = async (label: string): Promise<void> => {
    await openPopover()
    await userEvent.click(popoverButton(label))
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(pin().getAttribute('aria-expanded')).toBe('false'))
    await settle()
}

describe('StyledTable per-user column layout', () => {
    beforeEach(() => {
        localStorage.clear()
        tableRef.current = null
    })
    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    describe('what is saved, and when (L-01 to L-07)', () => {
        it('L-01: a table that does not opt in neither reads nor writes the layout entries', async () => {
            localStorage.setItem(ORDER_KEY, JSON.stringify({ v: 1, order: MOVED_ORDER }))
            localStorage.setItem(VISIBILITY_KEY, JSON.stringify({ v: 1, visibility: { age: false } }))
            const getItem = vi.spyOn(Storage.prototype, 'getItem')
            const setItem = vi.spyOn(Storage.prototype, 'setItem')
            const removeItem = vi.spyOn(Storage.prototype, 'removeItem')

            mount(<LayoutTable persistColumnLayout={undefined} />)
            await settle()
            await act(() => table().setColumnOrder(MOVED_ORDER))
            await toggleInPopover('Notes')

            // The saved entries are not applied, and nothing is written or removed under the layout keys.
            await expect(headerLabels()).toEqual(['Role', 'Name', 'Age'])
            const layoutKey = /:column-(order|visibility)$/

            await expect(callsFor(getItem.mock.calls, layoutKey)).toEqual([])
            await expect(callsFor(setItem.mock.calls, layoutKey)).toEqual([])
            await expect(callsFor(removeItem.mock.calls, layoutKey)).toEqual([])
            await expect(stored(ORDER_KEY)).toEqual({ v: 1, order: MOVED_ORDER })
            await expect(stored(VISIBILITY_KEY)).toEqual({ v: 1, visibility: { age: false } })
        })

        it('L-02: the entries are written exactly as versioned order and visibility, with only the non-default visibility and no internal column', async () => {
            mount(
                <LayoutTable
                    enableRowSelection
                    initialState={{ columnVisibility: { select: true } }}
                />,
            )
            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age', 'Notes'])

            await act(() => table().setColumnOrder(MOVED_ORDER))
            await toggleInPopover('Age')
            // The select column is internal: hiding it is not the user's layout and is never saved.
            await act(() => table().getColumn('select')!.toggleVisibility(false))

            await waitFor(() => expect(stored(ORDER_KEY)).toEqual({ v: 1, order: MOVED_ORDER }))
            await waitFor(() => expect(stored(VISIBILITY_KEY)).toEqual({ v: 1, visibility: { age: false } }))
            await expect(headerLabels()).toEqual(['Role', 'Name', 'Notes'])
        })

        it('L-03: mounting, and loading a saved key, write and remove nothing; only a change does', async () => {
            const setItem = vi.spyOn(Storage.prototype, 'setItem')
            const removeItem = vi.spyOn(Storage.prototype, 'removeItem')

            mount(<LayoutTable />)
            await settle()
            cleanup()

            localStorage.setItem(ORDER_KEY, JSON.stringify({ v: 1, order: MOVED_ORDER }))
            localStorage.setItem(VISIBILITY_KEY, JSON.stringify({ v: 1, visibility: { age: false } }))
            setItem.mockClear()
            removeItem.mockClear()
            mount(<LayoutTable />)
            await settle()

            await expect(headerLabels()).toEqual(['Role', 'Name', 'Notes'])
            const layoutKey = /:column-(order|visibility)$/

            await expect(callsFor(setItem.mock.calls, layoutKey)).toEqual([])
            await expect(callsFor(removeItem.mock.calls, layoutKey)).toEqual([])

            await toggleInPopover('Notes')

            await waitFor(() => expect(callsFor(setItem.mock.calls, VISIBILITY_KEY)).toHaveLength(1))
            await expect(stored(VISIBILITY_KEY)).toEqual({ v: 1, visibility: { age: false, notes: false } })
        })

        it('L-04: a layout equal to the default removes the entry, for visibility and for order', async () => {
            mount(<LayoutTable />)

            await toggleInPopover('Age')
            await waitFor(() => expect(stored(VISIBILITY_KEY)).toEqual({ v: 1, visibility: { age: false } }))
            await toggleInPopover('Age')
            await waitFor(() => expect(localStorage.getItem(VISIBILITY_KEY)).toBeNull())

            await act(() => table().setColumnOrder(MOVED_ORDER))
            await waitFor(() => expect(stored(ORDER_KEY)).toEqual({ v: 1, order: MOVED_ORDER }))
            // Moving it back, to a list that is the definition order, is the default: nothing stays saved.
            await act(() => table().setColumnOrder(DEFINITION_ORDER))
            await waitFor(() => expect(localStorage.getItem(ORDER_KEY)).toBeNull())
        })

        it('L-05: a key change loads the new key\'s layout and writes nothing under it; no key returns to the defaults', async () => {
            localStorage.setItem(OTHER_VISIBILITY_KEY, JSON.stringify({ v: 1, visibility: { role: false } }))
            localStorage.setItem(OTHER_ORDER_KEY, JSON.stringify({ v: 1, order: MOVED_ORDER }))
            const view = mount(<LayoutTable />)

            await toggleInPopover('Age')
            await waitFor(() => expect(stored(VISIBILITY_KEY)).toEqual({ v: 1, visibility: { age: false } }))
            const setItem = vi.spyOn(Storage.prototype, 'setItem')
            const removeItem = vi.spyOn(Storage.prototype, 'removeItem')

            view.rerender(<LayoutTable uniqueKey={OTHER_KEY} />)
            await settle()

            // The other user's layout, not the first user's, and the first user's entry is untouched.
            await expect(headerLabels()).toEqual(['Name', 'Age', 'Notes'])
            await expect(table().getState().columnOrder).toEqual(MOVED_ORDER)
            await expect(stored(VISIBILITY_KEY)).toEqual({ v: 1, visibility: { age: false } })
            await expect(callsFor(setItem.mock.calls, /:column-(order|visibility)$/)).toEqual([])
            await expect(callsFor(removeItem.mock.calls, /:column-(order|visibility)$/)).toEqual([])

            view.rerender(<LayoutTable uniqueKey={undefined} />)
            await settle()

            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age', 'Notes'])
            await expect(table().getState().columnOrder).toEqual([])
            await expect(callsFor(setItem.mock.calls, /:column-(order|visibility)$/)).toEqual([])
            await expect(stored(OTHER_VISIBILITY_KEY)).toEqual({ v: 1, visibility: { role: false } })
        })

        it.each([
            ['not JSON', '{"v":1,"order":["role"'],
            ['the wrong shape', '{"v":1,"order":"role"}'],
            ['an unknown version', JSON.stringify({ v: 2, order: MOVED_ORDER })],
            ['no version', JSON.stringify({ order: MOVED_ORDER })],
            ['the old raw array', JSON.stringify(MOVED_ORDER)],
        ])('L-06: a saved order that is %s means the defaults', async (_label, raw) => {
            localStorage.setItem(ORDER_KEY, raw)

            mount(<LayoutTable />)

            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age', 'Notes'])
            await expect(table().getState().columnOrder).toEqual([])
        })

        it.each([
            ['not JSON', '{"v":1,"visibility":{"age":false'],
            ['the wrong shape', '{"v":1,"visibility":["age"]}'],
            ['an unknown version', JSON.stringify({ v: 2, visibility: { age: false } })],
            ['no version', JSON.stringify({ visibility: { age: false } })],
            ['the old raw map', JSON.stringify({ age: false })],
        ])('L-06: a saved visibility that is %s means the defaults', async (_label, raw) => {
            localStorage.setItem(VISIBILITY_KEY, raw)

            mount(<LayoutTable />)

            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age', 'Notes'])
        })

        it('L-06: unknown order ids are kept but not applied while their column is absent; visibility ids that cannot hide are dropped', async () => {
            const columns: ColumnDef<Person>[] = [
                { accessorKey: 'name', header: 'Name', size: 160, enableHiding: false },
                ...personColumns.slice(1),
            ]

            localStorage.setItem(
                ORDER_KEY,
                JSON.stringify({ v: 1, order: ['ghost', 'role', 'name', 'age', 'notes', 'actions'] }),
            )
            localStorage.setItem(
                VISIBILITY_KEY,
                JSON.stringify({ v: 1, visibility: { name: false, select: true, age: 'no', role: false, ghost: false } }),
            )

            mount(<LayoutTable columns={columns} />)

            // `name` cannot hide, `select` is internal, `age`'s value is not a boolean: only `role` is applied.
            await expect(headerLabels()).toEqual(['Name', 'Age', 'Notes'])
            await expect(table().getState().columnOrder).toEqual(['ghost', 'role', 'name', 'age', 'notes', 'actions'])
            await expect(table().getState().columnVisibility['name']).toBeUndefined()
            await expect(table().getState().columnVisibility['select']).toBe(false)
        })

        it('L-07: storage that throws on every call leaves a table that works in memory and logs nothing', async () => {
            const output = (['error', 'warn'] as const).map((method) => vi.spyOn(console, method))

            vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new DOMException('The operation is insecure.', 'SecurityError')
            })
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
            })
            vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
                throw new DOMException('The operation is insecure.', 'SecurityError')
            })

            mount(<LayoutTable legacyColumnVisibilityKey={LEGACY_VISIBILITY_KEY} persistColumnOrderKey={LEGACY_ORDER_KEY} />)

            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age', 'Notes'])
            await toggleInPopover('Age')
            await expect(headerLabels()).toEqual(['Name', 'Role', 'Notes'])
            await act(() => table().setColumnOrder(MOVED_ORDER))
            await expect(headerLabels()).toEqual(['Role', 'Name', 'Notes'])
            await openPopover()
            await userEvent.click(popoverButton('Reset columns'))
            await settle()
            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age', 'Notes'])

            for (const spy of output) await expect(spy).not.toHaveBeenCalled()
        })
    })

    describe('a saved layout beats initialState (L-08, L-09, L-15)', () => {
        it('L-08: in an opted-in table a saved order beats initialState.columnOrder, and the app\'s order is the default', async () => {
            const appOrder = ['role', 'age', 'name', 'notes', 'actions']

            mount(<LayoutTable initialState={{ columnOrder: appOrder }} />)
            await expect(headerLabels()).toEqual(['Role', 'Age', 'Name', 'Notes'])
            cleanup()

            localStorage.setItem(ORDER_KEY, JSON.stringify({ v: 1, order: DEFINITION_ORDER }))
            mount(<LayoutTable initialState={{ columnOrder: appOrder }} />)

            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age', 'Notes'])
        })

        it('L-09: saved visibility beats initialState.columnVisibility, and the select column stays the app\'s', async () => {
            localStorage.setItem(VISIBILITY_KEY, JSON.stringify({ v: 1, visibility: { age: true, role: false } }))

            mount(
                <LayoutTable
                    enableRowSelection
                    initialState={{ columnVisibility: { age: false, notes: false, select: true } }}
                />,
            )

            // Age is hidden by default and shown by the user; Role is hidden by the user; Notes stays hidden by default.
            await expect(headerLabels()).toEqual(['Name', 'Age'])
            await expect(document.querySelector('thead [role="checkbox"]')).not.toBeNull()
        })

        it('L-15: a table that does not opt in keeps today\'s order of precedence, dot rule and visibility', async () => {
            // The unscoped order key and `initialState.columnOrder`: the app's order still wins.
            localStorage.setItem(LEGACY_ORDER_KEY, JSON.stringify(MOVED_ORDER))
            mount(
                <LayoutTable
                    initialState={{ columnOrder: DEFINITION_ORDER, columnVisibility: { notes: false } }}
                    persistColumnLayout={undefined}
                    persistColumnOrderKey={LEGACY_ORDER_KEY}
                />,
            )

            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age'])
            // Today's dot rule: a hidden column the user may hide is a change, even one that is hidden by default.
            await expect(dot()).not.toBeNull()
            await expect(pin().getAttribute('aria-label')).toMatch(/changed/i)
            // Nothing opted in: Reset leaves the visibility alone, and no layout entry exists.
            await openPopover()
            await userEvent.click(popoverButton('Reset columns'))
            await settle()
            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age'])
            await expect(localStorage.getItem(ORDER_KEY)).toBeNull()
            await expect(localStorage.getItem(VISIBILITY_KEY)).toBeNull()
        })
    })

    describe('the column settings dot (L-10)', () => {
        it('L-10: no dot for a column hidden by default; a dot for a hidden default-visible column, a shown default-hidden one or a move; none once all are back', async () => {
            mount(<LayoutTable initialState={{ columnVisibility: { notes: false } }} />)
            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age'])

            // Notes is hidden by default: no dot, and the pin does not say "changed".
            await expect(dot()).toBeNull()
            await expect(pin().getAttribute('aria-label')).not.toMatch(/changed/i)

            await toggleInPopover('Age')
            await expect(dot()).not.toBeNull()
            await expect(pin().getAttribute('aria-label')).toMatch(/changed/i)
            await toggleInPopover('Age')
            await expect(dot()).toBeNull()

            await toggleInPopover('Notes')
            await expect(dot()).not.toBeNull()
            await toggleInPopover('Notes')
            await expect(dot()).toBeNull()

            await act(() => table().setColumnOrder(MOVED_ORDER))
            await expect(dot()).not.toBeNull()
            await act(() => table().setColumnOrder([]))
            await expect(dot()).toBeNull()
            await expect(pin().getAttribute('aria-label')).not.toMatch(/changed/i)
        })

        it('L-10: the default order is the app\'s initialState.columnOrder, so the definition order is a change and the app\'s order is not', async () => {
            const appOrder = ['role', 'age', 'name', 'notes', 'actions']

            mount(<LayoutTable initialState={{ columnOrder: appOrder }} />)
            await expect(dot()).toBeNull()

            await act(() => table().setColumnOrder(DEFINITION_ORDER))
            await expect(dot()).not.toBeNull()
            await act(() => table().setColumnOrder(appOrder))
            await expect(dot()).toBeNull()
        })
    })

    describe('old entries, migrated once (L-11)', () => {
        it('L-11: the old order and the old raw visibility map are migrated into the first user\'s entries and deleted, and nobody reads them again', async () => {
            localStorage.setItem(LEGACY_ORDER_KEY, JSON.stringify(MOVED_ORDER))
            // The raw, unversioned map of the whole visibility state, as the app hooks write it.
            localStorage.setItem(
                LEGACY_VISIBILITY_KEY,
                JSON.stringify({ name: true, role: true, age: false, notes: true, select: false }),
            )
            const props = { legacyColumnVisibilityKey: LEGACY_VISIBILITY_KEY, persistColumnOrderKey: LEGACY_ORDER_KEY }
            const view = mount(<LayoutTable {...props} />)
            await settle()

            // The first user takes over the old layout, in the versioned entries (the visibility as a diff, with no defaults
            // and no internal column), and the old keys are gone.
            await expect(headerLabels()).toEqual(['Role', 'Name', 'Notes'])
            await expect(stored(ORDER_KEY)).toEqual({ v: 1, order: MOVED_ORDER })
            await expect(stored(VISIBILITY_KEY)).toEqual({ v: 1, visibility: { age: false } })
            await expect(localStorage.getItem(LEGACY_ORDER_KEY)).toBeNull()
            await expect(localStorage.getItem(LEGACY_VISIBILITY_KEY)).toBeNull()

            // A second mount by the same user reads only the new entries.
            view.unmount()
            const getItem = vi.spyOn(Storage.prototype, 'getItem')
            mount(<LayoutTable {...props} />)
            await settle()

            await expect(headerLabels()).toEqual(['Role', 'Name', 'Notes'])
            await expect(callsFor(getItem.mock.calls, LEGACY_ORDER_KEY)).toEqual([])
            await expect(callsFor(getItem.mock.calls, LEGACY_VISIBILITY_KEY)).toEqual([])

            // Another user on the same browser starts from the defaults.
            cleanup()
            const other = mount(<LayoutTable {...props} uniqueKey={OTHER_KEY} />)
            await settle()
            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age', 'Notes'])
            other.unmount()
        })

        it('L-11: an old entry that is not a valid order or visibility is deleted, not migrated, and the defaults apply', async () => {
            localStorage.setItem(LEGACY_ORDER_KEY, JSON.stringify({ not: 'an order' }))
            localStorage.setItem(LEGACY_VISIBILITY_KEY, JSON.stringify({ age: 'hidden', role: false }))

            mount(<LayoutTable legacyColumnVisibilityKey={LEGACY_VISIBILITY_KEY} persistColumnOrderKey={LEGACY_ORDER_KEY} />)
            await settle()

            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age', 'Notes'])
            await expect(localStorage.getItem(LEGACY_ORDER_KEY)).toBeNull()
            await expect(localStorage.getItem(LEGACY_VISIBILITY_KEY)).toBeNull()
            await expect(localStorage.getItem(ORDER_KEY)).toBeNull()
            await expect(localStorage.getItem(VISIBILITY_KEY)).toBeNull()
        })

        it('L-11: an old layout that equals the default is deleted without writing an entry', async () => {
            localStorage.setItem(LEGACY_ORDER_KEY, JSON.stringify(DEFINITION_ORDER))
            localStorage.setItem(LEGACY_VISIBILITY_KEY, JSON.stringify({ name: true, role: true, age: true, notes: true }))

            mount(<LayoutTable legacyColumnVisibilityKey={LEGACY_VISIBILITY_KEY} persistColumnOrderKey={LEGACY_ORDER_KEY} />)
            await settle()

            await expect(localStorage.getItem(LEGACY_ORDER_KEY)).toBeNull()
            await expect(localStorage.getItem(LEGACY_VISIBILITY_KEY)).toBeNull()
            await expect(localStorage.getItem(ORDER_KEY)).toBeNull()
            await expect(localStorage.getItem(VISIBILITY_KEY)).toBeNull()
        })

        it('L-11: when the user already has an entry, the old key is not read', async () => {
            localStorage.setItem(ORDER_KEY, JSON.stringify({ v: 1, order: DEFINITION_ORDER.toReversed() }))
            localStorage.setItem(VISIBILITY_KEY, JSON.stringify({ v: 1, visibility: { notes: false } }))
            localStorage.setItem(LEGACY_ORDER_KEY, JSON.stringify(MOVED_ORDER))
            localStorage.setItem(LEGACY_VISIBILITY_KEY, JSON.stringify({ age: false }))
            const getItem = vi.spyOn(Storage.prototype, 'getItem')

            mount(<LayoutTable legacyColumnVisibilityKey={LEGACY_VISIBILITY_KEY} persistColumnOrderKey={LEGACY_ORDER_KEY} />)
            await settle()

            await expect(headerLabels()).toEqual(['Age', 'Role', 'Name'])
            await expect(callsFor(getItem.mock.calls, LEGACY_ORDER_KEY)).toEqual([])
            await expect(callsFor(getItem.mock.calls, LEGACY_VISIBILITY_KEY)).toEqual([])
        })
    })

    describe('old entries when storage refuses the new write (audit round 1)', () => {
        const refuse = (layoutKeys: RegExp): void => {
            const setItem = Storage.prototype.setItem

            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key: string, value: string) {
                if (layoutKeys.test(key)) throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
                setItem.call(this, key, value)
            })
        }
        const legacy = { legacyColumnVisibilityKey: LEGACY_VISIBILITY_KEY, persistColumnOrderKey: LEGACY_ORDER_KEY }

        it('L-16: when the new entries cannot be written the old ones stay, the layout is still applied in memory, and the next visit tries again', async () => {
            localStorage.setItem(LEGACY_ORDER_KEY, JSON.stringify(MOVED_ORDER))
            localStorage.setItem(LEGACY_VISIBILITY_KEY, JSON.stringify({ age: false }))
            refuse(/:column-(?:order|visibility)$/)

            const view = mount(<LayoutTable {...legacy} />)
            await settle()

            await expect(headerLabels()).toEqual(['Role', 'Name', 'Notes'])
            await expect(localStorage.getItem(ORDER_KEY)).toBeNull()
            await expect(localStorage.getItem(VISIBILITY_KEY)).toBeNull()
            await expect(localStorage.getItem(LEGACY_ORDER_KEY)).not.toBeNull()
            await expect(localStorage.getItem(LEGACY_VISIBILITY_KEY)).not.toBeNull()

            // Storage works again on the next visit: the old layout is carried over and only then deleted.
            view.unmount()
            vi.restoreAllMocks()
            mount(<LayoutTable {...legacy} />)
            await settle()

            await expect(headerLabels()).toEqual(['Role', 'Name', 'Notes'])
            await expect(stored(ORDER_KEY)).toEqual({ v: 1, order: MOVED_ORDER })
            await expect(stored(VISIBILITY_KEY)).toEqual({ v: 1, visibility: { age: false } })
            await expect(localStorage.getItem(LEGACY_ORDER_KEY)).toBeNull()
            await expect(localStorage.getItem(LEGACY_VISIBILITY_KEY)).toBeNull()
        })

        it('L-16: each old entry goes only when its own replacement was written: a failed visibility write keeps the old visibility, not the order', async () => {
            localStorage.setItem(LEGACY_ORDER_KEY, JSON.stringify(MOVED_ORDER))
            localStorage.setItem(LEGACY_VISIBILITY_KEY, JSON.stringify({ age: false }))
            refuse(/:column-visibility$/)

            mount(<LayoutTable {...legacy} />)
            await settle()

            await expect(stored(ORDER_KEY)).toEqual({ v: 1, order: MOVED_ORDER })
            await expect(localStorage.getItem(LEGACY_ORDER_KEY)).toBeNull()
            await expect(localStorage.getItem(VISIBILITY_KEY)).toBeNull()
            await expect(localStorage.getItem(LEGACY_VISIBILITY_KEY)).not.toBeNull()
        })

        it('L-16: an old entry with nothing to migrate is deleted even when storage refuses writes: nothing replaces it', async () => {
            localStorage.setItem(LEGACY_ORDER_KEY, JSON.stringify({ not: 'an order' }))
            localStorage.setItem(LEGACY_VISIBILITY_KEY, JSON.stringify([true]))
            refuse(/:column-(?:order|visibility)$/)

            mount(<LayoutTable {...legacy} />)
            await settle()

            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age', 'Notes'])
            await expect(localStorage.getItem(LEGACY_ORDER_KEY)).toBeNull()
            await expect(localStorage.getItem(LEGACY_VISIBILITY_KEY)).toBeNull()
        })
    })

    describe('state that follows the columns and defaults of the current render (audit round 1)', () => {
        const extraColumns: ColumnDef<Person>[] = [
            personColumns[0]!,
            personColumns[1]!,
            { id: 'extra', header: 'Extra', size: 120, accessorFn: () => 'x' },
            personColumns[2]!,
            personColumns[3]!,
        ]

        it('L-17: a column that appears takes its definition position in an order the user changed', async () => {
            localStorage.setItem(ORDER_KEY, JSON.stringify({ v: 1, order: ['age', 'name', 'role', 'notes', 'actions'] }))
            const view = mount(<LayoutTable />)
            await expect(headerLabels()).toEqual(['Age', 'Name', 'Role', 'Notes'])

            view.rerender(<LayoutTable columns={extraColumns} />)
            await settle()

            await expect(headerLabels()).toEqual(['Age', 'Name', 'Role', 'Extra', 'Notes'])
            // The order is the user's, now with the new column in it, and is what the next visit loads.
            await waitFor(() =>
                expect(stored(ORDER_KEY)).toEqual({ v: 1, order: ['age', 'name', 'role', 'extra', 'notes', 'actions'] }),
            )
        })

        it('L-17: a user who has not moved anything stays on the definition order when a column appears, and nothing is saved', async () => {
            const view = mount(<LayoutTable />)
            const setItem = vi.spyOn(Storage.prototype, 'setItem')

            view.rerender(<LayoutTable columns={extraColumns} />)
            await settle()

            await expect(headerLabels()).toEqual(['Name', 'Role', 'Extra', 'Age', 'Notes'])
            await expect(callsFor(setItem.mock.calls, /:column-(order|visibility)$/)).toEqual([])
            await expect(dot()).toBeNull()
        })

        it('L-18: a changed default visibility reaches the column the user did not change, keeps the one they did, and the dot stays in step', async () => {
            const view = mount(<LayoutTable initialState={{ columnVisibility: { notes: false } }} />)
            await toggleInPopover('Age')
            await waitFor(() => expect(stored(VISIBILITY_KEY)).toEqual({ v: 1, visibility: { age: false } }))
            await expect(headerLabels()).toEqual(['Name', 'Role'])

            // The app now shows Notes by default.
            view.rerender(<LayoutTable initialState={{ columnVisibility: { notes: true } }} />)
            await settle()

            await expect(headerLabels()).toEqual(['Name', 'Role', 'Notes'])
            // Only what the user changed counts: Age. Notes was never theirs.
            await expect(dot()).not.toBeNull()
            await expect(stored(VISIBILITY_KEY)).toEqual({ v: 1, visibility: { age: false } })

            await toggleInPopover('Age')
            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age', 'Notes'])
            await expect(dot()).toBeNull()
            await waitFor(() => expect(localStorage.getItem(VISIBILITY_KEY)).toBeNull())
        })

        it('L-18: a changed default is not saved as the user\'s choice: a user on the defaults writes nothing when the app changes them', async () => {
            const view = mount(<LayoutTable initialState={{ columnVisibility: { notes: false } }} />)
            await settle()
            const setItem = vi.spyOn(Storage.prototype, 'setItem')

            view.rerender(<LayoutTable initialState={{ columnVisibility: { notes: true, age: false } }} />)
            await settle()

            await expect(headerLabels()).toEqual(['Name', 'Role', 'Notes'])
            await expect(dot()).toBeNull()
            await expect(callsFor(setItem.mock.calls, /:column-(order|visibility)$/)).toEqual([])
            await expect(localStorage.getItem(VISIBILITY_KEY)).toBeNull()
        })

        it('L-17: a column that appears takes its definition position in the app\'s own default order too, with no dot and nothing saved', async () => {
            const appOrder = ['role', 'age', 'name', 'notes', 'actions']
            const view = mount(<LayoutTable initialState={{ columnOrder: appOrder }} />)
            await expect(headerLabels()).toEqual(['Role', 'Age', 'Name', 'Notes'])
            const setItem = vi.spyOn(Storage.prototype, 'setItem')

            view.rerender(<LayoutTable columns={extraColumns} initialState={{ columnOrder: appOrder }} />)
            await settle()

            // `extra` follows `role` in the definition, so it follows `role` here, not the pin at the end.
            await expect(headerLabels()).toEqual(['Role', 'Extra', 'Age', 'Name', 'Notes'])
            await expect(dot()).toBeNull()
            await expect(callsFor(setItem.mock.calls, /:column-(?:order|visibility)$/)).toEqual([])
        })

        it('L-18: a change the user makes in the same render as a new column is saved, not lost', async () => {
            const Both = (): JSX.Element => {
                const [withExtra, setWithExtra] = useState(false)

                return (
                    <>
                        <button
                            type='button'
                            onClick={() => {
                                // One event handler, so React renders once with both: the new column and the user's change.
                                setWithExtra(true)
                                table().getColumn('age')!.toggleVisibility(false)
                            }}
                        >
                            Change both
                        </button>
                        <LayoutTable columns={withExtra ? extraColumns : personColumns} />
                    </>
                )
            }

            mount(<Both />)
            await userEvent.click(document.querySelector<HTMLElement>('button[type="button"]')!)
            await settle()

            await expect(headerLabels()).toEqual(['Name', 'Role', 'Extra', 'Notes'])
            await waitFor(() => expect(stored(VISIBILITY_KEY)).toEqual({ v: 1, visibility: { age: false } }))
        })

        it('L-18: a saved entry that becomes equal to a changed default is removed at once, with no other change', async () => {
            localStorage.setItem(VISIBILITY_KEY, JSON.stringify({ v: 1, visibility: { age: false } }))
            const view = mount(<LayoutTable />)
            await expect(headerLabels()).toEqual(['Name', 'Role', 'Notes'])

            // The app now hides Age by default: what the user saved is the default, and the state does not change.
            view.rerender(<LayoutTable initialState={{ columnVisibility: { age: false } }} />)
            await settle()

            await expect(localStorage.getItem(VISIBILITY_KEY)).toBeNull()
            await expect(headerLabels()).toEqual(['Name', 'Role', 'Notes'])
            await expect(dot()).toBeNull()
        })

        it('L-18: a changed default order reaches a user who has not moved a column, and leaves one who has', async () => {
            const first = ['role', 'age', 'name', 'notes', 'actions']
            const second = ['age', 'role', 'name', 'notes', 'actions']
            const view = mount(<LayoutTable initialState={{ columnOrder: first }} />)
            await expect(headerLabels()).toEqual(['Role', 'Age', 'Name', 'Notes'])

            view.rerender(<LayoutTable initialState={{ columnOrder: second }} />)
            await settle()

            await expect(headerLabels()).toEqual(['Age', 'Role', 'Name', 'Notes'])
            await expect(dot()).toBeNull()
            await expect(localStorage.getItem(ORDER_KEY)).toBeNull()
            cleanup()

            const moved = mount(<LayoutTable initialState={{ columnOrder: first }} />)
            await act(() => table().setColumnOrder(DEFINITION_ORDER))
            await waitFor(() => expect(stored(ORDER_KEY)).toEqual({ v: 1, order: DEFINITION_ORDER }))

            moved.rerender(<LayoutTable initialState={{ columnOrder: second }} />)
            await settle()

            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age', 'Notes'])
            await expect(dot()).not.toBeNull()
        })
    })

    describe('Reset, missing columns and separate tables (L-12 to L-14)', () => {
        it('L-12: Reset columns restores order, widths and visibility to the defaults and removes the entries', async () => {
            mount(<LayoutTable enableColumnResizing initialState={{ columnVisibility: { notes: false } }} />)
            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age'])
            const defaultWidth = Number.parseFloat(
                document.querySelector<HTMLElement>('thead th')!.style.width,
            )

            await toggleInPopover('Age')
            await toggleInPopover('Notes')
            await act(() => table().setColumnOrder(MOVED_ORDER))
            await act(() => table().setColumnSizing({ name: 260 }))
            await waitFor(() => expect(stored(VISIBILITY_KEY)).toEqual({ v: 1, visibility: { age: false, notes: true } }))
            await waitFor(() => expect(stored(ORDER_KEY)).not.toBeNull())
            await waitFor(() => expect(stored(SIZING_KEY)).not.toBeNull())
            await expect(headerLabels()).toEqual(['Role', 'Name', 'Notes'])

            await openPopover()
            await userEvent.click(popoverButton('Reset columns'))
            await settle()

            // Back to what the app declares: Age shown again, Notes hidden again, the definition order, the default width.
            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age'])
            await expect(Number.parseFloat(document.querySelector<HTMLElement>('thead th')!.style.width)).toBe(defaultWidth)
            await expect(localStorage.getItem(ORDER_KEY)).toBeNull()
            await expect(localStorage.getItem(VISIBILITY_KEY)).toBeNull()
            await expect(localStorage.getItem(SIZING_KEY)).toBeNull()
            await expect(dot()).toBeNull()
        })

        it('L-12: Reset columns also removes an entry that already equals the default, which the storage rule alone would leave', async () => {
            // A stale layout: what is saved matches the defaults, so the state never changes and nothing removes it.
            localStorage.setItem(ORDER_KEY, JSON.stringify({ v: 1, order: DEFINITION_ORDER }))
            localStorage.setItem(VISIBILITY_KEY, JSON.stringify({ v: 1, visibility: { age: true } }))

            mount(<LayoutTable />)
            await settle()
            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age', 'Notes'])
            await expect(localStorage.getItem(ORDER_KEY)).not.toBeNull()

            await openPopover()
            await userEvent.click(popoverButton('Reset columns'))
            await settle()

            await expect(localStorage.getItem(ORDER_KEY)).toBeNull()
            await expect(localStorage.getItem(VISIBILITY_KEY)).toBeNull()
        })

        it('L-12: Reset columns also deletes a leftover old entry of a table with per-user keys, and leaves the old keys of a table with none', async () => {
            localStorage.setItem(LEGACY_ORDER_KEY, JSON.stringify(MOVED_ORDER))
            localStorage.setItem(LEGACY_VISIBILITY_KEY, JSON.stringify({ age: false }))
            const legacy = { legacyColumnVisibilityKey: LEGACY_VISIBILITY_KEY, persistColumnOrderKey: LEGACY_ORDER_KEY }

            // The user already has entries, so the old keys were not migrated and are still there.
            localStorage.setItem(ORDER_KEY, JSON.stringify({ v: 1, order: DEFINITION_ORDER }))
            localStorage.setItem(VISIBILITY_KEY, JSON.stringify({ v: 1, visibility: { notes: false } }))
            const withKeys = mount(<LayoutTable {...legacy} />)
            await settle()
            await expect(localStorage.getItem(LEGACY_ORDER_KEY)).not.toBeNull()

            await openPopover()
            await userEvent.click(popoverButton('Reset columns'))
            await settle()

            await expect(localStorage.getItem(LEGACY_ORDER_KEY)).toBeNull()
            await expect(localStorage.getItem(LEGACY_VISIBILITY_KEY)).toBeNull()
            withKeys.unmount()

            // A table with no per-user key does not own them.
            localStorage.setItem(LEGACY_ORDER_KEY, JSON.stringify(MOVED_ORDER))
            localStorage.setItem(LEGACY_VISIBILITY_KEY, JSON.stringify({ age: false }))
            mount(<LayoutTable {...legacy} uniqueKey={undefined} />)
            await settle()
            await openPopover()
            await userEvent.click(popoverButton('Reset columns'))
            await settle()

            await expect(localStorage.getItem(LEGACY_ORDER_KEY)).not.toBeNull()
            await expect(localStorage.getItem(LEGACY_VISIBILITY_KEY)).not.toBeNull()
        })

        it('L-12: Reset columns puts the order back to the app\'s initialState.columnOrder, not to the definition order', async () => {
            const appOrder = ['role', 'age', 'name', 'notes', 'actions']

            mount(<LayoutTable initialState={{ columnOrder: appOrder }} />)
            await act(() => table().setColumnOrder(DEFINITION_ORDER))
            await waitFor(() => expect(stored(ORDER_KEY)).toEqual({ v: 1, order: DEFINITION_ORDER }))
            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age', 'Notes'])

            await openPopover()
            await userEvent.click(popoverButton('Reset columns'))
            await settle()

            await expect(headerLabels()).toEqual(['Role', 'Age', 'Name', 'Notes'])
            await expect(localStorage.getItem(ORDER_KEY)).toBeNull()
            await expect(dot()).toBeNull()
        })

        it('L-13: a column added after an order was saved appears at its definition position, not at the end', async () => {
            const columns: ColumnDef<Person>[] = [
                personColumns[0]!,
                personColumns[1]!,
                { id: 'extra', header: 'Extra', size: 120, accessorFn: () => 'x' },
                personColumns[2]!,
                personColumns[3]!,
            ]

            // Saved before `extra` existed: Age was moved to the front.
            localStorage.setItem(ORDER_KEY, JSON.stringify({ v: 1, order: ['age', 'name', 'role', 'notes', 'actions'] }))

            mount(<LayoutTable columns={columns} />)

            await expect(headerLabels()).toEqual(['Age', 'Name', 'Role', 'Extra', 'Notes'])
        })

        it('L-14: two opted-in tables with different keys keep separate entries', async () => {
            const second: { current: Table<Person> | null } = { current: null }

            mount(
                <>
                    <LayoutTable />
                    <StyledTable<Person>
                        columns={personColumns}
                        data={people}
                        hideFooter
                        locale='en'
                        persistColumnLayout
                        tableInstanceRef={second}
                        uniqueKey={OTHER_KEY}
                    />
                </>,
            )

            await act(() => table().getColumn('age')!.toggleVisibility(false))
            await act(() => second.current!.setColumnOrder(MOVED_ORDER))

            await waitFor(() => expect(stored(VISIBILITY_KEY)).toEqual({ v: 1, visibility: { age: false } }))
            await expect(localStorage.getItem(ORDER_KEY)).toBeNull()
            await waitFor(() => expect(stored(OTHER_ORDER_KEY)).toEqual({ v: 1, order: MOVED_ORDER }))
            await expect(localStorage.getItem(OTHER_VISIBILITY_KEY)).toBeNull()
        })
    })

    describe('around the opt-in', () => {
        it('an opted-in table with no uniqueKey saves and reads nothing, and still follows its defaults', async () => {
            const setItem = vi.spyOn(Storage.prototype, 'setItem')

            mount(<LayoutTable initialState={{ columnVisibility: { notes: false } }} uniqueKey={undefined} />)
            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age'])
            await expect(dot()).toBeNull()

            await toggleInPopover('Age')

            await expect(headerLabels()).toEqual(['Name', 'Role'])
            await expect(dot()).not.toBeNull()
            await expect(callsFor(setItem.mock.calls, /:column-(order|visibility)$/)).toEqual([])
        })

        it('an opted-in table with no uniqueKey neither migrates nor deletes the old entries, Reset columns included', async () => {
            localStorage.setItem(LEGACY_ORDER_KEY, JSON.stringify(MOVED_ORDER))
            localStorage.setItem(LEGACY_VISIBILITY_KEY, JSON.stringify({ age: false }))

            mount(
                <LayoutTable
                    legacyColumnVisibilityKey={LEGACY_VISIBILITY_KEY}
                    persistColumnOrderKey={LEGACY_ORDER_KEY}
                    uniqueKey={undefined}
                />,
            )
            await settle()

            // Not applied (there is no user to carry them to), and not touched.
            await expect(headerLabels()).toEqual(['Name', 'Role', 'Age', 'Notes'])
            await expect(localStorage.getItem(LEGACY_ORDER_KEY)).not.toBeNull()

            await openPopover()
            await userEvent.click(popoverButton('Reset columns'))
            await settle()

            await expect(localStorage.getItem(LEGACY_ORDER_KEY)).not.toBeNull()
            await expect(localStorage.getItem(LEGACY_VISIBILITY_KEY)).not.toBeNull()
        })

        it('a development build warns when an opted-in table also controls the visibility, once, and a table that does not opt in is not warned', async () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

            mount(<LayoutTable persistColumnLayout={undefined} onColumnVisibilityChange={() => undefined} />)
            await settle()
            await expect(warn).not.toHaveBeenCalled()
            cleanup()

            mount(<LayoutTable onColumnVisibilityChange={() => undefined} />)
            await settle()

            await expect(warn).toHaveBeenCalledTimes(1)
            await expect(String(warn.mock.calls[0]?.[0])).toContain('persistColumnLayout')
        })
    })
})
