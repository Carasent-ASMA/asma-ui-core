import { Profiler, useEffect, useState, type ReactElement } from 'react'
import { functionalUpdate, type SortingState, type Table } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { failOnConsoleOutput } from 'src/test-utils/memoryStorage'
import {
    ariaSorts,
    bodyNames,
    callsFor,
    FirstCommit,
    people,
    personColumns,
    sortButton,
    type Person,
} from 'src/test-utils/tableFixture'
import { usePersistedStateWriter } from '../hooks/usePersistedStateWriter'
import { StyledTable } from './StyledTableIndex'
import type { StyledTableProps } from '../types'

/**
 * Every table with a `uniqueKey` saves and restores each user's sorting (ASMA-8698; DEC-8698-OPTOUT). `persistSorting={false}`
 * is the opt-out, `persistSorting` / `={true}` is the default spelled out, and an app that owns the sorting (`state.sorting`,
 * or `manualSorting` where the server sorts) is not saved by default: the saved sort could not be applied to what the table
 * does not own, and two writers would fight over it. Real Chromium, real `localStorage`: what a user sees after a reload.
 *
 * None of these tables writes `persistSorting` unless the test is about it, so each one is the default.
 */

const KEY = 'default-sort'
const SORT_KEY = `${KEY}:sorting`
const SIZING_KEY = `${KEY}:column-sizing`
const PAGE_SIZE_KEY = `${KEY}:page-size`
const OWN_KEY = 'the-apps-own-sort'

type Props = Partial<Omit<StyledTableProps<Person, Record<string, unknown>>, 'footer' | 'hideFooter'>>

const DefaultTable = (props: Props): JSX.Element => (
    <StyledTable<Person> columns={personColumns} data={people} hideFooter locale='en' uniqueKey={KEY} {...props} />
)

const saved = (sorting: SortingState): string => JSON.stringify({ v: 1, sorting })
const stored = (key: string): unknown => JSON.parse(localStorage.getItem(key) ?? 'null') as unknown
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 60))
const tableRef = (): { ref: { current: Table<Person> | null }; table: () => Table<Person> } => {
    let instance: Table<Person> | null = null
    const ref = {
        get current() {
            return instance
        },
        set current(value: Table<Person> | null) {
            instance = value
        },
    }

    return { ref, table: () => instance! }
}
const storageSpies = () => ({
    get: vi.spyOn(Storage.prototype, 'getItem'),
    set: vi.spyOn(Storage.prototype, 'setItem'),
    remove: vi.spyOn(Storage.prototype, 'removeItem'),
})

beforeEach(() => localStorage.clear())
afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
})

describe.each([
    ['persistSorting left out', {}],
    ['persistSorting={true}', { persistSorting: true }],
] as const)('A table with a uniqueKey saves its sort: %s', (_name, extra) => {
    it('D-1: the sort comes back after a remount, in the arrow and in the rows', async () => {
        const first = mount(<DefaultTable {...extra} />)

        await userEvent.click(sortButton('Role'))
        await expect(ariaSorts()['Role']).toBe('ascending')
        await expect(stored(SORT_KEY)).toEqual({ v: 1, sorting: [{ id: 'role', desc: false }] })
        first.unmount()

        mount(<DefaultTable {...extra} />)

        await expect(ariaSorts()['Role']).toBe('ascending')
        await expect(bodyNames()).toEqual(['Charlie', 'Bob', 'Alice'])
    })

    it('D-2: it is already sorted on the first committed render, with no flash of the default', async () => {
        localStorage.setItem(SORT_KEY, saved([{ id: 'role', desc: true }]))
        let atFirstCommit: { arrow: string | null; rows: string[] } | undefined

        mount(
            <>
                <DefaultTable {...extra} />
                <FirstCommit onCommit={() => (atFirstCommit = { arrow: ariaSorts()['Role'] ?? null, rows: bodyNames() })} />
            </>,
        )

        await expect(atFirstCommit).toEqual({ arrow: 'descending', rows: ['Alice', 'Bob', 'Charlie'] })
    })

    it('D-3: Reset columns puts the declared default back and removes the entry', async () => {
        const { ref, table } = tableRef()

        mount(<DefaultTable {...extra} initialState={{ sorting: [{ id: 'name', desc: false }] }} tableInstanceRef={ref} />)
        await userEvent.click(sortButton('Age'))
        await expect(stored(SORT_KEY)).not.toBeNull()

        table().resetColumnSettings()
        await settle()

        await expect(ariaSorts()['Name']).toBe('ascending')
        await expect(localStorage.getItem(SORT_KEY)).toBeNull()
    })

    it('D-4: the user\'s sort beats the declared default; sorting back to the default removes the entry', async () => {
        const initialState = { sorting: [{ id: 'name', desc: false }] }
        const first = mount(<DefaultTable {...extra} initialState={initialState} />)

        await expect(ariaSorts()['Name']).toBe('ascending')
        await userEvent.click(sortButton('Age'))
        first.unmount()

        const second = mount(<DefaultTable {...extra} initialState={initialState} />)

        await expect(ariaSorts()['Age']).toBe('descending')

        // Name is the default: clicking it twice is not needed, its first click is ascending, the default.
        await userEvent.click(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('ascending')
        await expect(localStorage.getItem(SORT_KEY)).toBeNull()
        second.unmount()

        mount(<DefaultTable {...extra} initialState={initialState} />)

        await expect(ariaSorts()['Name']).toBe('ascending')
    })

    it('D-5: the declared default shows when nothing is saved, and mounting writes nothing', async () => {
        const spies = storageSpies()

        mount(<DefaultTable {...extra} initialState={{ sorting: [{ id: 'age', desc: true }] }} />)
        await settle()

        await expect(ariaSorts()['Age']).toBe('descending')
        await expect(callsFor(spies.set.mock.calls, /:sorting$/)).toHaveLength(0)
        await expect(callsFor(spies.remove.mock.calls, /:sorting$/)).toHaveLength(0)
    })
})

describe('A table with a uniqueKey and nothing else', () => {
    it('D-6: persistSorting={true} and leaving it out save the same entry', async () => {
        const left = mount(<DefaultTable />)

        await userEvent.click(sortButton('Role'))
        await userEvent.click(sortButton('Role'))

        const leftOut = localStorage.getItem(SORT_KEY)

        left.unmount()
        localStorage.clear()

        mount(<DefaultTable persistSorting />)
        await userEvent.click(sortButton('Role'))
        await userEvent.click(sortButton('Role'))

        await expect(leftOut).toBe(saved([{ id: 'role', desc: true }]))
        await expect(localStorage.getItem(SORT_KEY)).toBe(leftOut)
    })

    it('D-7: without a uniqueKey nothing is saved', async () => {
        const spies = storageSpies()

        mount(<DefaultTable uniqueKey={undefined} />)
        await userEvent.click(sortButton('Name'))

        await expect(ariaSorts()['Name']).toBe('ascending')
        await expect(callsFor(spies.set.mock.calls, /:sorting$/)).toHaveLength(0)
        await expect(callsFor(spies.get.mock.calls, /:sorting$/)).toHaveLength(0)
    })

    it('D-8: two tables with different keys keep their own sort', async () => {
        mount(
            <>
                <DefaultTable uniqueKey='left' />
                <DefaultTable uniqueKey='right' />
            </>,
        )
        const roleButtons = [...document.querySelectorAll<HTMLElement>('thead th')]
            .filter((cell) => cell.textContent?.trim() === 'Role')
            .map((cell) => cell.querySelector<HTMLElement>('[role="button"]')!)

        await userEvent.click(roleButtons[0]!)
        await userEvent.click(roleButtons[1]!)
        await userEvent.click(roleButtons[1]!)

        await expect(stored('left:sorting')).toEqual({ v: 1, sorting: [{ id: 'role', desc: false }] })
        await expect(stored('right:sorting')).toEqual({ v: 1, sorting: [{ id: 'role', desc: true }] })
    })
})

describe('persistSorting={false} is the opt-out', () => {
    it('D-9: nothing about sorting is read or written, and a saved entry is ignored and left as it was', async () => {
        const entry = saved([{ id: 'role', desc: true }])

        localStorage.setItem(SORT_KEY, entry)

        const spies = storageSpies()
        const first = mount(<DefaultTable persistSorting={false} initialState={{ sorting: [{ id: 'name', desc: false }] }} />)

        await expect(ariaSorts()['Name']).toBe('ascending')
        await expect(ariaSorts()['Role']).toBe('none')
        await userEvent.click(sortButton('Age'))
        first.unmount()
        mount(<DefaultTable persistSorting={false} initialState={{ sorting: [{ id: 'name', desc: false }] }} />)

        await expect(ariaSorts()['Name']).toBe('ascending')
        for (const spy of [spies.get, spies.set, spies.remove]) {
            await expect(callsFor(spy.mock.calls, SORT_KEY)).toHaveLength(0)
        }
        await expect(localStorage.getItem(SORT_KEY)).toBe(entry)
    })

    it('D-10: Reset columns leaves the sorting alone', async () => {
        const { ref, table } = tableRef()

        mount(<DefaultTable persistSorting={false} initialState={{ sorting: [{ id: 'name', desc: false }] }} tableInstanceRef={ref} />)
        await userEvent.click(sortButton('Age'))

        table().resetColumnSettings()
        await settle()

        await expect(ariaSorts()['Age']).toBe('descending')
    })

    it('D-11: the widths of the same table are still saved: only the sorting opts out', async () => {
        mount(<DefaultTable persistSorting={false} enableColumnResizing />)

        const handle = document.querySelector<HTMLElement>('thead th [class*="resizer"]')!
        const start = Math.round(handle.getBoundingClientRect().left)
        const fire = (type: string, target: EventTarget, x: number): boolean =>
            target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, view: window }))

        fire('mousedown', handle, start)
        fire('mousemove', document, start + 40)
        await settle()
        fire('mouseup', document, start + 40)
        await settle()

        await expect(localStorage.getItem(SIZING_KEY)).not.toBeNull()
        await expect(localStorage.getItem(SORT_KEY)).toBeNull()
    })
})

describe('When the app owns the sorting, StyledTable does not also save it by default', () => {
    it('D-12: state.sorting with onSortingChange: nothing read or written by StyledTable, the app\'s own storage is the only writer', async () => {
        const entry = saved([{ id: 'role', desc: true }])
        const AppOwned = (): JSX.Element => {
            const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])

            useEffect(() => {
                localStorage.setItem(OWN_KEY, JSON.stringify(sorting))
            }, [sorting])

            return (
                <DefaultTable
                    state={{ sorting }}
                    onSortingChange={(updater) => setSorting((previous) => functionalUpdate(updater, previous))}
                />
            )
        }

        localStorage.setItem(SORT_KEY, entry)

        const spies = storageSpies()
        const first = mount(<AppOwned />)

        // The app's sort, not the entry that happens to be saved under the table's key.
        await expect(ariaSorts()['Name']).toBe('ascending')
        await expect(ariaSorts()['Role']).toBe('none')

        await userEvent.click(sortButton('Age'))
        await expect(ariaSorts()['Age']).toBe('descending')
        await expect(stored(OWN_KEY)).toEqual([{ id: 'age', desc: true }])
        first.unmount()

        for (const spy of [spies.get, spies.set, spies.remove]) {
            await expect(callsFor(spy.mock.calls, SORT_KEY), `${spy.getMockName()}`).toHaveLength(0)
        }
        await expect(localStorage.getItem(SORT_KEY)).toBe(entry)
    })

    it('D-13: state.sorting alone is the app\'s state too: its sort shows, a click changes nothing, nothing is saved', async () => {
        const spies = storageSpies()

        mount(<DefaultTable state={{ sorting: [{ id: 'name', desc: false }] }} />)
        await userEvent.click(sortButton('Age'))

        await expect(ariaSorts()['Name']).toBe('ascending')
        await expect(ariaSorts()['Age']).toBe('none')
        await expect(callsFor(spies.set.mock.calls, /:sorting$/)).toHaveLength(0)
        await expect(callsFor(spies.get.mock.calls, /:sorting$/)).toHaveLength(0)
    })

    it('D-14: an empty state.sorting is still the app\'s state', async () => {
        const spies = storageSpies()

        mount(<DefaultTable state={{ sorting: [] }} />)
        await userEvent.click(sortButton('Age'))

        await expect(callsFor(spies.set.mock.calls, /:sorting$/)).toHaveLength(0)
        await expect(callsFor(spies.get.mock.calls, /:sorting$/)).toHaveLength(0)
    })

    it('D-15: onSortingChange alone is the app\'s state too: TanStack hands every change to it, so nothing is saved by default', async () => {
        const entry = saved([{ id: 'role', desc: true }])

        localStorage.setItem(SORT_KEY, entry)

        const spies = storageSpies()
        const onSortingChange = vi.fn()

        mount(<DefaultTable onSortingChange={onSortingChange} />)
        await userEvent.click(sortButton('Age'))

        await expect(onSortingChange).toHaveBeenCalled()
        // The saved entry is not applied to a state the app owns, and the click is the handler's.
        await expect(ariaSorts()['Role']).toBe('none')
        for (const spy of [spies.get, spies.set, spies.remove]) {
            await expect(callsFor(spy.mock.calls, SORT_KEY)).toHaveLength(0)
        }
        await expect(localStorage.getItem(SORT_KEY)).toBe(entry)
    })

    it('D-16: manualSorting alone does not stop the saving: the table keeps the state, and the app reads the sort from it', async () => {
        const first = tableRef()
        const view = mount(<DefaultTable manualSorting tableInstanceRef={first.ref} />)

        await userEvent.click(sortButton('Role'))

        await expect(first.table().getState().sorting).toEqual([{ id: 'role', desc: false }])
        await expect(stored(SORT_KEY)).toEqual({ v: 1, sorting: [{ id: 'role', desc: false }] })
        view.unmount()

        const second = tableRef()

        mount(<DefaultTable manualSorting tableInstanceRef={second.ref} />)

        await expect(second.table().getState().sorting).toEqual([{ id: 'role', desc: false }])
    })

    it('D-17: persistSorting={true} lets StyledTable be the writer for an app that owns the sorting', async () => {
        const AppOwned = (): JSX.Element => {
            const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }])

            return (
                <DefaultTable
                    persistSorting
                    state={{ sorting }}
                    onSortingChange={(updater) => setSorting((previous) => functionalUpdate(updater, previous))}
                />
            )
        }

        mount(<AppOwned />)
        await userEvent.click(sortButton('Age'))

        await expect(stored(SORT_KEY)).toEqual({ v: 1, sorting: [{ id: 'age', desc: true }] })
    })

    it('D-17b: a key change on a table the app owns does not set its state: the handler hears nothing', async () => {
        localStorage.setItem('other:sorting', saved([{ id: 'role', desc: true }]))

        const onSortingChange = vi.fn()
        const view = mount(<DefaultTable uniqueKey='first' persistSorting onSortingChange={onSortingChange} />)

        view.rerender(<DefaultTable uniqueKey='other' persistSorting onSortingChange={onSortingChange} />)
        await settle()

        await expect(onSortingChange).not.toHaveBeenCalled()
    })

    it('D-18: persistSorting={false} on a table the app owns saves nothing either', async () => {
        const spies = storageSpies()

        mount(<DefaultTable persistSorting={false} state={{ sorting: [{ id: 'name', desc: false }] }} />)
        await userEvent.click(sortButton('Age'))

        await expect(callsFor(spies.set.mock.calls, /:sorting$/)).toHaveLength(0)
        await expect(callsFor(spies.get.mock.calls, /:sorting$/)).toHaveLength(0)
    })
})

describe('A saved sort that cannot be used is ignored and the declared default applies', () => {
    const DEFAULT: SortingState = [{ id: 'name', desc: false }]

    it('D-19: a column that no longer exists', async () => {
        localStorage.setItem(SORT_KEY, saved([{ id: 'removed-column', desc: true }]))

        mount(<DefaultTable initialState={{ sorting: DEFAULT }} />)

        await expect(ariaSorts()['Name']).toBe('ascending')
        await expect(bodyNames()).toEqual(['Alice', 'Bob', 'Charlie'])
    })

    it('D-20: a column that cannot sort', async () => {
        localStorage.setItem(SORT_KEY, saved([{ id: 'notes', desc: true }]))

        mount(<DefaultTable initialState={{ sorting: DEFAULT }} />)

        await expect(ariaSorts()['Name']).toBe('ascending')
    })

    it('D-21: the valid part of a saved sort is kept when another part is stale', async () => {
        localStorage.setItem(
            SORT_KEY,
            saved([
                { id: 'removed-column', desc: false },
                { id: 'age', desc: true },
            ]),
        )

        mount(<DefaultTable initialState={{ sorting: DEFAULT }} />)

        await expect(ariaSorts()['Age']).toBe('descending')
        await expect(ariaSorts()['Name']).toBe('none')
    })

    it('D-22: corrupt JSON: the default applies, nothing is printed, and the next sort overwrites it with a valid entry', async () => {
        failOnConsoleOutput(vi)
        localStorage.setItem(SORT_KEY, '{not json')

        mount(<DefaultTable initialState={{ sorting: DEFAULT }} />)

        await expect(ariaSorts()['Name']).toBe('ascending')
        await userEvent.click(sortButton('Role'))
        await expect(stored(SORT_KEY)).toEqual({ v: 1, sorting: [{ id: 'role', desc: false }] })
    })

    it('D-23: a saved value of the wrong shape or version', async () => {
        for (const raw of ['[]', '42', '"name"', '{"v":2,"sorting":[{"id":"age","desc":true}]}', '{"v":1,"sorting":"age"}']) {
            localStorage.setItem(SORT_KEY, raw)

            const view = mount(<DefaultTable initialState={{ sorting: DEFAULT }} />)

            await expect(ariaSorts()['Name'], raw).toBe('ascending')
            view.unmount()
        }
    })

    it('D-24: storage that throws on every call: the table sorts in memory and prints nothing', async () => {
        failOnConsoleOutput(vi)
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new DOMException('blocked', 'SecurityError')
        })
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new DOMException('full', 'QuotaExceededError')
        })
        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
            throw new DOMException('blocked', 'SecurityError')
        })

        mount(<DefaultTable initialState={{ sorting: DEFAULT }} />)
        await userEvent.click(sortButton('Role'))

        await expect(ariaSorts()['Role']).toBe('ascending')
        await expect(bodyNames()).toEqual(['Charlie', 'Bob', 'Alice'])
    })

    it('D-25: a restored sort keeps the default comparison: an empty cell is last in both directions', async () => {
        const rows: Person[] = [...people, { id: '4', name: 'Dan', role: 'Guest', age: undefined as unknown as number, notes: '' }]

        for (const [desc, expected] of [
            [false, ['Alice', 'Bob', 'Charlie', 'Dan']],
            [true, ['Charlie', 'Bob', 'Alice', 'Dan']],
        ] as const) {
            localStorage.setItem(SORT_KEY, saved([{ id: 'age', desc }]))

            const view = mount(<DefaultTable data={rows} />)

            await expect(bodyNames(), `desc ${String(desc)}`).toEqual(expected)
            view.unmount()
        }
    })
})

describe('What saving costs (ASMA-8698)', () => {
    const resizing = { enableColumnResizing: true } as const

    it('D-26: mounting writes and removes nothing, whatever the table saves', async () => {
        for (const extra of [{}, resizing, { ...resizing, persistColumnLayout: true }, { persistColumnOrderKey: 'order-key' }]) {
            const spies = storageSpies()
            const view = mount(<DefaultTable {...extra} />)

            await settle()

            await expect(spies.set.mock.calls, JSON.stringify(extra)).toHaveLength(0)
            await expect(spies.remove.mock.calls, JSON.stringify(extra)).toHaveLength(0)
            view.unmount()
            vi.restoreAllMocks()
        }
    })

    it('D-27: each saved setting is read once per mount, and nothing is read or parsed again by a re-render or a sort', async () => {
        localStorage.setItem(SORT_KEY, saved([{ id: 'role', desc: false }]))
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: 200 }))
        localStorage.setItem(PAGE_SIZE_KEY, '25')

        const spies = storageSpies()
        const element = (): ReactElement => <DefaultTable {...resizing} />
        const view = mount(element())

        await settle()
        for (const key of [SORT_KEY, SIZING_KEY, PAGE_SIZE_KEY]) {
            await expect(callsFor(spies.get.mock.calls, key), key).toHaveLength(1)
        }

        const parse = vi.spyOn(JSON, 'parse')
        const reads = spies.get.mock.calls.length

        view.rerender(element())
        view.rerender(element())
        await userEvent.click(sortButton('Age'))
        await userEvent.click(sortButton('Age'))
        await settle()

        await expect(spies.get.mock.calls).toHaveLength(reads)
        await expect(parse).not.toHaveBeenCalled()
    })

    it('D-28: a sort click writes the sorting once, and nothing else', async () => {
        mount(<DefaultTable {...resizing} />)
        await settle()

        const spies = storageSpies()

        await userEvent.click(sortButton('Role'))
        await settle()

        await expect(spies.set.mock.calls.map(([key]) => key)).toEqual([SORT_KEY])
        await expect(spies.remove.mock.calls).toHaveLength(0)
    })

    it('D-29: a table with no key makes no storage call at all, through a mount and a sort', async () => {
        const spies = storageSpies()

        mount(<DefaultTable uniqueKey={undefined} {...resizing} />)
        await userEvent.click(sortButton('Role'))
        await settle()

        await expect(spies.get.mock.calls).toHaveLength(0)
        await expect(spies.set.mock.calls).toHaveLength(0)
        await expect(spies.remove.mock.calls).toHaveLength(0)
    })

    it('D-30: saving adds no render: a table with a key commits as often as one without', async () => {
        const commitsOf = async (extra: Props): Promise<{ mounted: number; sorted: number }> => {
            localStorage.clear()

            let commits = 0
            const view = mount(
                <Profiler id='table' onRender={() => (commits += 1)}>
                    <DefaultTable {...extra} />
                </Profiler>,
            )

            await settle()

            const mounted = commits

            commits = 0
            // A native click: the test library's click moves the real pointer, and a header under it renders its hover.
            sortButton('Role').click()
            await settle()

            const sorted = commits

            view.unmount()

            return { mounted, sorted }
        }

        const without = await commitsOf({ uniqueKey: undefined, ...resizing })
        const withKey = await commitsOf({ ...resizing })
        const withLayout = await commitsOf({ ...resizing, persistColumnLayout: true })

        await expect(withKey).toEqual(without)
        await expect(withLayout).toEqual(without)
    })

    it('D-31: the page size is saved when the user changes it, not when the table mounts, and comes back', async () => {
        const { ref, table } = tableRef()
        const spies = storageSpies()
        const first = mount(<DefaultTable tableInstanceRef={ref} />)

        await settle()
        await expect(callsFor(spies.set.mock.calls, PAGE_SIZE_KEY)).toHaveLength(0)

        table().setPageSize(25)
        await settle()

        await expect(callsFor(spies.set.mock.calls, PAGE_SIZE_KEY)).toEqual([[PAGE_SIZE_KEY, '25']])
        first.unmount()
        vi.restoreAllMocks()

        const again = tableRef()

        mount(<DefaultTable tableInstanceRef={again.ref} />)
        await settle()

        await expect(again.table().getState().pagination.pageSize).toBe(25)
    })

    it('D-32: a table with no key serialises nothing per render, through re-renders and a sort', async () => {
        const element = (): ReactElement => <DefaultTable uniqueKey={undefined} {...resizing} />
        const view = mount(element())

        await settle()

        const stringify = vi.spyOn(JSON, 'stringify')

        view.rerender(element())
        view.rerender(element())
        // A native click: the test library's own click logs its arguments, which would serialise them.
        sortButton('Role').click()
        await settle()

        const calls = stringify.mock.calls.length

        stringify.mockRestore()
        await expect(calls).toBe(0)
    })
})

/**
 * What `usePersistedStateWriter` costs per render (ASMA-8698): a table that does not save a setting computes nothing for it,
 * and one that does computes the value's signature once per render, and the default's only when a write is decided.
 * The writer runs in every `StyledTable` for sorting, widths, order and visibility, so each render pays for all four.
 */

const WRITER_KEY = 'writer-probe'
const WRITER_DEFAULT = 0

interface WriterSpy {
    /** Every value `toSignature` was asked about, in order. */
    signatures: number[]
    applied: number[]
    renders: number
}

const newWriterSpy = (): WriterSpy => ({ signatures: [], applied: [], renders: 0 })

/** The writerProbe reports through callbacks, which is what a component may do with its props. */
const WriterProbe = ({
    onApply,
    onRender,
    onSign,
    storageKey,
    value,
    controlled = false,
}: {
    onApply: (value: number) => void
    onRender: () => void
    onSign: (value: number) => void
    storageKey: string | undefined
    value: number
    controlled?: boolean
}): null => {
    onRender()

    usePersistedStateWriter<number>({
        storageKey,
        state: value,
        defaultValue: WRITER_DEFAULT,
        saved: undefined,
        controlled,
        toSignature: (candidate) => {
            onSign(candidate)

            return String(candidate)
        },
        toStorage: (candidate) => `n${String(candidate)}`,
        applyState: onApply,
    })

    return null
}

/** A writerProbe wired to `spy`, for a given key, value and control. */
const writerProbe = (spy: WriterSpy, storageKey: string | undefined, value: number, controlled = false): JSX.Element => (
    <WriterProbe
        controlled={controlled}
        onApply={(applied) => spy.applied.push(applied)}
        onRender={() => (spy.renders += 1)}
        onSign={(signed) => spy.signatures.push(signed)}
        storageKey={storageKey}
        value={value}
    />
)

describe('usePersistedStateWriter: the cost of a setting that is not saved', () => {
    it('W-01: with no key it computes no signature, in any render', async () => {
        const spy = newWriterSpy()
        const view = mount(writerProbe(spy, undefined, 1))

        for (const value of [2, 3, 4]) view.rerender(writerProbe(spy, undefined, value))

        await expect(spy.renders).toBe(4)
        await expect(spy.signatures).toEqual([])
        await expect(localStorage.length).toBe(0)
    })

    it('W-02: with a key it computes the value\'s signature once per render, and never the default\'s while nothing is written', async () => {
        const spy = newWriterSpy()
        const view = mount(writerProbe(spy, WRITER_KEY, WRITER_DEFAULT))

        view.rerender(writerProbe(spy, WRITER_KEY, WRITER_DEFAULT))
        view.rerender(writerProbe(spy, WRITER_KEY, WRITER_DEFAULT))

        await expect(spy.renders).toBe(3)
        await expect(spy.signatures).toHaveLength(spy.renders)
        // Mounting wrote nothing.
        await expect(localStorage.length).toBe(0)
    })

    it('W-03: a change is written once, and the default is compared only then', async () => {
        const spy = newWriterSpy()
        const view = mount(writerProbe(spy, WRITER_KEY, WRITER_DEFAULT))

        view.rerender(writerProbe(spy, WRITER_KEY, 5))
        await expect(localStorage.getItem(WRITER_KEY)).toBe('n5')

        // The same value again changes nothing, and writes nothing.
        view.rerender(writerProbe(spy, WRITER_KEY, 5))
        await expect(localStorage.getItem(WRITER_KEY)).toBe('n5')
        await expect(spy.signatures.filter((signed) => signed === WRITER_DEFAULT)).toHaveLength(
            // The value was the default on the first render, and the default was asked about once, for the write decision.
            1 + 1,
        )
    })

    it('W-04: a value back at the default removes the entry', async () => {
        const spy = newWriterSpy()
        const view = mount(writerProbe(spy, WRITER_KEY, WRITER_DEFAULT))

        view.rerender(writerProbe(spy, WRITER_KEY, 5))
        await expect(localStorage.getItem(WRITER_KEY)).toBe('n5')
        view.rerender(writerProbe(spy, WRITER_KEY, WRITER_DEFAULT))

        await expect(localStorage.getItem(WRITER_KEY)).toBeNull()
    })

    it('W-05: when the key goes away the table returns to the default and writes nothing', async () => {
        const spy = newWriterSpy()
        const view = mount(writerProbe(spy, WRITER_KEY, 7))

        view.rerender(writerProbe(spy, undefined, 7))

        await expect(spy.applied).toEqual([WRITER_DEFAULT])
        await expect(localStorage.length).toBe(0)
    })

    it('W-05b: when the key goes away on a state that is already the default, nothing is applied', async () => {
        const spy = newWriterSpy()
        const view = mount(writerProbe(spy, WRITER_KEY, WRITER_DEFAULT))

        view.rerender(writerProbe(spy, undefined, WRITER_DEFAULT))

        await expect(spy.applied).toEqual([])
    })

    it('W-06: when the key goes away on a controlled state, the app keeps its value', async () => {
        const spy = newWriterSpy()
        const view = mount(writerProbe(spy, WRITER_KEY, 7, true))

        view.rerender(writerProbe(spy, undefined, 7, true))

        await expect(spy.applied).toEqual([])
    })

    it('W-07: once the key has gone away it computes nothing again', async () => {
        const spy = newWriterSpy()
        const view = mount(writerProbe(spy, WRITER_KEY, 7))

        view.rerender(writerProbe(spy, undefined, 7))

        const before = spy.signatures.length

        view.rerender(writerProbe(spy, undefined, 8))
        view.rerender(writerProbe(spy, undefined, 9))

        await expect(spy.signatures).toHaveLength(before)
    })
})
