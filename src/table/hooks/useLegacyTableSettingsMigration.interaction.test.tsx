import { StrictMode } from 'react'
import type { Table } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { expect } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import {
    ariaSorts,
    bodyNames,
    callsFor,
    FirstCommit,
    headerCell,
    people,
    personColumns,
    type Person,
} from 'src/test-utils/tableFixture'
import { StyledTable } from '../components/StyledTableIndex'
import { DEFAULT_TABLE_PAGE_SIZE } from './usePersistedPageSize'
import type { LegacyTableSettings } from '../helpers/migrateLegacyTableSettings'
import { useLegacyTableSettingsMigration } from './useLegacyTableSettingsMigration'

/**
 * `useLegacyTableSettingsMigration` (ASMA-8698, U-10): the migration runs before the table first reads its storage, again for
 * a new scope, never without one, and never twice for the same one.
 */

const NEW = 'Docs_c1_u1_ctx'
const OLD = 'Docs_c1_u1_ctx_p1'
const OLD_B = 'Docs_c1_u1_ctx_p2'
const NEW_2 = 'Docs_c1_u2_ctx'
const SORT = JSON.stringify({ v: 1, sorting: [{ id: 'role', desc: true }] })
const WIDTHS = JSON.stringify({ name: 240 })

const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 60))
const widthOf = (label: string): number => Number.parseFloat(headerCell(label).style.width)
const calls = () => ({
    get: vi.spyOn(Storage.prototype, 'getItem'),
    set: vi.spyOn(Storage.prototype, 'setItem'),
    remove: vi.spyOn(Storage.prototype, 'removeItem'),
})

/** The hook alone, so every storage call is the hook's. */
const HookOnly = (props: LegacyTableSettings): null => {
    useLegacyTableSettingsMigration(props)

    return null
}

/** The way an app uses it: the hook in the component that renders the table, with the table's own key. */
const Page = (props: LegacyTableSettings): JSX.Element => {
    useLegacyTableSettingsMigration(props)

    return (
        <StyledTable<Person>
            columns={personColumns}
            data={people}
            enableColumnResizing
            hideFooter
            locale='en'
            persistSorting
            uniqueKey={props.newKey}
        />
    )
}

beforeEach(() => localStorage.clear())
afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
})

describe('useLegacyTableSettingsMigration', () => {
    it('U-10: the table opens with the migrated sort and width on its first commit, and the old entries are gone', async () => {
        localStorage.setItem(`${OLD}:sorting`, SORT)
        localStorage.setItem(`${OLD}:column-sizing`, WIDTHS)
        let first: { arrow: string | null; rows: string[]; width: number } | undefined

        mount(
            <>
                <Page newKey={NEW} oldKeys={[OLD]} />
                <FirstCommit
                    onCommit={() => (first = { arrow: ariaSorts()['Role'] ?? null, rows: bodyNames(), width: widthOf('Name') })}
                />
            </>,
        )

        // The table read the new key after the migration copied to it, so its very first render is already the user's.
        await expect(first).toEqual({ arrow: 'descending', rows: ['Alice', 'Bob', 'Charlie'], width: 240 })
        await expect(localStorage.getItem(`${NEW}:sorting`)).toBe(SORT)
        await expect(localStorage.getItem(`${NEW}:column-sizing`)).toBe(WIDTHS)
        await expect(localStorage.getItem(`${OLD}:sorting`)).toBeNull()
        await expect(localStorage.getItem(`${OLD}:column-sizing`)).toBeNull()
    })

    it('U-10: a new scope migrates again: another key, and another old key', async () => {
        localStorage.setItem(`${OLD}:sorting`, SORT)
        localStorage.setItem(`${OLD_B}:column-sizing`, WIDTHS)

        const view = mount(<HookOnly newKey={NEW} oldKeys={[OLD]} />)

        await expect(localStorage.getItem(`${NEW}:sorting`)).toBe(SORT)

        // Another patient: its entry has nothing of its own to copy over, so the new key keeps what it has, and is not
        // overwritten; the old entry goes.
        view.rerender(<HookOnly newKey={NEW} oldKeys={[OLD_B]} />)
        await expect(localStorage.getItem(`${NEW}:column-sizing`)).toBe(WIDTHS)
        await expect(localStorage.getItem(`${OLD_B}:column-sizing`)).toBeNull()

        // Another user: a new key, with its own old key.
        localStorage.setItem(`${OLD}:page-size`, '25')
        view.rerender(<HookOnly newKey={NEW_2} oldKeys={[OLD]} />)

        await expect(localStorage.getItem(`${NEW_2}:page-size`)).toBe('25')
        await expect(localStorage.getItem(`${OLD}:page-size`)).toBeNull()
        // The first key's entries are untouched.
        await expect(localStorage.getItem(`${NEW}:sorting`)).toBe(SORT)
    })

    it('U-10 / X5: a new key alone is a new scope: the same old keys migrate to it', async () => {
        localStorage.setItem(`${OLD}:sorting`, SORT)

        const view = mount(<HookOnly newKey={NEW} oldKeys={[OLD]} />)

        await expect(localStorage.getItem(`${NEW}:sorting`)).toBe(SORT)

        // Only the key changes (another user), and the old key has an entry again.
        localStorage.setItem(`${OLD}:sorting`, 'again')
        view.rerender(<HookOnly newKey={NEW_2} oldKeys={[OLD]} />)

        await expect(localStorage.getItem(`${NEW_2}:sorting`)).toBe('again')
        await expect(localStorage.getItem(`${OLD}:sorting`)).toBeNull()
        await expect(localStorage.getItem(`${NEW}:sorting`)).toBe(SORT)
    })

    it('U-10: the pairs of rawEntries are part of the scope: a new pair migrates, the same pair does nothing, and none does nothing', async () => {
        localStorage.setItem('ColumnOrder-row1', '["name"]')
        localStorage.setItem('ColumnOrder-row2', '["role"]')

        const spies = calls()
        const view = mount(<HookOnly newKey={undefined} rawEntries={[]} matchRawKey={() => true} />)

        await expect(spies.get).not.toHaveBeenCalled()
        await expect(spies.remove).not.toHaveBeenCalled()

        view.rerender(<HookOnly newKey={undefined} rawEntries={[{ from: 'ColumnOrder-row1', to: 'ColumnOrder' }]} />)
        await expect(localStorage.getItem('ColumnOrder')).toBe('["name"]')
        await expect(localStorage.getItem('ColumnOrder-row1')).toBeNull()

        // The same pair again, written as a new array: no scope change, nothing happens.
        spies.get.mockClear()
        view.rerender(<HookOnly newKey={undefined} rawEntries={[{ from: 'ColumnOrder-row1', to: 'ColumnOrder' }]} />)
        await expect(spies.get).not.toHaveBeenCalled()

        // Another record: a new pair is a new scope. The target has its own entry now, so it is kept and the old one goes.
        view.rerender(<HookOnly newKey={undefined} rawEntries={[{ from: 'ColumnOrder-row2', to: 'ColumnOrder' }]} />)
        await expect(localStorage.getItem('ColumnOrder')).toBe('["name"]')
        await expect(localStorage.getItem('ColumnOrder-row2')).toBeNull()
    })

    it('U-10: raw entries migrate before the table first reads them, on its first commit', async () => {
        localStorage.setItem('SubRowsOrder-row1', JSON.stringify(['role', 'name', 'age', 'notes']))
        let first: string[] | undefined
        const Sub = (): JSX.Element => {
            useLegacyTableSettingsMigration({
                newKey: undefined,
                rawEntries: [{ from: 'SubRowsOrder-row1', to: 'SubRowsOrder' }],
            })

            return <StyledTable<Person> columns={personColumns} data={people} hideFooter locale='en' persistColumnOrderKey='SubRowsOrder' />
        }

        mount(
            <>
                <Sub />
                <FirstCommit
                    onCommit={() => (first = [...document.querySelectorAll('thead th')].map((cell) => cell.textContent?.trim() ?? ''))}
                />
            </>,
        )

        await expect(first?.filter((label) => label !== '' && label !== 'Check icon')).toEqual(['Role', 'Name', 'Age', 'Notes'])
        await expect(localStorage.getItem('SubRowsOrder-row1')).toBeNull()
    })

    it('U-10: with no scope it does nothing, and does it as soon as a scope arrives', async () => {
        localStorage.setItem(`${OLD}:sorting`, SORT)

        const spies = calls()
        const view = mount(<HookOnly newKey={NEW} oldKeys={undefined} matchOldKey={() => true} />)

        view.rerender(<HookOnly newKey={NEW} oldKeys={[]} matchOldKey={() => true} />)
        view.rerender(<HookOnly newKey={undefined} oldKeys={[OLD]} />)

        await expect(spies.get).not.toHaveBeenCalled()
        await expect(spies.set).not.toHaveBeenCalled()
        await expect(spies.remove).not.toHaveBeenCalled()
        await expect(localStorage.getItem(`${OLD}:sorting`)).toBe(SORT)

        view.rerender(<HookOnly newKey={NEW} oldKeys={[OLD]} />)

        await expect(localStorage.getItem(`${NEW}:sorting`)).toBe(SORT)
        await expect(localStorage.getItem(`${OLD}:sorting`)).toBeNull()
    })

    it('U-10: the same scope again does nothing, even with a new matcher function each render', async () => {
        localStorage.setItem(`${OLD}:sorting`, SORT)

        const view = mount(<HookOnly newKey={NEW} oldKeys={[OLD]} matchOldKey={() => false} />)
        const spies = calls()

        for (let renders = 0; renders < 3; renders += 1) {
            view.rerender(<HookOnly newKey={NEW} oldKeys={[OLD]} matchOldKey={() => false} />)
        }

        await expect(spies.get).not.toHaveBeenCalled()
        await expect(spies.set).not.toHaveBeenCalled()
        await expect(spies.remove).not.toHaveBeenCalled()
    })

    it('U-10: under StrictMode (which renders twice) the result is the same and each entry is written once', async () => {
        localStorage.setItem(`${OLD}:sorting`, SORT)
        localStorage.setItem(`${OLD}:column-sizing`, WIDTHS)

        const spies = calls()

        mount(
            <StrictMode>
                <HookOnly newKey={NEW} oldKeys={[OLD]} />
            </StrictMode>,
        )
        await settle()

        await expect(localStorage.getItem(`${NEW}:sorting`)).toBe(SORT)
        await expect(localStorage.getItem(`${NEW}:column-sizing`)).toBe(WIDTHS)
        await expect(localStorage.getItem(`${OLD}:sorting`)).toBeNull()
        await expect(callsFor(spies.set.mock.calls, /^Docs_c1_u1_ctx:/)).toHaveLength(2)
        await expect(callsFor(spies.remove.mock.calls, /^Docs_c1_u1_ctx_p1:/)).toHaveLength(2)
    })

    it('U-10: the matcher form removes the other patients\' entries and keeps the neighbours', async () => {
        localStorage.setItem(`${OLD}:sorting`, SORT)
        localStorage.setItem(`${OLD_B}:sorting`, 'another patient')
        localStorage.setItem('Docs_c1_u9_ctx_p1:sorting', 'another user')

        mount(<HookOnly newKey={NEW} oldKeys={[OLD]} matchOldKey={(oldKey) => /^Docs_c1_u1_ctx_[^_:]+$/.test(oldKey)} />)

        await expect(localStorage.getItem(`${NEW}:sorting`)).toBe(SORT)
        await expect(localStorage.getItem(`${OLD_B}:sorting`)).toBeNull()
        await expect(localStorage.getItem('Docs_c1_u9_ctx_p1:sorting')).toBe('another user')
    })
})

/** The table's instance, kept in a ref that follows the table through a remount. */
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
const stored = (key: string): unknown => JSON.parse(localStorage.getItem(key) ?? 'null') as unknown
const resizer = (label: string): HTMLElement => headerCell(label).querySelector<HTMLElement>('[class*="resizer"]')!
const mouse = (type: string, target: EventTarget, clientX: number): void => {
    target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX, view: window }))
}
/** Drags a column's handle by `delta` px in three moves. */
const dragColumn = async (label: string, delta: number): Promise<void> => {
    const handle = resizer(label)
    const start = Math.round(handle.getBoundingClientRect().left)

    mouse('mousedown', handle, start)
    for (let step = 1; step <= 3; step += 1) {
        mouse('mousemove', document, start + Math.round((delta * step) / 3))
        // React flushes updates from a native document listener asynchronously.
        await new Promise((resolve) => setTimeout(resolve, 40))
    }
    mouse('mouseup', document, start + delta)
    await new Promise((resolve) => setTimeout(resolve, 60))
}

/**
 * A table whose old key holds a patient: it opens with no patient selected, so its migration is deferred, and a patient is
 * selected later without unmounting (asma-app-editor#523, reviewed by Eduard). The app applies the revision as the table's
 * React `key`, so the table reads its storage again once after a migration copied something, and `uniqueKey` never holds the id.
 */
const DeferredPage = ({
    applyRevision = true,
    defaultPageSize,
    patientId,
    tableInstanceRef,
}: {
    applyRevision?: boolean
    defaultPageSize?: number
    patientId?: string
    tableInstanceRef?: { current: Table<Person> | null }
}): JSX.Element => {
    const revision = useLegacyTableSettingsMigration({
        newKey: NEW,
        oldKeys: patientId ? [`Docs_c1_u1_ctx_${patientId}`] : undefined,
        defaultPageSize,
    })

    return (
        <StyledTable<Person>
            key={applyRevision ? revision : 0}
            columns={personColumns}
            data={people}
            enableColumnResizing
            hideFooter
            locale='en'
            tableInstanceRef={tableInstanceRef}
            uniqueKey={NEW}
        />
    )
}

describe('A table opened with no patient, then a patient selected without unmounting (asma-app-editor#523)', () => {
    it('R1: no page size is written on mount, so the patient\'s old page size is carried over and not overwritten by the default', async () => {
        localStorage.setItem(`${OLD}:page-size`, '100')

        const spies = calls()
        const { ref, table } = tableRef()
        const view = mount(<DeferredPage tableInstanceRef={ref} />)

        await settle()

        // Mounting wrote nothing for the page size, least of all the default 50.
        await expect(callsFor(spies.set.mock.calls, /:page-size$/)).toHaveLength(0)
        await expect(table().getState().pagination.pageSize).toBe(50)

        view.rerender(<DeferredPage patientId='p1' tableInstanceRef={ref} />)
        await settle()

        // The patient's 100 is copied, not kept out by an entry the table wrote itself, and the old entry is gone.
        await expect(localStorage.getItem(`${NEW}:page-size`)).toBe('100')
        await expect(localStorage.getItem(`${OLD}:page-size`)).toBeNull()
        // The table has read it again, through the revision key.
        await expect(table().getState().pagination.pageSize).toBe(100)
        await expect(localStorage.getItem(`${NEW}:page-size`)).toBe('100')
    })

    it('R2: the migrated widths are shown, and a resize changes only the resized column', async () => {
        localStorage.setItem(`${OLD}:column-sizing`, JSON.stringify({ name: 321 }))

        const view = mount(<DeferredPage />)

        await settle()
        await expect(widthOf('Name')).not.toBe(321)

        view.rerender(<DeferredPage patientId='p1' />)
        await settle()

        // The migration copied the widths, and the table, told through the revision, reads them.
        await expect(widthOf('Name')).toBe(321)
        await expect(stored(`${NEW}:column-sizing`)).toEqual({ name: 321 })

        await dragColumn('Role', 40)

        const saved = stored(`${NEW}:column-sizing`) as Record<string, number>

        await expect(saved['name']).toBe(321)
        await expect(saved['role']).toBe(widthOf('Role'))
        await expect(Object.keys(saved).sort()).toEqual(['name', 'role'])
    })

    it('R2 without the revision: the table keeps its defaults, and a resize overwrites the migrated widths (why the revision exists)', async () => {
        localStorage.setItem(`${OLD}:column-sizing`, JSON.stringify({ name: 321 }))

        const view = mount(<DeferredPage applyRevision={false} />)

        await settle()

        const defaultName = widthOf('Name')

        view.rerender(<DeferredPage applyRevision={false} patientId='p1' />)
        await settle()

        // The widths were copied to the key, but the mounted table reads its storage only when its key changes, and `uniqueKey` did not.
        await expect(stored(`${NEW}:column-sizing`)).toEqual({ name: 321 })
        await expect(widthOf('Name')).toBe(defaultName)

        await dragColumn('Role', 40)

        const saved = stored(`${NEW}:column-sizing`) as Record<string, number>

        await expect(saved['name']).toBeUndefined()
    })
})

describe('The page size is saved when the user changes it, not when the table mounts (ASMA-8698)', () => {
    it('P-01: mounting writes no page size, whether or not one is saved', async () => {
        for (const saved of [undefined, '25']) {
            localStorage.clear()
            if (saved) localStorage.setItem('size-table:page-size', saved)

            const spies = calls()
            const view = mount(<StyledTable<Person> columns={personColumns} data={people} hideFooter locale='en' uniqueKey='size-table' />)

            await settle()

            await expect(callsFor(spies.set.mock.calls, /:page-size$/), String(saved)).toHaveLength(0)
            await expect(callsFor(spies.remove.mock.calls, /:page-size$/), String(saved)).toHaveLength(0)
            view.unmount()
            vi.restoreAllMocks()
        }
    })

    it('P-02: a change by the user is written, once, and comes back after a remount', async () => {
        const first = tableRef()
        const spies = calls()
        const view = mount(
            <StyledTable<Person> columns={personColumns} data={people} hideFooter locale='en' tableInstanceRef={first.ref} uniqueKey='size-table' />,
        )

        await settle()
        first.table().setPageSize(25)
        await settle()

        await expect(callsFor(spies.set.mock.calls, /:page-size$/)).toEqual([['size-table:page-size', '25']])
        view.unmount()
        vi.restoreAllMocks()

        const again = tableRef()

        mount(<StyledTable<Person> columns={personColumns} data={people} hideFooter locale='en' tableInstanceRef={again.ref} uniqueKey='size-table' />)
        await settle()

        await expect(again.table().getState().pagination.pageSize).toBe(25)
    })

    it('P-03: loading another key\'s page size writes nothing under either key, and a change then writes under the new key only', async () => {
        localStorage.setItem('first-table:page-size', '25')
        localStorage.setItem('second-table:page-size', '10')

        const spies = calls()
        const { ref, table } = tableRef()
        const view = mount(<StyledTable<Person> columns={personColumns} data={people} hideFooter locale='en' tableInstanceRef={ref} uniqueKey='first-table' />)

        await settle()
        await expect(table().getState().pagination.pageSize).toBe(25)

        view.rerender(<StyledTable<Person> columns={personColumns} data={people} hideFooter locale='en' tableInstanceRef={ref} uniqueKey='second-table' />)
        await settle()

        await expect(table().getState().pagination.pageSize).toBe(10)
        await expect(callsFor(spies.set.mock.calls, /:page-size$/)).toHaveLength(0)

        table().setPageSize(50)
        await settle()

        await expect(callsFor(spies.set.mock.calls, /:page-size$/)).toEqual([['second-table:page-size', '50']])
        await expect(localStorage.getItem('first-table:page-size')).toBe('25')
    })
})

/** The hook, reporting each revision it returns. */
const RevisionProbe = ({ onRevision, settings }: { onRevision: (revision: number) => void; settings: LegacyTableSettings }): null => {
    onRevision(useLegacyTableSettingsMigration(settings))

    return null
}

describe('The revision the hook returns: it goes up when a migration copied something, and only then', () => {
    // The revision is per table and counts for the page's life, so each test uses a table key of its own.
    let tables = 0
    const newTable = (): string => `Rev_c1_u1_${String((tables += 1))}`
    const oldKey = (table: string, patient: string): string => `${table}_${patient}`
    const probe = (settings: LegacyTableSettings, seen: number[]): JSX.Element => (
        <RevisionProbe settings={settings} onRevision={(revision) => seen.push(revision)} />
    )

    it('REV-01: it stays 0 with nothing to copy, goes up by one for each copy, and not for the same scope again', async () => {
        const table = newTable()
        const seen: number[] = []
        const last = (): number => seen.at(-1)!

        // Nothing under the old key: nothing copied.
        const view = mount(probe({ newKey: table, oldKeys: [oldKey(table, 'p1')] }, seen))

        await expect(last()).toBe(0)

        // A patient whose old key holds entries: copied, once.
        localStorage.setItem(`${oldKey(table, 'p2')}:page-size`, '100')
        view.rerender(probe({ newKey: table, oldKeys: [oldKey(table, 'p2')] }, seen))
        await expect(last()).toBe(1)
        await expect(localStorage.getItem(`${table}:page-size`)).toBe('100')

        // The same scope again, and a render with nothing new: still 1.
        view.rerender(probe({ newKey: table, oldKeys: [oldKey(table, 'p2')] }, seen))
        view.rerender(probe({ newKey: table, oldKeys: [oldKey(table, 'p2')] }, seen))
        await expect(last()).toBe(1)

        // Another patient, whose entry the new key already has: removed, not copied, so no new revision.
        localStorage.setItem(`${oldKey(table, 'p3')}:page-size`, '25')
        view.rerender(probe({ newKey: table, oldKeys: [oldKey(table, 'p3')] }, seen))
        await expect(last()).toBe(1)
        await expect(localStorage.getItem(`${oldKey(table, 'p3')}:page-size`)).toBeNull()
        await expect(localStorage.getItem(`${table}:page-size`)).toBe('100')

        // Another patient with an entry the new key lacks: copied, so the revision goes up.
        localStorage.setItem(`${oldKey(table, 'p4')}:column-sizing`, JSON.stringify({ name: 200 }))
        view.rerender(probe({ newKey: table, oldKeys: [oldKey(table, 'p4')] }, seen))
        await expect(last()).toBe(2)
    })

    it('REV-02: under StrictMode, which runs the migration twice, one copy is one revision (not two, and not none)', async () => {
        const table = newTable()
        const seen: number[] = []

        localStorage.setItem(`${oldKey(table, 'p1')}:sorting`, SORT)
        localStorage.setItem(`${oldKey(table, 'p1')}:column-sizing`, WIDTHS)
        mount(<StrictMode>{probe({ newKey: table, oldKeys: [oldKey(table, 'p1')] }, seen)}</StrictMode>)

        // Two entries were copied in one migration: one revision.
        await expect([...new Set(seen)]).toEqual([1])
    })

    it('REV-03: a copy that storage refuses does not raise it, and the next attempt that works does', async () => {
        const table = newTable()
        const seen: number[] = []

        localStorage.setItem(`${oldKey(table, 'p1')}:page-size`, '100')

        const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new DOMException('full', 'QuotaExceededError')
        })
        const view = mount(probe({ newKey: table, oldKeys: [oldKey(table, 'p1')] }, seen))

        await expect(seen.at(-1)).toBe(0)
        await expect(localStorage.getItem(`${oldKey(table, 'p1')}:page-size`)).toBe('100')

        set.mockRestore()
        // The next mount of the table tries again: a new scope here stands for it.
        view.rerender(probe({ newKey: table, oldKeys: [oldKey(table, 'p1'), `${table}_again`] }, seen))
        await expect(seen.at(-1)).toBe(1)
    })

    it('REV-04: with no scope it stays 0, however often it renders', async () => {
        const table = newTable()
        const seen: number[] = []
        const view = mount(probe({ newKey: table, oldKeys: undefined }, seen))

        view.rerender(probe({ newKey: table, oldKeys: [] }, seen))
        view.rerender(probe({ newKey: undefined, oldKeys: ['x'] }, seen))

        await expect([...new Set(seen)]).toEqual([0])
    })

    it('REV-05: a raw entry that is copied raises it too, for a table with no newKey', async () => {
        const table = newTable()
        const seen: number[] = []

        localStorage.setItem(`${table}Order-row1`, '["name"]')
        mount(probe({ newKey: undefined, rawEntries: [{ from: `${table}Order-row1`, to: `${table}Order` }] }, seen))

        await expect(seen.at(-1)).toBe(1)
        await expect(localStorage.getItem(`${table}Order`)).toBe('["name"]')
    })

    it('REV-06: it is per table: a copy into one table does not move another\'s', async () => {
        const first = newTable()
        const second = newTable()
        const seenFirst: number[] = []
        const seenSecond: number[] = []

        localStorage.setItem(`${oldKey(first, 'p1')}:page-size`, '100')
        mount(
            <>
                {probe({ newKey: first, oldKeys: [oldKey(first, 'p1')] }, seenFirst)}
                {probe({ newKey: second, oldKeys: [oldKey(second, 'p1')] }, seenSecond)}
            </>,
        )

        await expect(seenFirst.at(-1)).toBe(1)
        await expect(seenSecond.at(-1)).toBe(0)
    })
})

describe('R1 is forward-only: a browser that ran 3.138.2 or 3.139.0 already holds the library\'s default page size (ASMA-8698)', () => {
    /** Those versions wrote the page size when the table mounted, so the new key already holds the default 50. */
    const seedLibraryDefault = (): void => {
        localStorage.setItem(`${NEW}:page-size`, String(DEFAULT_TABLE_PAGE_SIZE))
        localStorage.setItem(`${OLD}:page-size`, '100')
    }

    it('FWD-01: with defaultPageSize the patient\'s old size replaces the library\'s default, and the table, through the revision, shows it', async () => {
        seedLibraryDefault()

        const { ref, table } = tableRef()
        const view = mount(<DeferredPage defaultPageSize={DEFAULT_TABLE_PAGE_SIZE} tableInstanceRef={ref} />)

        await settle()
        await expect(table().getState().pagination.pageSize).toBe(DEFAULT_TABLE_PAGE_SIZE)

        view.rerender(<DeferredPage defaultPageSize={DEFAULT_TABLE_PAGE_SIZE} patientId='p1' tableInstanceRef={ref} />)
        await settle()

        await expect(localStorage.getItem(`${NEW}:page-size`)).toBe('100')
        await expect(localStorage.getItem(`${OLD}:page-size`)).toBeNull()
        await expect(table().getState().pagination.pageSize).toBe(100)
    })

    it('FWD-02: without the option the library\'s default stays and the patient\'s size is lost (what the option repairs)', async () => {
        seedLibraryDefault()

        const { ref, table } = tableRef()
        const view = mount(<DeferredPage tableInstanceRef={ref} />)

        await settle()
        view.rerender(<DeferredPage patientId='p1' tableInstanceRef={ref} />)
        await settle()

        await expect(localStorage.getItem(`${NEW}:page-size`)).toBe('50')
        await expect(localStorage.getItem(`${OLD}:page-size`)).toBeNull()
        await expect(table().getState().pagination.pageSize).toBe(DEFAULT_TABLE_PAGE_SIZE)
    })

    it('FWD-03: a size the user chose under the new key is kept, even with the option', async () => {
        localStorage.setItem(`${NEW}:page-size`, '25')
        localStorage.setItem(`${OLD}:page-size`, '100')

        const { ref, table } = tableRef()
        const view = mount(<DeferredPage defaultPageSize={DEFAULT_TABLE_PAGE_SIZE} tableInstanceRef={ref} />)

        await settle()
        view.rerender(<DeferredPage defaultPageSize={DEFAULT_TABLE_PAGE_SIZE} patientId='p1' tableInstanceRef={ref} />)
        await settle()

        await expect(localStorage.getItem(`${NEW}:page-size`)).toBe('25')
        await expect(table().getState().pagination.pageSize).toBe(25)
    })

    it('FWD-04: replacing the default is a copy: the revision goes up', async () => {
        const table = `Rev_fwd_${String(Date.now())}`
        const seen: number[] = []

        localStorage.setItem(`${table}:page-size`, '50')
        localStorage.setItem(`${table}_p1:page-size`, '100')

        const view = mount(<RevisionProbe settings={{ newKey: table, oldKeys: [`${table}_p1`], defaultPageSize: 50 }} onRevision={(r) => seen.push(r)} />)

        await expect(seen.at(-1)).toBe(1)
        await expect(localStorage.getItem(`${table}:page-size`)).toBe('100')
        view.unmount()
    })

    it('FWD-05: a new defaultPageSize for the same keys is a new scope: the migration runs again', async () => {
        const table = `Rev_scope_${String(Date.now())}`
        const seen: number[] = []
        const probe = (defaultPageSize: number): JSX.Element => (
            <RevisionProbe settings={{ newKey: table, oldKeys: [`${table}_p1`], defaultPageSize }} onRevision={(r) => seen.push(r)} />
        )

        localStorage.setItem(`${table}:page-size`, '50')
        localStorage.setItem(`${table}_p1:page-size`, '100')

        // The default is 25, so the 50 is the user's: kept, the old one removed, nothing copied.
        const view = mount(probe(25))

        await expect(seen.at(-1)).toBe(0)
        await expect(localStorage.getItem(`${table}:page-size`)).toBe('50')

        // The old key holds a size again, and the table's default is now 50: the same keys, a new scope, so it runs again.
        localStorage.setItem(`${table}_p1:page-size`, '100')
        view.rerender(probe(50))

        await expect(seen.at(-1)).toBe(1)
        await expect(localStorage.getItem(`${table}:page-size`)).toBe('100')
    })

    it('FWD-06: DEFAULT_TABLE_PAGE_SIZE is the page size a table opens with, and a pageSize prop overrides it', async () => {
        const first = tableRef()
        const view = mount(<StyledTable<Person> columns={personColumns} data={people} hideFooter locale='en' tableInstanceRef={first.ref} uniqueKey='default-size-table' />)

        await settle()
        await expect(DEFAULT_TABLE_PAGE_SIZE).toBe(50)
        await expect(first.table().getState().pagination.pageSize).toBe(DEFAULT_TABLE_PAGE_SIZE)
        view.unmount()

        const second = tableRef()

        mount(<StyledTable<Person> columns={personColumns} data={people} hideFooter locale='en' pageSize={20} tableInstanceRef={second.ref} uniqueKey='default-size-table-2' />)
        await settle()
        await expect(second.table().getState().pagination.pageSize).toBe(20)
    })
})

