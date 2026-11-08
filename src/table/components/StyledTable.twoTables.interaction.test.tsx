import { afterEach, beforeEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { people, personColumns } from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'

/**
 * ST-14 (ASMA-8597, AC 6): two opted-in tables on one page, with different `uniqueKey`s, keep separate
 * entries. Sorting or resizing one never changes the other's saved values, and each restores its own.
 */

const A = 'two-tables-a'
const B = 'two-tables-b'
const keys = {
    aSort: `${A}:sorting`,
    bSort: `${B}:sorting`,
    aSizing: `${A}:column-sizing`,
    bSizing: `${B}:column-sizing`,
}

const TwoTables = (): JSX.Element => (
    <>
        {[A, B].map((key) => (
            <div key={key} data-testid={key}>
                <StyledTable
                    columns={personColumns}
                    data={people}
                    enableColumnResizing
                    hideFooter
                    locale='en'
                    persistSorting
                    uniqueKey={key}
                />
            </div>
        ))}
    </>
)

const within = (key: string): HTMLElement => document.querySelector<HTMLElement>(`[data-testid="${key}"]`)!
const header = (key: string, label: string): HTMLTableCellElement =>
    [...within(key).querySelectorAll<HTMLTableCellElement>('thead th')].find((cell) => cell.textContent?.trim() === label)!
const sortButton = (key: string, label: string): HTMLElement => header(key, label).querySelector<HTMLElement>('[role="button"]')!
const widthOf = (key: string, label: string): number => Number.parseFloat(header(key, label).style.width)
const raw = (storageKey: string): string | null => localStorage.getItem(storageKey)
const entries = (): Record<string, string | null> => Object.fromEntries(Object.values(keys).map((key) => [key, raw(key)]))
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 30))

const mouse = (type: string, target: EventTarget, clientX: number): void => {
    target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX, view: window }))
}

const drag = async (key: string, label: string, delta: number): Promise<void> => {
    const handle = header(key, label).querySelector<HTMLElement>('[class*="resizer"]')!
    const start = Math.round(handle.getBoundingClientRect().left)

    mouse('mousedown', handle, start)
    await settle()
    mouse('mousemove', document, start + delta)
    await settle()
    mouse('mouseup', document, start + delta)
    await settle()
    // A real drag ends with a click on the header, which clears the table's "resizing" flag; without it the
    // next click on a header would be taken as the end of the resize and not sort.
    mouse('click', handle, start + delta)
    await settle()
}

describe('two opted-in tables on one page (ST-14, AC 6)', () => {
    beforeEach(() => localStorage.clear())
    afterEach(cleanup)

    it('keeps four distinct entries, changing one table leaves the other byte-identical, and each restores its own', async () => {
        const first = mount(<TwoTables />)

        await userEvent.click(sortButton(A, 'Name'))
        await userEvent.click(sortButton(B, 'Role'))
        await userEvent.click(sortButton(B, 'Role'))
        await drag(A, 'Name', 60)
        await drag(B, 'Role', -40)

        await waitFor(() => expect(Object.values(entries()).every((value) => value !== null)).toBe(true))

        const saved = entries()

        // Four distinct entries, each holding only its own table's values.
        await expect(new Set(Object.values(saved)).size).toBe(4)
        await expect(JSON.parse(saved[keys.aSort]!)).toEqual({ v: 1, sorting: [{ id: 'name', desc: false }] })
        await expect(JSON.parse(saved[keys.bSort]!)).toEqual({ v: 1, sorting: [{ id: 'role', desc: true }] })
        await expect(Object.keys(JSON.parse(saved[keys.aSizing]!) as object)).toContain('name')
        await expect(Object.keys(JSON.parse(saved[keys.aSizing]!) as object)).not.toContain('role')
        await expect(Object.keys(JSON.parse(saved[keys.bSizing]!) as object)).toContain('role')
        await expect(Object.keys(JSON.parse(saved[keys.bSizing]!) as object)).not.toContain('name')

        // A change to table A leaves table B's two entries byte-identical.
        await userEvent.click(sortButton(A, 'Age'))
        await drag(A, 'Role', 30)
        await waitFor(() => expect(raw(keys.aSort)).not.toBe(saved[keys.aSort]))
        await expect(raw(keys.bSort)).toBe(saved[keys.bSort])
        await expect(raw(keys.bSizing)).toBe(saved[keys.bSizing])

        const afterChange = entries()
        const widths = { aName: widthOf(A, 'Name'), aRole: widthOf(A, 'Role'), bRole: widthOf(B, 'Role'), bName: widthOf(B, 'Name') }

        first.unmount()
        mount(<TwoTables />)

        // After a remount each table has its own sort and its own widths.
        await expect(header(A, 'Age')).toHaveAttribute('aria-sort', 'descending')
        await expect(header(A, 'Name')).toHaveAttribute('aria-sort', 'none')
        await expect(header(B, 'Role')).toHaveAttribute('aria-sort', 'descending')
        await expect(header(B, 'Age')).toHaveAttribute('aria-sort', 'none')
        await expect({ aName: widthOf(A, 'Name'), aRole: widthOf(A, 'Role'), bRole: widthOf(B, 'Role'), bName: widthOf(B, 'Name') }).toEqual(widths)
        await expect(entries()).toEqual(afterChange)
    })
})
