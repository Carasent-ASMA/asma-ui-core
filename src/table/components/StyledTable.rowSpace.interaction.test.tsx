import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { button, enterBody, row } from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'
import type { StyledTableProps } from '../types'

/**
 * ASMA-8875 AC 4, as the user reads it (round 7): Space on a row itself selects it or expands it. With a select column it
 * ticks or unticks the row's checkbox (a locked row: nothing); with none, it expands or collapses the row as its chevron
 * does; otherwise it does nothing, and the browser keeps the key. Space on a control is the control's, once. And a click
 * on a select checkbox focuses it (as a click on the ⋮ does), so Space then toggles it back. Every key is a real press.
 */

interface Row {
    id: string
    name: string
}
interface Inner {
    id: string
    title: string
}

const data: Row[] = [
    { id: 'r-1', name: 'First' },
    { id: 'r-2', name: 'Second' },
]
const columns: ColumnDef<Row>[] = [{ accessorKey: 'name', header: 'Name' }]
const innerColumns: ColumnDef<Inner>[] = [{ accessorKey: 'title', header: 'Title' }]

type TableProps = Partial<Omit<StyledTableProps<Row, Inner>, 'footer'>>

const mountTable = (props: TableProps = {}): void => {
    mount(
        <div>
            <button type='button'>Before</button>
            <StyledTable<Row, Inner> locale='en' columns={columns} data={data} hideFooter expandArrow getRowCanExpand={() => true} {...props} />
            <button type='button'>After</button>
        </div>,
    )
}

const withSelect: TableProps = { enableRowSelection: true, initialState: { columnVisibility: { select: true } } }

const checkbox = (id: string): HTMLElement => row(id).querySelector<HTMLElement>('[role="checkbox"]')!
const chevron = (id: string): HTMLElement => row(id).querySelector<HTMLElement>('button[aria-expanded]')!

/** Presses Space and says whether something in the page kept the browser's default (a window listener runs after React's). */
const pressSpace = async (): Promise<boolean> => {
    let prevented = false
    const listen = (event: KeyboardEvent): void => {
        if (event.key === ' ') prevented = event.defaultPrevented
    }

    window.addEventListener('keydown', listen)
    try {
        await userEvent.keyboard('{ }')
    } finally {
        window.removeEventListener('keydown', listen)
    }

    return prevented
}

describe('ASMA-8875 AC 4: Space on a row', () => {
    afterEach(cleanup)

    it('with a select column, Space on the row ticks its checkbox, and again unticks it', async () => {
        mountTable(withSelect)
        await enterBody()

        await expect(await pressSpace()).toBe(true)
        await expect(checkbox('r-1')).toHaveAttribute('aria-checked', 'true')
        await expect(chevron('r-1')).toHaveAttribute('aria-expanded', 'false')
        await expect(await pressSpace()).toBe(true)
        await expect(checkbox('r-1')).toHaveAttribute('aria-checked', 'false')
        await expect(document.activeElement).toBe(row('r-1'))
    })

    it('with no select column, Space on the row expands it, and again collapses it, as its chevron does', async () => {
        mountTable()
        await enterBody()

        await expect(await pressSpace()).toBe(true)
        await expect(chevron('r-1')).toHaveAttribute('aria-expanded', 'true')
        await expect(await pressSpace()).toBe(true)
        await expect(chevron('r-1')).toHaveAttribute('aria-expanded', 'false')
        await expect(document.activeElement).toBe(row('r-1'))
    })

    it('a locked row does nothing, and leaves the key to the browser; so does a row that can neither select nor expand', async () => {
        mountTable({ ...withSelect, enableRowSelection: (candidate) => candidate.id !== 'r-1' })
        await enterBody()

        await expect(await pressSpace()).toBe(false)
        await expect(checkbox('r-1')).toHaveAttribute('aria-checked', 'false')
        // The select column decides: a locked row does not expand instead.
        await expect(chevron('r-1')).toHaveAttribute('aria-expanded', 'false')

        cleanup()
        mountTable({ expandArrow: false, getRowCanExpand: () => false })
        await enterBody()
        await expect(await pressSpace()).toBe(false)
    })

    it('Space on the checkbox toggles it once, not once more for its row', async () => {
        mountTable(withSelect)
        await enterBody()
        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(checkbox('r-1'))

        await pressSpace()
        await expect(checkbox('r-1')).toHaveAttribute('aria-checked', 'true')
        await pressSpace()
        await expect(checkbox('r-1')).toHaveAttribute('aria-checked', 'false')
    })

    it('Space on the chevron toggles it once, not once more for its row', async () => {
        mountTable()
        await enterBody()
        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(chevron('r-1'))

        await pressSpace()
        await expect(chevron('r-1')).toHaveAttribute('aria-expanded', 'true')
        await pressSpace()
        await expect(chevron('r-1')).toHaveAttribute('aria-expanded', 'false')
    })

    it('a nested row behaves the same', async () => {
        mountTable({
            initialState: { expanded: { 'r-1': true } },
            customSubRowData: new Map([['r-1', [{ id: 'n-1', title: 'Nested' }]]]),
            renderSubRows: ({ rows }) => (
                <tr>
                    <td colSpan={3}>
                        <StyledTable<Inner>
                            locale='en'
                            columns={innerColumns}
                            data={rows}
                            hideHeader
                            hideFooter
                            headerPin={false}
                            enableRowSelection
                            initialState={{ columnVisibility: { select: true } }}
                        />
                    </td>
                </tr>
            ),
        })
        await enterBody()

        await userEvent.keyboard('{ArrowDown}')
        await expect(document.activeElement).toBe(row('n-1'))
        await expect(await pressSpace()).toBe(true)
        await expect(checkbox('n-1')).toHaveAttribute('aria-checked', 'true')
        await expect(await pressSpace()).toBe(true)
        await expect(checkbox('n-1')).toHaveAttribute('aria-checked', 'false')
        // The parent row is left as it was.
        await expect(chevron('r-1')).toHaveAttribute('aria-expanded', 'true')
    })
})

describe('ASMA-8875: a click on a select checkbox focuses it', () => {
    afterEach(cleanup)

    it('a row checkbox: the click ticks and focuses it with no focus frame, its row becomes the tab stop, and Space unticks it', async () => {
        mountTable(withSelect)

        const cell = checkbox('r-2').closest('td')!
        const box = (): DOMRect => cell.querySelector('[data-test="cell-select"]')!.getBoundingClientRect()
        const rest = box()

        // A key press first: a focus from script after it would show the focus frame; the click's must not.
        button('Before').focus()
        await userEvent.keyboard('{Shift}')
        await userEvent.click(checkbox('r-2'))
        await expect(checkbox('r-2')).toHaveAttribute('aria-checked', 'true')
        await expect(document.activeElement).toBe(checkbox('r-2'))
        await expect(checkbox('r-2').matches(':focus-visible')).toBe(false)
        // Nothing scrolled or moved for the focus.
        await expect(cell.scrollLeft).toBe(0)
        await expect(box()).toEqual(rest)
        await expect(row('r-2')).toHaveAttribute('tabindex', '0')
        await expect(row('r-1')).toHaveAttribute('tabindex', '-1')

        await userEvent.keyboard('{ }')
        await expect(checkbox('r-2')).toHaveAttribute('aria-checked', 'false')
        await expect(document.activeElement).toBe(checkbox('r-2'))
    })

    it('the header select-all: the click ticks every row and focuses it, and Space unticks them', async () => {
        mountTable(withSelect)

        const selectAll = document.querySelector<HTMLElement>('thead [role="checkbox"]')!

        await userEvent.click(selectAll)
        await expect(document.activeElement).toBe(selectAll)
        await expect(checkbox('r-1')).toHaveAttribute('aria-checked', 'true')
        await expect(checkbox('r-2')).toHaveAttribute('aria-checked', 'true')

        await userEvent.keyboard('{ }')
        await expect(checkbox('r-1')).toHaveAttribute('aria-checked', 'false')
        await expect(checkbox('r-2')).toHaveAttribute('aria-checked', 'false')
    })

    it("a locked row's checkbox takes no focus and does not change", async () => {
        mountTable({ ...withSelect, enableRowSelection: (candidate) => candidate.id !== 'r-1' })
        button('Before').focus()

        // `force`: the checkbox is `aria-disabled`, which Playwright's click would wait out.
        await userEvent.click(checkbox('r-1'), { force: true })
        await expect(checkbox('r-1')).toHaveAttribute('aria-checked', 'false')
        await expect(document.activeElement).toBe(button('Before'))
    })
})
