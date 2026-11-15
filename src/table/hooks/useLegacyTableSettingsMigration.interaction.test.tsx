import { StrictMode } from 'react'
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
