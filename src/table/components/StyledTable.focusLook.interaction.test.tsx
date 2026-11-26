import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { expect, userEvent } from 'src/test-utils/interaction-api'
import { cleanup, mount, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { button, enterBody, row } from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'
import type { StyledTableProps } from '../types'

/**
 * ASMA-8875 AC 11, the focus look (the user's feedback of 2026-11-16): every focus indicator in the table is 3px wide, and
 * a border of the framed cell is part of those 3px — it takes the focus colour and 2px go inside — so nothing grey shows
 * next to the focus. A row (body or header) frames its own cells; a header control (sort header, pin) frames its header
 * cell; the expand chevron frames its body cell; the select checkboxes show the base-ui checkbox frame around their box
 * (Figma Focused 11460-105640: a 3px ring, 26px outer, a 2px white gap); the ⋮ keeps its own ring. Measured from computed
 * styles; every key is a real press.
 */

interface Row {
    id: string
    name: string
}

const data: Row[] = [
    { id: 'r-1', name: 'First' },
    { id: 'r-2', name: 'Second' },
]
const columns: ColumnDef<Row>[] = [
    { accessorKey: 'name', header: 'Name' },
    { id: 'notes', header: 'Notes', enableSorting: false, cell: () => 'Text' },
]

const mountTable = (props: Partial<Omit<StyledTableProps<Row, Record<string, unknown>>, 'footer'>> = {}): void => {
    mount(
        <div>
            <button type='button'>Before</button>
            <StyledTable<Row>
                locale='en'
                columns={columns}
                data={data}
                hideFooter
                enableRowSelection
                initialState={{ columnVisibility: { select: true } }}
                expandArrow
                getRowCanExpand={() => true}
                actions={() => [{ label: 'Edit', onClick: () => undefined }]}
                {...props}
            />
        </div>,
    )
}

type Side = 'top' | 'right' | 'bottom' | 'left'
const SIDES: Side[] = ['top', 'right', 'bottom', 'left']

/** How wide the focus colour is on each side: a border in that colour, plus the inset shadows in it. */
const focusSides = (element: Element): Record<Side, number> => {
    const ring = resolveTokenColor('--colors-focus-ring')
    const style = getComputedStyle(element)
    const sides: Record<Side, number> = { top: 0, right: 0, bottom: 0, left: 0 }

    for (const side of SIDES) {
        if (style.getPropertyValue(`border-${side}-color`) === ring) sides[side] += Number.parseFloat(style.getPropertyValue(`border-${side}-width`))
    }
    for (const shadow of style.boxShadow.split(/,(?![^(]*\))/)) {
        const match = /^(rgba?\([^)]*\)) (-?[\d.]+)px (-?[\d.]+)px [\d.]+px (-?[\d.]+)px inset$/.exec(shadow.trim())
        if (match?.[1] !== ring) continue
        const [x, y, spread] = [Number(match[2]), Number(match[3]), Number(match[4])]
        sides.left += Math.max(x, 0) + spread
        sides.right += Math.max(-x, 0) + spread
        sides.top += Math.max(y, 0) + spread
        sides.bottom += Math.max(-y, 0) + spread
    }

    return sides
}

/** The sides of an element that show a border in another colour than the focus: grey next to the focus. */
const greySides = (element: Element): Side[] => {
    const ring = resolveTokenColor('--colors-focus-ring')
    const style = getComputedStyle(element)

    return SIDES.filter(
        (side) =>
            Number.parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0 && style.getPropertyValue(`border-${side}-color`) !== ring,
    )
}

const headerCells = (): HTMLTableCellElement[] => [...document.querySelector('thead tr')!.querySelectorAll('th')]
const press = async (keys: string): Promise<void> => {
    await userEvent.keyboard(keys)
}

describe('ASMA-8875 AC 11: every focus indicator is 3px, a cell border part of it', () => {
    afterEach(cleanup)

    it('the header row frames its cells 3px, their grey top and bottom borders taken into the frame', async () => {
        mountTable()
        button('Before').focus()
        await press('{Tab}')
        await expect(document.activeElement?.tagName).toBe('TR')

        const cells = headerCells()

        for (const cell of cells) {
            await expect(greySides(cell)).toEqual([])
            await expect(focusSides(cell)).toMatchObject({ top: 3, bottom: 3 })
        }
        await expect(focusSides(cells[0]!).left).toBe(3)
        await expect(focusSides(cells.at(-1)!).right).toBe(3)
    })

    it.each([
        // Header cells: select-all, chevron (empty), Name, Notes (not sortable), the pin.
        ['a sort header', '{ArrowRight}{ArrowRight}', 2],
        ['the pin', '{End}', -1],
    ] as const)('%s frames its header cell 3px on every side, its borders part of it, with no ring of its own', async (_label, keys, index) => {
        mountTable()
        button('Before').focus()
        await press(`{Tab}${keys}`)

        const control = document.activeElement as HTMLElement
        const cell = headerCells().at(index)!

        await expect(control.closest('th')).toBe(cell)
        await expect(focusSides(cell)).toEqual({ top: 3, right: 3, bottom: 3, left: 3 })
        await expect(greySides(cell)).toEqual([])
        await expect(getComputedStyle(control).outlineStyle).toBe('none')
        await expect(focusSides(control)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
        // The other header cells keep their look (Notes, with no control): no header-wide frame.
        await expect(focusSides(headerCells()[3]!)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
    })

    it("the pin's frame does not move it, and its changed-layout dot stays on top", async () => {
        // A hidden column, so the pin shows its changed-layout dot.
        mountTable({ initialState: { columnVisibility: { select: true, notes: false } } })
        button('Before').focus()

        const pin = document.querySelector<HTMLElement>('thead button[aria-haspopup="true"]')!
        const dot = document.querySelector<HTMLElement>('[data-testid="column-settings-dot"]')!
        const { x, y, width, height } = pin.getBoundingClientRect()

        await press('{Tab}{End}')
        await expect(document.activeElement).toBe(pin)
        await expect(pin.getBoundingClientRect()).toMatchObject({ x, y, width, height })

        const spot = dot.getBoundingClientRect()

        await expect(dot.contains(document.elementFromPoint(spot.x + spot.width / 2, spot.y + spot.height / 2))).toBe(true)
    })

    it.each([
        ['the header select-all', 'cell-select-all', async (): Promise<void> => press('{Tab}{ArrowRight}')],
        [
            'a row checkbox',
            'cell-select',
            async (): Promise<void> => {
                await enterBody()
                await press('{ArrowRight}')
            },
        ],
    ] as const)('%s shows the base-ui checkbox frame around its box (26px, a 3px ring, a 2px gap), and neither box nor cell moves', async (_label, dataTest, focus) => {
        mountTable()
        button('Before').focus()

        const wrapper = document.querySelector<HTMLElement>(`[data-testid="${dataTest}"]`)!
        const box = wrapper.firstElementChild as HTMLElement
        const cell = wrapper.closest<HTMLElement>('td, th')!
        const at = (): { x: number; y: number } => ({ x: box.getBoundingClientRect().x, y: box.getBoundingClientRect().y })
        const rest = at()

        await focus()
        await expect(document.activeElement?.getAttribute('role')).toBe('checkbox')

        const ring = getComputedStyle(wrapper, '::before')
        const gap = getComputedStyle(wrapper, '::after')

        await expect([ring.width, ring.height, ring.backgroundColor]).toEqual(['26px', '26px', resolveTokenColor('--colors-focus-ring')])
        await expect([gap.width, gap.height, gap.backgroundColor]).toEqual(['20px', '20px', 'rgb(255, 255, 255)'])
        await expect(box.getBoundingClientRect().width).toBe(16)
        await expect(getComputedStyle(box).zIndex).toBe('2')
        // No frame on the cell and no ring on the control: the box's frame is the one indicator.
        await expect(focusSides(cell)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
        await expect(getComputedStyle(document.activeElement!).outlineStyle).toBe('none')
        // Nothing moved, and nothing scrolled inside the cell, also once the focus moves on.
        await expect(at()).toEqual(rest)
        await expect(cell.scrollLeft).toBe(0)
        await press('{ArrowRight}')
        await expect(at()).toEqual(rest)
        await expect(cell.scrollLeft).toBe(0)
    })

    it('the expand chevron frames its body cell 3px on every side, with no ring of its own', async () => {
        mountTable()
        await enterBody()
        await press('{ArrowRight}{ArrowRight}')

        const chevron = document.activeElement as HTMLElement

        await expect(chevron).toHaveAttribute('aria-expanded', 'false')
        await expect(focusSides(chevron.closest('td')!)).toEqual({ top: 3, right: 3, bottom: 3, left: 3 })
        await expect(focusSides(chevron)).toEqual({ top: 0, right: 0, bottom: 0, left: 0 })
    })

    it('a body row frames its cells 3px (its row line inside the frame), with no grey border next to it', async () => {
        mountTable()
        await enterBody()

        const cells = [...row('r-1').cells]

        for (const cell of cells) {
            await expect(greySides(cell)).toEqual([])
            await expect(focusSides(cell)).toMatchObject({ top: 3, bottom: 3 })
        }
        await expect(focusSides(cells[0]!).left).toBe(3)
        await expect(focusSides(cells.at(-1)!).right).toBe(3)
    })

    it('the ⋮ keeps its own ring: 3px, its 1px border recoloured and 2px inside', async () => {
        mountTable()
        await enterBody()
        await press('{ArrowRight}{ArrowRight}{ArrowRight}')

        const trigger = document.activeElement as HTMLElement

        await expect(trigger).toHaveAttribute('data-row-actions-trigger')
        await expect(focusSides(trigger)).toEqual({ top: 3, right: 3, bottom: 3, left: 3 })
        await expect(greySides(trigger)).toEqual([])
    })

    it('forced colours: the row and cell frames become a 3px outline, and the checkbox frame the system colours', async () => {
        const session = cdp()

        await session.send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
        try {
            mountTable()
            button('Before').focus()
            await press('{Tab}')
            await expect(getComputedStyle(document.activeElement!).outlineWidth).toBe('3px')

            await press('{End}')
            await expect(getComputedStyle(headerCells().at(-1)!).outlineWidth).toBe('3px')

            await press('{Home}')
            const probe = document.createElement('span')
            probe.style.color = 'CanvasText'
            document.body.append(probe)
            const canvasText = getComputedStyle(probe).color
            probe.remove()
            await expect(getComputedStyle(document.querySelector('[data-testid="cell-select-all"]')!, '::before').backgroundColor).toBe(canvasText)
        } finally {
            await session.send('Emulation.setEmulatedMedia', { features: [] })
        }
    })
})
