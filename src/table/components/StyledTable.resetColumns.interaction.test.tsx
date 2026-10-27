import { useLayoutEffect, useRef, useState } from 'react'
import type { SortingState, Table, VisibilityState } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import {
    ariaSorts,
    callsFor,
    FirstCommit,
    headerCell,
    people,
    personColumns,
    resolveColor,
    sortButton,
    type Person,
} from 'src/test-utils/tableFixture'
import { SnackbarProvider } from 'src/components/feedback/snack-bar/SnackbarProvider'
import { StyledTable } from './StyledTableIndex'
import type { StyledTableProps } from '../types'

/**
 * Reset columns and the column settings dot (ASMA-8597, REQ-008, REQ-012; owner decision D1 for sorting).
 * The popover is driven the way a user does it. Moving a column needs a drag, so the harness moves columns
 * through the table instance, which is exactly what the popover's drag handler calls.
 */

const KEY = 'reset-table'
const SORT_KEY = `${KEY}:sorting`
const SIZING_KEY = `${KEY}:column-sizing`
const PAGE_SIZE_KEY = `${KEY}:page-size`
const ORDER_KEY = 'reset-table-order'
const DEFAULT_SORTING: SortingState = [{ id: 'name', desc: false }]

type Props = Partial<Omit<StyledTableProps<Person, Record<string, unknown>>, 'footer' | 'hideFooter'>>

interface HarnessApi {
    table: () => Table<Person>
}

const Harness = ({
    onApi,
    hiddenByDefault = {},
    ...props
}: Props & { onApi: (api: HarnessApi) => void; hiddenByDefault?: VisibilityState }): JSX.Element => {
    const [visibility, setVisibility] = useState<VisibilityState>(hiddenByDefault)
    const [generation, setGeneration] = useState(0)
    const tableRef = useRef<Table<Person> | null>(null)

    useLayoutEffect(() => {
        onApi({ table: () => tableRef.current! })
    }, [onApi])

    return (
        <>
            <SnackbarProvider />
            <button type='button' onClick={() => setGeneration((value) => value + 1)}>
                Remount table
            </button>
            <StyledTable<Person>
                key={generation}
                columns={personColumns}
                data={people}
                enableColumnResizing
                hideFooter
                initialState={{ sorting: DEFAULT_SORTING }}
                locale='en'
                onColumnVisibilityChange={setVisibility}
                persistColumnOrderKey={ORDER_KEY}
                persistSorting
                state={{ columnVisibility: visibility }}
                tableInstanceRef={tableRef}
                uniqueKey={KEY}
                {...props}
            />
        </>
    )
}

const mountHarness = (props: Props = {}) => {
    const api: { current: HarnessApi | null } = { current: null }
    const onApi = (next: HarnessApi): void => {
        api.current = next
    }
    const view = mount(<Harness onApi={onApi} {...props} />)

    return { onApi, view, table: () => api.current!.table() }
}

const headerLabels = (): string[] =>
    [...document.querySelectorAll('thead th')].map((cell) => cell.textContent?.trim() ?? '').filter(Boolean)

const widthOf = (label: string): number => Number.parseFloat(headerCell(label).style.width)
const stored = (key: string): unknown => JSON.parse(localStorage.getItem(key) ?? 'null')
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
const isShown = (text: string): boolean =>
    [...document.querySelectorAll('*')].some(
        (element) =>
            element.childElementCount === 0 && element.textContent === text && (element as HTMLElement).checkVisibility(),
    )
const openPopover = async (): Promise<void> => {
    await userEvent.click(pin())
    await waitFor(() => expect(pin().getAttribute('aria-expanded')).toBe('true'))
}
const act = async (change: () => void): Promise<void> => {
    // Table-instance calls run outside React's event system: let React flush them.
    change()
    await new Promise((resolve) => setTimeout(resolve, 30))
}

describe('Reset columns', () => {
    beforeEach(() => localStorage.clear())
    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it('ST-06: puts order, widths and sorting back, removes their entries, and leaves the hidden column hidden (AC 11)', async () => {
        const { table } = mountHarness()

        await openPopover()
        await userEvent.click(popoverButton('Role'))
        await waitFor(() => expect(headerLabels()).not.toContain('Role'))

        await act(() => table().setColumnOrder(['age', 'name', 'role', 'notes']))
        await act(() => table().setColumnSizing({ name: 260 }))
        await userEvent.click(sortButton('Age'))

        await waitFor(() => expect(stored(SORT_KEY)).toEqual({ v: 1, sorting: [{ id: 'age', desc: true }] }))
        await expect(stored(SIZING_KEY)).toEqual({ name: 260 })
        await expect(stored(ORDER_KEY)).toEqual(['age', 'name', 'role', 'notes'])
        await expect(headerLabels().slice(0, 2)).toEqual(['Age', 'Name'])
        await expect(widthOf('Name')).toBe(260)
        const pageSize = localStorage.getItem(PAGE_SIZE_KEY)

        // Clicking the header closed the popover; open it again.
        await openPopover()
        await userEvent.click(popoverButton('Reset columns'))

        await waitFor(() => expect(isShown('Columns reset')).toBe(true))
        await waitFor(() => expect(headerLabels()).toEqual(['Name', 'Age', 'Notes']))
        await expect(widthOf('Name')).toBe(160)
        await expect(ariaSorts()).toMatchObject({ Name: 'ascending', Age: 'none' })
        await expect(localStorage.getItem(SORT_KEY)).toBeNull()
        await expect(localStorage.getItem(SIZING_KEY)).toBeNull()
        await expect(localStorage.getItem(ORDER_KEY)).toBeNull()
        // Not part of Reset columns: page size, and the hidden column.
        await expect(localStorage.getItem(PAGE_SIZE_KEY)).toBe(pageSize)
        await expect(headerLabels()).not.toContain('Role')

        // After a remount the defaults stay, and the column is still hidden.
        await userEvent.click(document.querySelector<HTMLElement>('body > div button')!)
        await waitFor(() => expect(headerLabels()).toEqual(['Name', 'Age', 'Notes']))
        await expect(ariaSorts()).toMatchObject({ Name: 'ascending' })
        await expect(widthOf('Name')).toBe(160)
    })

    it('restores the app\'s defaults even when the table started from saved settings (trap A)', async () => {
        // `table.initialState` holds the saved state, so a reset that falls back to it (TanStack's own
        // resetSorting() or resetColumnSizing()) would put the saved values straight back.
        localStorage.setItem(SORT_KEY, JSON.stringify({ v: 1, sorting: [{ id: 'age', desc: true }] }))
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: 260 }))
        localStorage.setItem(ORDER_KEY, JSON.stringify(['age', 'name', 'role', 'notes']))
        mountHarness()

        await expect(ariaSorts()['Age']).toBe('descending')
        await expect(widthOf('Name')).toBe(260)
        await expect(headerLabels().slice(0, 2)).toEqual(['Age', 'Name'])

        await openPopover()
        await userEvent.click(popoverButton('Reset columns'))

        await waitFor(() => expect(headerLabels()).toEqual(['Name', 'Role', 'Age', 'Notes']))
        await expect(ariaSorts()).toMatchObject({ Name: 'ascending', Age: 'none' })
        await expect(widthOf('Name')).toBe(160)
        await expect(localStorage.getItem(SORT_KEY)).toBeNull()
        await expect(localStorage.getItem(SIZING_KEY)).toBeNull()
        await expect(localStorage.getItem(ORDER_KEY)).toBeNull()
    })

    it('resetColumnOrder() sets [] (the live definition order), not a list captured when the table was created', async () => {
        const { onApi, view, table } = mountHarness()

        await act(() => table().setColumnOrder(['age', 'name', 'role', 'notes']))
        // `role` leaves the column definitions while the table stays mounted.
        view.rerender(<Harness onApi={onApi} columns={personColumns.filter((column) => 'accessorKey' in column && column.accessorKey !== 'role')} />)
        await waitFor(() => expect(headerLabels()).not.toContain('Role'))

        await act(() => table().resetColumnOrder())

        await expect(table().getState().columnOrder).toEqual([])
        await waitFor(() => expect(headerLabels()).toEqual(['Name', 'Age']))
    })

    it('Reset columns clears the widths of absent columns too: a column that appears later gets the default width (DEC-W)', async () => {
        localStorage.setItem(SIZING_KEY, JSON.stringify({ name: 240, role: 200 }))
        const [name, role, age, notes] = personColumns as [
            (typeof personColumns)[number],
            (typeof personColumns)[number],
            (typeof personColumns)[number],
            (typeof personColumns)[number],
        ]
        const { onApi, view } = mountHarness({ columns: [name, age, notes] })

        await expect(widthOf('Name')).toBe(240)

        await openPopover()
        await userEvent.click(popoverButton('Reset columns'))

        await waitFor(() => expect(widthOf('Name')).toBe(160))
        // The saved entry is gone, `role`'s width included, and stays gone.
        await expect(localStorage.getItem(SIZING_KEY)).toBeNull()

        // A later column is not given the width that was saved before the reset.
        view.rerender(<Harness onApi={onApi} columns={[name, role, age, notes]} />)
        await waitFor(() => expect(headerLabels()).toContain('Role'))
        await expect(widthOf('Role')).toBe(160)
        await new Promise((resolve) => setTimeout(resolve, 100))
        await expect(localStorage.getItem(SIZING_KEY)).toBeNull()
    })

    it('shows the Norwegian texts with locale no', async () => {
        mountHarness({ locale: 'no' })

        await openPopover()
        await userEvent.click(popoverButton('Tilbakestill kolonner'))

        await waitFor(() => expect(isShown('Kolonnene er tilbakestilt')).toBe(true))
        await expect(pin().getAttribute('aria-label')).toBe('Kolonneinnstillinger')
    })

    it('removes stale entries even when the state is already the default', async () => {
        localStorage.setItem(SORT_KEY, '{')
        localStorage.setItem(SIZING_KEY, 'not json')
        localStorage.setItem(ORDER_KEY, '{"a":1}')
        mountHarness()

        await openPopover()
        await userEvent.click(popoverButton('Reset columns'))

        await waitFor(() => expect(isShown('Columns reset')).toBe(true))
        await expect(localStorage.getItem(SORT_KEY)).toBeNull()
        await expect(localStorage.getItem(SIZING_KEY)).toBeNull()
        await expect(localStorage.getItem(ORDER_KEY)).toBeNull()
    })

    it('U-C05: on a table without persistSorting it leaves the sorting alone but still resets order and widths', async () => {
        const setItem = vi.spyOn(Storage.prototype, 'setItem')
        const removeItem = vi.spyOn(Storage.prototype, 'removeItem')
        const { table } = mountHarness({ persistSorting: false })

        await userEvent.click(sortButton('Age'))
        await act(() => table().setColumnOrder(['age', 'name', 'role', 'notes']))
        await act(() => table().setColumnSizing({ name: 260 }))
        await openPopover()
        await userEvent.click(popoverButton('Reset columns'))

        await waitFor(() => expect(headerLabels()).toEqual(['Name', 'Role', 'Age', 'Notes']))
        await expect(widthOf('Name')).toBe(160)
        await expect(ariaSorts()['Age']).toBe('descending')
        await expect(callsFor(setItem.mock.calls, SORT_KEY)).toHaveLength(0)
        await expect(callsFor(removeItem.mock.calls, SORT_KEY)).toHaveLength(0)
    })

    it('U-C04: leaves visibility and page size alone', async () => {
        const { table } = mountHarness()
        await act(() => table().setPageSize(10))
        await waitFor(() => expect(stored(PAGE_SIZE_KEY)).toBe(10))

        await openPopover()
        await userEvent.click(popoverButton('Role'))
        await userEvent.click(popoverButton('Reset columns'))

        await waitFor(() => expect(isShown('Columns reset')).toBe(true))
        await expect(table().getState().pagination.pageSize).toBe(10)
        await expect(stored(PAGE_SIZE_KEY)).toBe(10)
        await expect(table().getColumn('role')!.getIsVisible()).toBe(false)
    })

    it('A-02: starting with focus put on the pin (.focus(), no key path reaches it), Enter opens it, Tab walks the panel to Reset columns without jumping to a body row, and Enter runs it', async () => {
        const { table } = mountHarness()

        await act(() => table().setColumnSizing({ name: 260 }))
        pin().focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(pin().getAttribute('aria-expanded')).toBe('true'))

        const reset = popoverButton('Reset columns')
        const visited: Element[] = []

        for (let presses = 0; presses < 40 && document.activeElement !== reset; presses += 1) {
            await userEvent.keyboard('{Tab}')
            visited.push(document.activeElement!)
        }

        await expect(document.activeElement).toBe(reset)
        // Every column's row control was passed on the way, in order, inside the panel (not the table rows).
        await expect(visited.some((element) => element.closest('tbody') !== null)).toBe(false)
        await expect(visited.length).toBeGreaterThanOrEqual(4)

        await userEvent.keyboard('{Enter}')

        await waitFor(() => expect(widthOf('Name')).toBe(160))
        await waitFor(() => expect(isShown('Columns reset')).toBe(true))
        // The snackbar sits in a live region, so it is announced, and focus has not been thrown to the page.
        await expect(document.querySelector('[role="status"], [role="alert"], [aria-live]')).not.toBeNull()
        await expect(document.activeElement).not.toBe(document.body)
    })

    it('A-02: starting with focus put on the pin, Space runs Reset columns too, and Shift+Tab goes back through the panel', async () => {
        const { table } = mountHarness()

        await act(() => table().setColumnSizing({ name: 260 }))
        pin().focus()
        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(pin().getAttribute('aria-expanded')).toBe('true'))
        const reset = popoverButton('Reset columns')

        for (let presses = 0; presses < 40 && document.activeElement !== reset; presses += 1) {
            await userEvent.keyboard('{Tab}')
        }
        await expect(document.activeElement).toBe(reset)

        await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
        await expect(document.activeElement).not.toBe(reset)
        await expect(document.activeElement?.closest('tbody')).toBeNull()

        await userEvent.keyboard('{Tab}')
        await expect(document.activeElement).toBe(reset)
        await userEvent.keyboard('{ }')

        await waitFor(() => expect(widthOf('Name')).toBe(160))
    })
})

describe('Column settings pin dot (AC 18)', () => {
    beforeEach(() => localStorage.clear())
    afterEach(() => {
        cleanup()
        vi.restoreAllMocks()
    })

    it('ST-13: shows for a hidden or moved column, and goes away when the layout is back to its defaults', async () => {
        const { table } = mountHarness()

        await expect(dot()).toBeNull()

        await openPopover()
        await userEvent.click(popoverButton('Role'))
        await waitFor(() => expect(dot()).not.toBeNull())

        await userEvent.click(popoverButton('Role'))
        await waitFor(() => expect(dot()).toBeNull())

        await act(() => table().setColumnOrder(['role', 'name', 'age', 'notes']))
        await waitFor(() => expect(dot()).not.toBeNull())

        await act(() => table().setColumnOrder(['name', 'role', 'age', 'notes']))
        await waitFor(() => expect(dot()).toBeNull())

        // Widths and sorting never show the dot.
        await act(() => table().setColumnSizing({ name: 300 }))
        await userEvent.click(sortButton('Age'))
        await expect(dot()).toBeNull()
    })

    it('ST-13: Reset removes the dot, unless a column is still hidden', async () => {
        const { table } = mountHarness()

        await openPopover()
        await userEvent.click(popoverButton('Role'))
        await act(() => table().setColumnOrder(['age', 'name', 'role', 'notes']))
        await waitFor(() => expect(dot()).not.toBeNull())

        await expect(pin()).toHaveAccessibleName('Column settings, changed')

        await userEvent.click(popoverButton('Reset columns'))
        await waitFor(() => expect(headerLabels()).toEqual(['Name', 'Age', 'Notes']))
        // Reordered no more, but Role is still hidden: the dot stays, and so does the name that says it.
        await expect(dot()).not.toBeNull()
        await expect(pin()).toHaveAccessibleName('Column settings, changed')

        await userEvent.click(popoverButton('Role'))
        await waitFor(() => expect(dot()).toBeNull())
        await expect(pin()).toHaveAccessibleName('Column settings')
    })

    it('ST-13: a stored column order shows the dot on the first render (Q9)', async () => {
        localStorage.setItem(ORDER_KEY, JSON.stringify(['role', 'name', 'age', 'notes']))
        let dotAtFirstCommit: boolean | undefined

        mount(
            <>
                <Harness onApi={() => undefined} />
                <FirstCommit onCommit={() => (dotAtFirstCommit = dot() !== null)} />
            </>,
        )

        await expect(dotAtFirstCommit).toBe(true)
    })

    it('ST-13 / OQ-04: a column hidden by default shows the dot and the "changed" name on the first render (Q10)', async () => {
        let first: { dot: boolean; name: string | null } | undefined

        mount(
            <>
                <Harness hiddenByDefault={{ role: false }} onApi={() => undefined} />
                <FirstCommit
                    onCommit={() => {
                        first = { dot: dot() !== null, name: pin().getAttribute('aria-label') }
                    }}
                />
            </>,
        )

        await expect(first).toEqual({ dot: true, name: 'Column settings, changed' })
        await expect(headerLabels()).not.toContain('Role')
        await expect(pin()).toHaveAccessibleName('Column settings, changed')
    })

    it('ST-13: a stored order that matches the definition order shows no dot', async () => {
        localStorage.setItem(ORDER_KEY, JSON.stringify(['name', 'role', 'age', 'notes']))

        mountHarness()

        await expect(dot()).toBeNull()
    })

    it('ST-13: the dot is the Filter dot: 8 x 8 px, gama-500, at the pin icon\'s top right', async () => {
        localStorage.setItem(ORDER_KEY, JSON.stringify(['role', 'name', 'age', 'notes']))
        mountHarness()

        const circle = dot()!.querySelector<HTMLElement>('[aria-hidden="true"]')!
        const box = circle.getBoundingClientRect()
        const icon = pin().querySelector('svg')!.getBoundingClientRect()

        await expect(box.width).toBe(8)
        await expect(box.height).toBe(8)
        await expect(getComputedStyle(circle).backgroundColor).toBe(resolveColor('var(--colors-gama-500)'))
        // Figma "Header pin": the 8px dot ends 4px beyond the icon's right edge and starts 2px above its top.
        await expect(Math.abs(box.right - icon.right - 4)).toBeLessThanOrEqual(0.5)
        await expect(Math.abs(icon.top - box.top - 2)).toBeLessThanOrEqual(0.5)
    })

    it('OQ-04: the pin says so when the dot shows: "Column settings, changed" / "Kolonneinnstillinger, endret", in both locales', async () => {
        const names = { en: ['Column settings', 'Column settings, changed'], no: ['Kolonneinnstillinger', 'Kolonneinnstillinger, endret'] } as const

        for (const locale of ['en', 'no'] as const) {
            const [plain, changed] = names[locale]

            // No dot: the plain name.
            localStorage.clear()
            const untouched = mountHarness({ locale })
            await expect(dot()).toBeNull()
            await expect(pin()).toHaveAccessibleName(plain)
            untouched.view.unmount()

            // The dot shows for a stored order that differs from the definition order, from the first render.
            localStorage.setItem(ORDER_KEY, JSON.stringify(['role', 'name', 'age', 'notes']))
            const reordered = mountHarness({ locale })
            await expect(dot()).not.toBeNull()
            await expect(pin()).toHaveAccessibleName(changed)
            reordered.view.unmount()
        }
    })

    it('OQ-04: the name follows the dot: a hidden column, a reorder, moving back, and Reset all change it', async () => {
        const { table } = mountHarness()

        await expect(pin()).toHaveAccessibleName('Column settings')

        // A hidden column.
        await openPopover()
        await userEvent.click(popoverButton('Role'))
        await waitFor(() => expect(pin()).toHaveAccessibleName('Column settings, changed'))
        await expect(dot()).not.toBeNull()
        await userEvent.click(popoverButton('Role'))
        await waitFor(() => expect(pin()).toHaveAccessibleName('Column settings'))
        await expect(dot()).toBeNull()

        // A reorder, and moving the column back.
        await act(() => table().setColumnOrder(['role', 'name', 'age', 'notes']))
        await waitFor(() => expect(pin()).toHaveAccessibleName('Column settings, changed'))
        await act(() => table().setColumnOrder(['name', 'role', 'age', 'notes']))
        await waitFor(() => expect(pin()).toHaveAccessibleName('Column settings'))

        // Reset clears the dot, and the name with it.
        await act(() => table().setColumnOrder(['age', 'name', 'role', 'notes']))
        await waitFor(() => expect(pin()).toHaveAccessibleName('Column settings, changed'))
        await openPopover()
        await userEvent.click(popoverButton('Reset columns'))
        await waitFor(() => expect(dot()).toBeNull())
        await expect(pin()).toHaveAccessibleName('Column settings')
    })

    it('OQ-04: Norwegian too after a reorder and after Reset', async () => {
        const { table } = mountHarness({ locale: 'no' })

        await act(() => table().setColumnOrder(['role', 'name', 'age', 'notes']))
        await waitFor(() => expect(pin()).toHaveAccessibleName('Kolonneinnstillinger, endret'))

        await openPopover()
        await userEvent.click(popoverButton('Tilbakestill kolonner'))
        await waitFor(() => expect(pin()).toHaveAccessibleName('Kolonneinnstillinger'))
        await expect(dot()).toBeNull()
    })

    it('U-C03: an order that is [] or equals the definition order removes the saved order', async () => {
        const { table } = mountHarness()

        await act(() => table().setColumnOrder(['role', 'name', 'age', 'notes']))
        await expect(stored(ORDER_KEY)).toEqual(['role', 'name', 'age', 'notes'])

        await act(() => table().setColumnOrder(['name', 'role', 'age', 'notes']))
        await expect(localStorage.getItem(ORDER_KEY)).toBeNull()

        await act(() => table().setColumnOrder(['age', 'name', 'role', 'notes']))
        await expect(localStorage.getItem(ORDER_KEY)).not.toBeNull()

        await act(() => table().setColumnOrder([]))
        await expect(localStorage.getItem(ORDER_KEY)).toBeNull()
    })
})
