import { useState } from 'react'
import type { SortingState } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import {
    ariaSorts,
    bodyNames,
    callsFor,
    FirstCommit,
    people,
    personColumns,
    resolveColor,
    sortButton,
    sortGlyph,
    type Person,
} from 'src/test-utils/tableFixture'
import { usePersistedSorting } from '../hooks/usePersistedSorting'
import { StyledTable } from './StyledTableIndex'
import type { Table } from '@tanstack/react-table'
import type { StyledTableProps } from '../types'

/**
 * Sorting persistence behind the `persistSorting` opt-in (ASMA-8597, D1): REQ-001, REQ-002, REQ-005, REQ-006.
 * Real Chromium, real `localStorage`: what a user sees after a reload is what is asserted.
 */

const KEY = 'people-table'
const SORT_KEY = `${KEY}:sorting`
const OTHER_KEY = 'other-table'
const OTHER_SORT_KEY = `${OTHER_KEY}:sorting`

type Props = Partial<Omit<StyledTableProps<Person, Record<string, unknown>>, 'footer' | 'hideFooter'>>

const PeopleTable = (props: Props): JSX.Element => (
    <StyledTable<Person>
        columns={personColumns}
        data={people}
        hideFooter
        locale='en'
        persistSorting
        uniqueKey={KEY}
        {...props}
    />
)

const saved = (sorting: SortingState): string => JSON.stringify({ v: 1, sorting })
const stored = (key: string): unknown => JSON.parse(localStorage.getItem(key) ?? 'null')

describe('StyledTable sorting persistence (persistSorting)', () => {
    beforeEach(() => localStorage.clear())
    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it('ST-01: restores the sort after a remount, on the first committed render (AC 1, AC 9)', async () => {
        const first = mount(<PeopleTable />)
        await userEvent.click(sortButton('Name'))

        await expect(ariaSorts()['Name']).toBe('ascending')
        await expect(bodyNames()).toEqual(['Alice', 'Bob', 'Charlie'])
        await expect(stored(SORT_KEY)).toEqual({ v: 1, sorting: [{ id: 'name', desc: false }] })

        first.unmount()

        let firstRender: { ariaSort: string | null; names: string[]; glyph: ReturnType<typeof sortGlyph>; color: string } | undefined
        mount(
            <>
                <PeopleTable />
                <FirstCommit
                    onCommit={() => {
                        firstRender = {
                            ariaSort: document.querySelector('thead th')?.getAttribute('aria-sort') ?? null,
                            names: bodyNames(),
                            glyph: sortGlyph('Name'),
                            color: getComputedStyle(document.querySelector('[data-sort-state="asc"] svg')!).color,
                        }
                    }}
                />
            </>,
        )

        // U-S11: the restored sort was already in the table's initial state, so the very first commit shows it.
        await expect(firstRender).toEqual({
            ariaSort: 'ascending',
            names: ['Alice', 'Bob', 'Charlie'],
            glyph: { state: 'asc', direction: 'asc', visible: true },
            color: resolveColor('var(--colors-gama-500)'),
        })
    })

    it('U-S12: writes the sort on every change', async () => {
        const setItem = vi.spyOn(Storage.prototype, 'setItem')
        mount(<PeopleTable />)
        await expect(callsFor(setItem.mock.calls, SORT_KEY)).toHaveLength(0)

        await userEvent.click(sortButton('Name'))
        await userEvent.click(sortButton('Name'))
        await userEvent.click(sortButton('Role'))

        await waitFor(() => expect(callsFor(setItem.mock.calls, SORT_KEY)).toHaveLength(3))
        await expect(callsFor(setItem.mock.calls, SORT_KEY).map(([, value]) => JSON.parse(String(value)))).toEqual([
            { v: 1, sorting: [{ id: 'name', desc: false }] },
            { v: 1, sorting: [{ id: 'name', desc: true }] },
            { v: 1, sorting: [{ id: 'role', desc: false }] },
        ])
    })

    it('U-S14: the stored value has only v and sorting, each entry only id and desc', async () => {
        mount(<PeopleTable />)
        await userEvent.click(sortButton('Age'))

        const value = stored(SORT_KEY) as { v: number; sorting: Record<string, unknown>[] }

        await expect(Object.keys(value).sort()).toEqual(['sorting', 'v'])
        await expect(value.sorting).toEqual([{ id: 'age', desc: true }])
        await expect(Object.keys(value.sorting[0]!).sort()).toEqual(['desc', 'id'])
    })

    it('ST-03: sorting turned off stays off after a remount and beats the app default (AC 2, U-S10)', async () => {
        const defaultSorting: SortingState = [{ id: 'name', desc: false }]
        const first = mount(<PeopleTable initialState={{ sorting: defaultSorting }} />)

        await expect(ariaSorts()['Name']).toBe('ascending')
        await userEvent.click(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('descending')
        await userEvent.click(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('none')
        await expect(stored(SORT_KEY)).toEqual({ v: 1, sorting: [] })

        first.unmount()
        mount(<PeopleTable initialState={{ sorting: defaultSorting }} />)

        await expect(ariaSorts()['Name']).toBe('none')
        await expect(bodyNames()).toEqual(['Charlie', 'Alice', 'Bob'])
    })

    it('ST-04: a Shift-click multi-sort comes back with the same order and directions (AC 3)', async () => {
        const first = mount(<PeopleTable />)

        await userEvent.click(sortButton('Role'))
        await userEvent.keyboard('{Shift>}')
        await userEvent.click(sortButton('Age'))
        await userEvent.click(sortButton('Age'))
        await userEvent.keyboard('{/Shift}')

        const expected = [
            { id: 'role', desc: false },
            { id: 'age', desc: false },
        ]
        await waitFor(() => expect(stored(SORT_KEY)).toEqual({ v: 1, sorting: expected }))

        first.unmount()
        mount(<PeopleTable />)

        await expect(ariaSorts()).toMatchObject({ Role: 'ascending', Age: 'ascending', Name: 'none' })
        await expect(stored(SORT_KEY)).toEqual({ v: 1, sorting: expected })
    })

    it('ST-02 / U-S13: without persistSorting the table never reads or writes :sorting (D1)', async () => {
        localStorage.setItem(SORT_KEY, saved([{ id: 'role', desc: true }]))
        const getItem = vi.spyOn(Storage.prototype, 'getItem')
        const setItem = vi.spyOn(Storage.prototype, 'setItem')
        const removeItem = vi.spyOn(Storage.prototype, 'removeItem')
        const defaultSorting: SortingState = [{ id: 'name', desc: false }]

        const first = mount(<PeopleTable initialState={{ sorting: defaultSorting }} persistSorting={false} />)

        // The saved entry is ignored: the app default applies.
        await expect(ariaSorts()['Role']).toBe('none')
        await expect(ariaSorts()['Name']).toBe('ascending')

        await userEvent.click(sortButton('Age'))
        first.unmount()
        mount(<PeopleTable initialState={{ sorting: defaultSorting }} persistSorting={false} />)

        // The default sort returns, and the table never touched the entry.
        await expect(ariaSorts()['Name']).toBe('ascending')
        for (const spy of [getItem, setItem, removeItem]) {
            await expect(callsFor(spy.mock.calls, SORT_KEY)).toHaveLength(0)
        }
        // Read after the spy check, so this test's own read is not counted.
        await expect(localStorage.getItem(SORT_KEY)).toBe(saved([{ id: 'role', desc: true }]))
    })

    it('persistSorting without a uniqueKey does nothing', async () => {
        const setItem = vi.spyOn(Storage.prototype, 'setItem')

        mount(<PeopleTable uniqueKey={undefined} />)
        await userEvent.click(sortButton('Name'))

        await expect(ariaSorts()['Name']).toBe('ascending')
        await expect(callsFor(setItem.mock.calls, /:sorting$/)).toHaveLength(0)
    })

    it('U-S15: persistSorting is never forwarded to TanStack', async () => {
        let table: Table<Person> | null = null
        const ref = { get current() { return table }, set current(value: Table<Person> | null) { table = value } }

        mount(<PeopleTable tableInstanceRef={ref} />)

        await expect(table).not.toBeNull()
        await expect(Object.keys(table!.options)).not.toContain('persistSorting')
        await expect('persistSorting' in table!.options).toBe(false)
    })

    it('drops a saved sort for a column that is gone, and uses the default when none is left', async () => {
        localStorage.setItem(SORT_KEY, saved([{ id: 'removed-column', desc: true }]))

        mount(<PeopleTable initialState={{ sorting: [{ id: 'name', desc: true }] }} />)

        await expect(ariaSorts()['Name']).toBe('descending')
        // Mounting writes nothing: the stored value stays until the user changes the sort.
        await expect(localStorage.getItem(SORT_KEY)).toBe(saved([{ id: 'removed-column', desc: true }]))
    })

    it('a sort back to the default removes the entry instead of writing it (REQ-004)', async () => {
        mount(<PeopleTable initialState={{ sorting: [{ id: 'name', desc: false }] }} />)
        await expect(localStorage.getItem(SORT_KEY)).toBeNull()

        await userEvent.click(sortButton('Role'))
        await expect(stored(SORT_KEY)).toEqual({ v: 1, sorting: [{ id: 'role', desc: false }] })

        // Name ascending is the default: a state equal to it removes the entry.
        await userEvent.click(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('ascending')
        await expect(localStorage.getItem(SORT_KEY)).toBeNull()

        // Anything else writes again, and turning sorting off is saved as an empty list (AC 2).
        await userEvent.click(sortButton('Name'))
        await userEvent.click(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('none')
        await expect(stored(SORT_KEY)).toEqual({ v: 1, sorting: [] })
    })
})

describe('StyledTable sorting persistence: key change (AC 14)', () => {
    beforeEach(() => localStorage.clear())
    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    const seed = () => {
        localStorage.setItem(SORT_KEY, saved([{ id: 'name', desc: true }]))
        localStorage.setItem(OTHER_SORT_KEY, saved([{ id: 'role', desc: false }]))
    }

    it('ST-07 / U-K02 / U-K03: loads the new key\'s sort and leaves both entries byte-identical', async () => {
        seed()
        const before = { a: localStorage.getItem(SORT_KEY), b: localStorage.getItem(OTHER_SORT_KEY) }
        const view = mount(<PeopleTable />)

        await expect(ariaSorts()['Name']).toBe('descending')

        view.rerender(<PeopleTable uniqueKey={OTHER_KEY} />)

        await waitFor(() => expect(ariaSorts()).toMatchObject({ Role: 'ascending', Name: 'none' }))
        // Role ascending: Admin, Auditor, User.
        await expect(bodyNames()).toEqual(['Charlie', 'Bob', 'Alice'])
        await expect({ a: localStorage.getItem(SORT_KEY), b: localStorage.getItem(OTHER_SORT_KEY) }).toEqual(before)

        view.rerender(<PeopleTable />)
        await waitFor(() => expect(ariaSorts()).toMatchObject({ Name: 'descending', Role: 'none' }))
        await expect({ a: localStorage.getItem(SORT_KEY), b: localStorage.getItem(OTHER_SORT_KEY) }).toEqual(before)
    })

    it('U-K01: nothing is written or removed under the new key before its values load', async () => {
        seed()
        const view = mount(<PeopleTable />)
        const setItem = vi.spyOn(Storage.prototype, 'setItem')
        const removeItem = vi.spyOn(Storage.prototype, 'removeItem')

        view.rerender(<PeopleTable uniqueKey={OTHER_KEY} />)
        await waitFor(() => expect(ariaSorts()['Role']).toBe('ascending'))
        // Give any stray effect the time it would need.
        await new Promise((resolve) => setTimeout(resolve, 100))

        await expect(callsFor(setItem.mock.calls, /:sorting$/)).toHaveLength(0)
        await expect(callsFor(removeItem.mock.calls, /:sorting$/)).toHaveLength(0)
    })

    it('a key with nothing saved shows the default sort, and the old key keeps its entry', async () => {
        localStorage.setItem(SORT_KEY, saved([{ id: 'name', desc: true }]))
        const view = mount(<PeopleTable initialState={{ sorting: [{ id: 'age', desc: true }] }} />)

        await expect(ariaSorts()['Name']).toBe('descending')

        view.rerender(<PeopleTable initialState={{ sorting: [{ id: 'age', desc: true }] }} uniqueKey={OTHER_KEY} />)

        await waitFor(() => expect(ariaSorts()).toMatchObject({ Age: 'descending', Name: 'none' }))
        await expect(localStorage.getItem(OTHER_SORT_KEY)).toBeNull()
        await expect(stored(SORT_KEY)).toEqual({ v: 1, sorting: [{ id: 'name', desc: true }] })
    })

    it('after a key change a sort made by the user is saved under the new key only', async () => {
        seed()
        const before = localStorage.getItem(SORT_KEY)
        const view = mount(<PeopleTable />)

        view.rerender(<PeopleTable uniqueKey={OTHER_KEY} />)
        await waitFor(() => expect(ariaSorts()['Role']).toBe('ascending'))

        await userEvent.click(sortButton('Age'))

        await waitFor(() => expect(stored(OTHER_SORT_KEY)).toEqual({ v: 1, sorting: [{ id: 'age', desc: true }] }))
        await expect(localStorage.getItem(SORT_KEY)).toBe(before)
    })

    it('U-K04: a key that arrives late (undefined, then a value) loads that key\'s sort', async () => {
        localStorage.setItem(SORT_KEY, saved([{ id: 'name', desc: true }]))
        const setItem = vi.spyOn(Storage.prototype, 'setItem')
        const view = mount(<PeopleTable uniqueKey={undefined} />)

        await expect(ariaSorts()['Name']).toBe('none')

        view.rerender(<PeopleTable />)

        await waitFor(() => expect(ariaSorts()['Name']).toBe('descending'))
        await expect(callsFor(setItem.mock.calls, SORT_KEY)).toHaveLength(0)
    })
})

describe('StyledTable sorting persistence: controlled sorting (usePersistedSorting)', () => {
    beforeEach(() => localStorage.clear())
    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    const defaultSorting: SortingState = [{ id: 'name', desc: false }]
    const sortableColumnIds = ['name', 'role', 'age']

    /** A table whose rows come from "the server": every sorting it sends is logged as a request. */
    const ServerSortedTable = ({ uniqueKey, requests }: { uniqueKey: string; requests: SortingState[] }): JSX.Element => {
        const { sorting, onSortingChange } = usePersistedSorting({ uniqueKey, defaultSorting, sortableColumnIds })

        // The effect is the "request": it fires after the render that decided the sorting, like a query would.
        useRequestLog(sorting, requests)

        return (
            <StyledTable<Person>
                columns={personColumns}
                data={people}
                hideFooter
                initialState={{ sorting: defaultSorting }}
                locale='en'
                manualSorting
                onSortingChange={onSortingChange}
                persistSorting
                state={{ sorting }}
                uniqueKey={uniqueKey}
            />
        )
    }

    const useRequestLog = (sorting: SortingState, requests: SortingState[]): void => {
        const [, force] = useState(0)

        if (requests[requests.length - 1] !== sorting && JSON.stringify(requests[requests.length - 1]) !== JSON.stringify(sorting)) {
            requests.push(sorting)
        }

        void force
    }

    it('ST-05 / U-E02: the first request already uses the saved sort (AC 9)', async () => {
        localStorage.setItem(SORT_KEY, saved([{ id: 'role', desc: true }]))
        const requests: SortingState[] = []

        mount(<ServerSortedTable requests={requests} uniqueKey={KEY} />)

        await expect(requests[0]).toEqual([{ id: 'role', desc: true }])
        await expect(requests).toHaveLength(1)
        await expect(ariaSorts()['Role']).toBe('descending')
    })

    it('U-E05: with nothing saved the hook returns the default sorting', async () => {
        const requests: SortingState[] = []

        mount(<ServerSortedTable requests={requests} uniqueKey={KEY} />)

        await expect(requests).toEqual([defaultSorting])
        await expect(ariaSorts()['Name']).toBe('ascending')
    })

    it('StyledTable is the only writer: a click saves, the hook alone never does', async () => {
        const requests: SortingState[] = []
        const setItem = vi.spyOn(Storage.prototype, 'setItem')

        mount(<ServerSortedTable requests={requests} uniqueKey={KEY} />)
        await expect(callsFor(setItem.mock.calls, SORT_KEY)).toHaveLength(0)

        await userEvent.click(sortButton('Age'))

        await waitFor(() => expect(stored(SORT_KEY)).toEqual({ v: 1, sorting: [{ id: 'age', desc: true }] }))
        await expect(callsFor(setItem.mock.calls, SORT_KEY)).toHaveLength(1)
        await expect(requests[requests.length - 1]).toEqual([{ id: 'age', desc: true }])
    })

    it('U-E03 / U-K01: after a key change the hook supplies the new key\'s sort and nothing is written', async () => {
        localStorage.setItem(SORT_KEY, saved([{ id: 'name', desc: true }]))
        localStorage.setItem(OTHER_SORT_KEY, saved([{ id: 'role', desc: false }]))
        const requests: SortingState[] = []
        const view = mount(<ServerSortedTable requests={requests} uniqueKey={KEY} />)
        const setItem = vi.spyOn(Storage.prototype, 'setItem')
        const removeItem = vi.spyOn(Storage.prototype, 'removeItem')

        view.rerender(<ServerSortedTable requests={requests} uniqueKey={OTHER_KEY} />)

        await waitFor(() => expect(ariaSorts()['Role']).toBe('ascending'))
        await new Promise((resolve) => setTimeout(resolve, 100))
        await expect(requests[requests.length - 1]).toEqual([{ id: 'role', desc: false }])
        await expect(callsFor(setItem.mock.calls, /:sorting$/)).toHaveLength(0)
        await expect(callsFor(removeItem.mock.calls, /:sorting$/)).toHaveLength(0)
        await expect(stored(SORT_KEY)).toEqual({ v: 1, sorting: [{ id: 'name', desc: true }] })
    })
})
