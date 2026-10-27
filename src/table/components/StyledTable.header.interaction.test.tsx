import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import {
    ariaSorts,
    headerCell,
    people,
    personColumns,
    resolveColor,
    sortButton,
    sortGlyph,
    type Person,
} from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'
import type { StyledTableProps } from '../types'

/**
 * The sort indicator, its hover and focus look, and the 24px resize zone (ASMA-8597, REQ-009 to REQ-011,
 * AC 15, 16, 17). Asserted on computed styles and geometry in a real browser: this is all CSS.
 * The hover square is built to a provisional spec (OQ-01), so its three values are read from one place and
 * compared with the values the stylesheet declares for it.
 */

const SQUARE = { size: 20, radius: '4px', color: 'var(--colors-delta-50)' } // provisional (ASMA-8597 OQ-01)

const table = (props: Partial<Omit<StyledTableProps<Person, Record<string, unknown>>, 'footer' | 'hideFooter'>> = {}): JSX.Element => (
    <StyledTable<Person> columns={personColumns} data={people} hideFooter locale='en' {...props} />
)

const indicator = (label: string): HTMLElement => headerCell(label).querySelector<HTMLElement>('[data-sort-state]')!
const glyphOf = (label: string): SVGElement => indicator(label).querySelector('svg')!
const square = (label: string): CSSStyleDeclaration => getComputedStyle(indicator(label), '::before')
const labelOf = (label: string): HTMLElement => headerCell(label).querySelector<HTMLElement>('[class*="header-content"]')!
const resizerOf = (label: string): HTMLElement => headerCell(label).querySelector<HTMLElement>('[class*="resizer"]')!
const glyphPath = (label: string): string | null => glyphOf(label).querySelector('path')!.getAttribute('d')
const rect = (element: Element): DOMRect => element.getBoundingClientRect()

/**
 * The real pointer survives from test to test, so a header left under it would keep matching `:hover`.
 * Park it on a button in the bottom-right corner, away from the table, before each test.
 */
const parkPointer = async (): Promise<void> => {
    const parking = document.createElement('button')

    parking.type = 'button'
    parking.setAttribute('aria-label', 'parking')
    parking.style.cssText = 'position:fixed;right:0;bottom:0;width:40px;height:40px;opacity:0.01'
    document.body.appendChild(parking)
    await userEvent.hover(parking)
    parking.remove()
}

const ASC_PATH = 'm7 14l5-5l5 5z' // ▲
const DESC_PATH = 'm7 10l5 5l5-5z' // ▼

const luminance = (color: string): number => {
    const [red = 0, green = 0, blue = 0] = (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
    const channel = (value: number): number => {
        const scaled = value / 255

        return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4
    }

    return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue)
}
const contrast = (foreground: string, background: string): number => {
    const [lighter, darker] = [luminance(foreground), luminance(background)].sort((left, right) => right - left)

    return (lighter! + 0.05) / (darker! + 0.05)
}

describe('Sort indicator (AC 15)', () => {
    beforeEach(parkPointer)
    afterEach(cleanup)

    it('ST-10: a 20 x 28px slot right after the label, drawing the glyph at 28px', async () => {
        mount(table())

        const slot = rect(indicator('Name'))
        const glyph = rect(glyphOf('Name'))
        const label = rect(labelOf('Name'))

        await expect(slot.width).toBe(20)
        await expect(slot.height).toBe(28)
        await expect(glyph.width).toBe(28)
        await expect(glyph.height).toBe(28)
        // Centred in the slot, and no gap between the label and the slot.
        await expect(Math.abs(glyph.left + glyph.width / 2 - (slot.left + slot.width / 2))).toBeLessThanOrEqual(0.5)
        await expect(Math.abs(slot.left - label.right)).toBeLessThanOrEqual(0.5)
    })

    it('ST-10: a sorted column shows the glyph in gama-500, ascending or descending; the slot is decorative (A-03)', async () => {
        mount(table())

        await userEvent.click(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('ascending')
        await expect(glyphPath('Name')).toBe(ASC_PATH)
        await expect(getComputedStyle(glyphOf('Name')).visibility).toBe('visible')
        await expect(getComputedStyle(indicator('Name')).color).toBe(resolveColor('var(--colors-gama-500)'))

        await userEvent.click(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('descending')
        await expect(glyphPath('Name')).toBe(DESC_PATH)

        // Decorative: hidden from assistive technology; `aria-sort` on the header carries the state.
        await expect(indicator('Name')).toHaveAttribute('aria-hidden', 'true')
        await expect(headerCell('Name')).toHaveAttribute('aria-sort', 'descending')

        await userEvent.click(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('none')
    })

    it('ST-10: an unsorted column shows nothing at rest, and no unsortable column ever shows anything', async () => {
        // `notes` has no accessor, so it cannot sort; it sits in the middle so the pointer can reach it.
        const columns: ColumnDef<Person>[] = [personColumns[0]!, personColumns[3]!, personColumns[1]!]

        mount(table({ columns }))

        await expect(getComputedStyle(glyphOf('Role')).visibility).toBe('hidden')
        await expect(square('Role').opacity).toBe('0')
        // The slot still takes its 20px, so hovering never shifts the label.
        await expect(rect(indicator('Role')).width).toBe(20)

        // Nothing to show: no slot, no glyph, no square, and the header is not a control at all.
        const notes = headerCell('Notes').querySelector<HTMLElement>('[class*="show-table-header"]')!

        await expect(sortGlyph('Notes')).toBeNull()
        await expect(headerCell('Notes').querySelector('[data-sort-state]')).toBeNull()
        await expect(notes.getAttribute('role')).toBeNull()
        await expect(notes.hasAttribute('tabindex')).toBe(false)
        await expect(headerCell('Notes').hasAttribute('aria-sort')).toBe(false)
        await expect(getComputedStyle(notes).cursor).not.toBe('pointer')
    })

    it('ST-10: a long label truncates with an ellipsis and the slot stays visible and inside the column', async () => {
        const columns: ColumnDef<Person>[] = [
            { accessorKey: 'name', header: 'An extremely long column label that cannot possibly fit here', size: 110 },
            { accessorKey: 'role', header: 'Role', size: 160 },
        ]

        mount(table({ columns }))

        const label = labelOf('An extremely long column label that cannot possibly fit here')
        const cell = headerCell('An extremely long column label that cannot possibly fit here')
        const slot = rect(indicator('An extremely long column label that cannot possibly fit here'))

        await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth)
        await expect(getComputedStyle(label).textOverflow).toBe('ellipsis')
        await expect(slot.width).toBe(20)
        await expect(slot.right).toBeLessThanOrEqual(rect(cell).right + 0.5)
        await expect(slot.left).toBeGreaterThanOrEqual(rect(cell).left)
    })
})

describe('Hover and focus (AC 16)', () => {
    beforeEach(parkPointer)
    afterEach(cleanup)

    it('ST-10: hovering an unsorted column shows the grey glyph pointing the way the click sorts, on the provisional square', async () => {
        mount(table())

        await userEvent.hover(sortButton('Role'))

        await expect(getComputedStyle(glyphOf('Role')).visibility).toBe('visible')
        await expect(getComputedStyle(indicator('Role')).color).toBe(resolveColor('var(--colors-delta-600)'))
        // Provisional (ASMA-8597 OQ-01): 20 x 20px, radius 4px, delta-50.
        await expect(square('Role').opacity).toBe('1')
        await expect(square('Role').width).toBe(`${SQUARE.size}px`)
        await expect(square('Role').height).toBe(`${SQUARE.size}px`)
        await expect(square('Role').borderTopLeftRadius).toBe(SQUARE.radius)
        await expect(square('Role').backgroundColor).toBe(resolveColor(SQUARE.color))

        await userEvent.unhover(sortButton('Role'))
        await expect(getComputedStyle(glyphOf('Role')).visibility).toBe('hidden')
        await expect(square('Role').opacity).toBe('0')
    })

    it('ST-10: a sorted column keeps its primary glyph and gets the square on hover', async () => {
        mount(table())

        await userEvent.click(sortButton('Name'))
        await userEvent.unhover(sortButton('Name'))
        await expect(square('Name').opacity).toBe('0')

        await userEvent.hover(sortButton('Name'))
        await expect(getComputedStyle(indicator('Name')).color).toBe(resolveColor('var(--colors-gama-500)'))
        await expect(square('Name').opacity).toBe('1')
    })

    it('U-H01: the hover glyph points where the next click sorts: getFirstSortDir(), sortDescFirst respected', async () => {
        const columns: ColumnDef<Person>[] = [
            { accessorKey: 'name', header: 'Name', size: 160 }, // string: ascending first
            { accessorKey: 'age', header: 'Age', size: 160 }, // number: descending first
            { accessorKey: 'role', header: 'Role', size: 160, sortDescFirst: true },
            { accessorKey: 'id', header: 'Id', size: 160, sortDescFirst: false },
        ]

        mount(table({ columns }))

        await expect(indicator('Name')).toHaveAttribute('data-sort-direction', 'asc')
        await expect(glyphPath('Name')).toBe(ASC_PATH)
        await expect(indicator('Age')).toHaveAttribute('data-sort-direction', 'desc')
        await expect(glyphPath('Age')).toBe(DESC_PATH)
        await expect(indicator('Role')).toHaveAttribute('data-sort-direction', 'desc')
        await expect(glyphPath('Role')).toBe(DESC_PATH)
        await expect(indicator('Id')).toHaveAttribute('data-sort-direction', 'asc')

        // The hover glyph and the first click agree.
        await userEvent.click(sortButton('Age'))
        await expect(ariaSorts()['Age']).toBe('descending')
        await userEvent.click(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('ascending')
    })

    it('ST-11: keyboard focus on a sortable header shows the hover look, Enter sorts, leaving removes it', async () => {
        mount(table())

        // After a key press the next focus matches :focus-visible, as it does for a user on the keyboard.
        await userEvent.keyboard('{Shift}')
        sortButton('Name').focus()

        await expect(document.activeElement).toBe(sortButton('Name'))
        await expect(sortButton('Name').matches(':focus-visible')).toBe(true)
        await expect(getComputedStyle(glyphOf('Name')).visibility).toBe('visible')
        await expect(square('Name').opacity).toBe('1')
        await expect(getComputedStyle(indicator('Name')).color).toBe(resolveColor('var(--colors-delta-600)'))

        await userEvent.keyboard('{Enter}')
        await expect(ariaSorts()['Name']).toBe('ascending')
        await expect(getComputedStyle(indicator('Name')).color).toBe(resolveColor('var(--colors-gama-500)'))

        // Leaving: Name keeps its sorted glyph but loses the square.
        sortButton('Role').focus()
        await expect(square('Name').opacity).toBe('0')
        await expect(getComputedStyle(glyphOf('Name')).visibility).toBe('visible')
        await expect(square('Role').opacity).toBe('1')

        sortButton('Role').blur()
        await expect(getComputedStyle(glyphOf('Role')).visibility).toBe('hidden')
        await expect(square('Role').opacity).toBe('0')
    })

    // Found while writing ST-11 (ASMA-8597): no key sequence lands on a header sort control. The header row's
    // Tab handler (ASMA-8087) sends every Tab pressed in the header to the first body row, and Shift+Tab from
    // the rows reaches only the header row. That is on master, outside this story's scope.
    it.todo('ST-11: Tab reaches a sortable header (blocked by the header row Tab handler on master)')

    it('A-04: both glyph colours reach 3:1 on the header and on the square in all three themes', async () => {
        mount(table())
        const original = document.documentElement.getAttribute('data-theme')

        try {
            for (const theme of ['default', 'greenish', 'fretex']) {
                document.documentElement.setAttribute('data-theme', theme)

                const header = resolveColor('var(--colors-gray-10)')
                const grey = resolveColor('var(--colors-delta-600)')
                const primary = resolveColor('var(--colors-gama-500)')
                const provisionalSquare = resolveColor(SQUARE.color)

                for (const [name, glyph] of [['delta-600', grey], ['gama-500', primary]] as const) {
                    await expect(contrast(glyph, header), `${theme}: ${name} on the header`).toBeGreaterThanOrEqual(3)
                    await expect(contrast(glyph, provisionalSquare), `${theme}: ${name} on the square`).toBeGreaterThanOrEqual(3)
                }
            }
        } finally {
            if (original) document.documentElement.setAttribute('data-theme', original)
        }
    })
})

describe('24px resize zone (AC 17)', () => {
    beforeEach(parkPointer)
    afterEach(cleanup)

    const narrow: ColumnDef<Person>[] = [
        { accessorKey: 'name', header: 'Name', size: 100, minSize: 100 },
        { accessorKey: 'role', header: 'Role', size: 100, minSize: 100 },
        { accessorKey: 'age', header: 'Age', size: 160 },
    ]

    it('ST-12: the zone is 24px wide at the right edge, the visible bar 4px at the edge (provisional, OQ-03)', async () => {
        mount(table({ columns: narrow, enableColumnResizing: true }))

        const zone = rect(resizerOf('Name'))
        const cell = rect(headerCell('Name'))
        const bar = getComputedStyle(resizerOf('Name'), '::after')

        await expect(zone.width).toBe(24)
        await expect(Math.abs(zone.right - cell.right)).toBeLessThanOrEqual(0.5)
        await expect(bar.width).toBe('4px')
        // Provisional (ASMA-8597 OQ-03): the bar stays at the zone's right edge.
        await expect(bar.right).toBe('0px')
        await expect(bar.backgroundColor).toBe(resolveColor('var(--colors-delta-300)'))
    })

    it('ST-12: in a 100px column nothing sits under the zone: label, glyph and square end before it', async () => {
        mount(table({ columns: narrow, enableColumnResizing: true }))

        const zone = rect(resizerOf('Name'))
        const slot = rect(indicator('Name'))
        const glyph = rect(glyphOf('Name'))
        const centre = { x: glyph.left + glyph.width / 2, y: glyph.top + glyph.height / 2 }
        const hit = document.elementFromPoint(centre.x, centre.y)

        await expect(slot.right).toBeLessThanOrEqual(zone.left + 0.5)
        await expect(hit).not.toBe(resizerOf('Name'))
        await expect(resizerOf('Name').contains(hit)).toBe(false)
        // And the zone itself belongs to the handle.
        const zoneHit = document.elementFromPoint(zone.left + zone.width / 2, zone.top + zone.height / 2)

        await expect(zoneHit).toBe(resizerOf('Name'))
    })

    it('ST-12: pressing on the zone starts a resize and never sorts', async () => {
        mount(table({ columns: narrow, enableColumnResizing: true }))

        const zone = resizerOf('Name')
        const { left, top } = rect(zone)
        const press = (type: string, target: EventTarget): void => {
            target.dispatchEvent(
                new MouseEvent(type, { bubbles: true, cancelable: true, clientX: left + 12, clientY: top + 10, view: window }),
            )
        }

        // A real press-and-release on the zone is mousedown, mouseup, then a click that bubbles to the header,
        // each in its own task, so React has rendered the "resizing" state when the click arrives.
        const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 30))

        press('mousedown', zone)
        await settle()
        press('mouseup', document)
        await settle()
        press('click', zone)
        await settle()

        await expect(ariaSorts()['Name']).toBe('none')
        // A click on the label does sort, so the check above is not vacuous.
        await userEvent.click(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('ascending')
    })

    it('reserves the zone only where a handle exists; other columns keep their padding', async () => {
        mount(table({ columns: narrow, enableColumnResizing: true }))

        const padding = (label: string): string =>
            getComputedStyle(headerCell(label).querySelector('[class*="show-table-header"]')!).paddingRight

        await expect(padding('Name')).toBe('24px')
        await expect(padding('Role')).toBe('24px')
        // The last data column has no handle (resizing the last one would only resize the table): unchanged.
        await expect(resizerOf('Age')).toBeNull()
        await expect(padding('Age')).toBe('10px')
    })

    it('without resizing no handle and no reserved space', async () => {
        mount(table({ columns: narrow }))

        await expect(resizerOf('Name')).toBeNull()
        await expect(
            getComputedStyle(headerCell('Name').querySelector('[class*="show-table-header"]')!).paddingRight,
        ).not.toBe('24px')
    })
})
