import type { ColumnDef } from '@tanstack/react-table'
import { StyledTable } from 'src/table/components/StyledTableIndex'
import { expect, userEvent, waitFor } from './interaction-api'
import { centreOf, mouse, settle } from './pressedInteraction'
import { mount } from './renderInteraction'
import { people, type Person } from './tableFixture'

/**
 * The column settings menu (the pin's popover) as its interaction tests drive it: each column is a row, the column's
 * checkbox (`menuitemcheckbox`), with its drag handle, a `menuitem` button, beside it in one `<li>` (ASMA-8875).
 */

export const PLAIN: ColumnDef<Person>[] = [
    { accessorKey: 'name', header: 'Name', size: 160 },
    { accessorKey: 'role', header: 'Role', size: 160 },
    { accessorKey: 'age', header: 'Age', size: 120 },
    { id: 'notes', header: 'Notes', size: 120 },
]

/** Name is fixed on the left (it cannot be reordered); Age cannot be hidden. */
export const RESTRICTED: ColumnDef<Person>[] = [
    { accessorKey: 'name', header: 'Name', size: 160, fixedLeft: true },
    { accessorKey: 'role', header: 'Role', size: 160 },
    { accessorKey: 'age', header: 'Age', size: 120, enableHiding: false },
    { id: 'notes', header: 'Notes', size: 120 },
]

/** Name is fixed (it cannot be reordered); Age cannot be hidden; Notes is both; Role is neither. */
export const REASONS: ColumnDef<Person>[] = [
    { accessorKey: 'name', header: 'Name', size: 160, fixedLeft: true },
    { accessorKey: 'role', header: 'Role', size: 160 },
    { accessorKey: 'age', header: 'Age', size: 120, enableHiding: false },
    { id: 'notes', header: 'Notes', size: 120, fixedRight: true, enableHiding: false },
]

export const mountTable = async (columns: ColumnDef<Person>[] = PLAIN, locale: 'en' | 'no' = 'en'): Promise<void> => {
    mount(<StyledTable<Person> columns={columns} data={people} hideFooter locale={locale} />)
    await settle(150)
}

export const pin = (): HTMLElement => document.querySelector<HTMLElement>('button[aria-haspopup="true"]')!

/** Waits for the popover's opening transition: its boxes are only where they stay once it has run. */
export const waitForMenu = async (): Promise<void> => {
    await waitFor(() => expect(pin().getAttribute('aria-expanded')).toBe('true'))
    await waitFor(() => expect(document.getAnimations().filter((animation) => animation.playState === 'running')).toHaveLength(0))
    await settle(100)
}

export const openMenu = async (): Promise<void> => {
    await userEvent.click(pin())
    await waitForMenu()
}

/** The labels of the columns shown, in order. */
export const shown = (): string[] =>
    [...document.querySelectorAll('thead th')].map((cell) => cell.textContent?.trim() ?? '').filter((text) => text !== '')

export const list = (): HTMLElement => document.querySelector<HTMLElement>('[role="menu"]')!

/** A column's row: its checkbox. */
export const rowOf = (label: string): HTMLElement => {
    const row = [...document.querySelectorAll<HTMLElement>('[class*="table-action-item"]')].find((candidate) =>
        candidate.textContent?.includes(label),
    )

    if (!row) throw new Error(`No row "${label}"`)

    return row
}
export const itemOf = (label: string): HTMLElement => rowOf(label).closest<HTMLElement>('li')!
export const nameOf = (label: string): HTMLElement => [...rowOf(label).querySelectorAll<HTMLElement>('span')].at(-1)!
export const handleOf = (label: string): HTMLButtonElement => itemOf(label).querySelector<HTMLButtonElement>('button')!
/** The handle's icon, the 20px glyph drawn where the icon always was. */
export const iconOf = (label: string): SVGElement => handleOf(label).querySelector<SVGElement>('svg')!
/** The checkbox's box, drawn in the row (a decorative box: the row is the checkbox). */
export const boxOf = (label: string): HTMLElement => rowOf(label).querySelector<HTMLElement>('[data-control="checkbox"]')!
export const isChecked = (label: string): boolean => rowOf(label).getAttribute('aria-checked') === 'true'
export const isLifted = (label: string): boolean => itemOf(label).hasAttribute('data-lifted')
export const rect = (element: Element): DOMRect => element.getBoundingClientRect()
export const resetButton = (): HTMLElement =>
    [...document.querySelectorAll<HTMLElement>('button')].find((button) => button.textContent?.trim() === 'Reset columns')!
export const announcement = (): string =>
    document.querySelector('[role="menu"] ~ [role="status"]')?.textContent?.trim() ?? ''
export const hint = (): HTMLElement => document.querySelector<HTMLElement>('[class*="reorder-hint"]')!
/** The hint's text, its no-break spaces read as spaces. */
export const hintText = (): string => hint().textContent?.replace(/\u00a0/g, ' ') ?? ''

/** Presses the handle, moves `distance` px straight down in small steps, and releases. */
export const pressAndMove = async (label: string, distance: number): Promise<void> => {
    const { x, y } = centreOf(handleOf(label))

    await mouse('mouseMoved', { x, y })
    await mouse('mousePressed', { x, y })
    for (let step = 1; step <= 6; step += 1) {
        await mouse('mouseMoved', { x, y: y + (distance * step) / 6 }, { held: true })
        await settle(16)
    }
    await mouse('mouseReleased', { x, y: y + distance })
    await settle(250)
}

/** Drags the handle of one row down (or up) to the row of another. */
export const dragRow = async (from: string, to: string): Promise<void> => {
    const distance = centreOf(handleOf(to)).y - centreOf(handleOf(from)).y

    await pressAndMove(from, distance + (distance > 0 ? 6 : -6))
}

/** Tabs until `target` has the focus, with real key presses. */
export const tabTo = async (target: Element, limit = 30): Promise<void> => {
    for (let presses = 0; presses < limit && document.activeElement !== target; presses += 1) await userEvent.tab()

    await expect(document.activeElement).toBe(target)
}

/** Tabs into the menu (its one Tab stop, the first row at first), then arrows down to the row of `label`. */
export const arrowTo = async (label: string): Promise<void> => {
    await tabTo(rowOf('Name'))
    for (let presses = 0; presses < 10 && document.activeElement !== rowOf(label); presses += 1)
        await userEvent.keyboard('{ArrowDown}')

    await expect(document.activeElement).toBe(rowOf(label))
}
