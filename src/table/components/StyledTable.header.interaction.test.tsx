import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { expect, userEvent } from 'src/test-utils/interaction-api'
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
 * UX's answer (ASMA-8597, comment 94738, AC 16): there is no hover or focus square. Hover and focus on an unsorted
 * sortable column show only the grey triangle, pointing the way the click will sort; a sorted column keeps its
 * teal triangle. Every state is checked for the absence of anything drawn behind the glyph.
 * UX's later answers (comments 94750 and 94751): the 20px slot exists only while the column is sorted, hovered or
 * keyboard-focused (ST-15), and the resize bar is `delta-400` (ST-17).
 * UX round 3 (2026-11-02, P2d) supersedes the sorted `gama-400` hover (OQ-12) and the full-height resize bar: a hovered
 * or `:focus-visible` header previews the state after the click, without a colour change (ST-16, ST-18); the resize
 * zone is 24 x 28px with a 4 x 24px bar and a hover and drag look (ST-12, ST-17, ST-19).
 */

type TableProps = Partial<Omit<StyledTableProps<Person, Record<string, unknown>>, 'footer' | 'hideFooter'>>

const table = (props: TableProps = {}): JSX.Element => (
    <StyledTable<Person> columns={personColumns} data={people} hideFooter locale='en' {...props} />
)

/** What an element paints behind itself: the parts a hover or focus square would have to use. */
interface PaintLook {
    background: string
    image: string
    shadow: string
}

const lookOf = (element: Element): PaintLook => {
    const style = getComputedStyle(element)

    return { background: style.backgroundColor, image: style.backgroundImage, shadow: style.boxShadow }
}

/** What each header cell and its sortable parent paint at rest, taken right after mounting (nothing hovered or focused). */
const restLooks = new WeakMap<Element, PaintLook>()

const mountHeader = (props: TableProps = {}): ReturnType<typeof mount> => {
    const view = mount(table(props))

    for (const cell of document.querySelectorAll('thead th')) {
        restLooks.set(cell, lookOf(cell))
        if (cell.firstElementChild) restLooks.set(cell.firstElementChild, lookOf(cell.firstElementChild))
    }

    return view
}

const indicator = (label: string): HTMLElement => headerCell(label).querySelector<HTMLElement>('[data-sort-state]')!
/** The slot holds two glyphs (P2d): the current one, shown at rest while sorted, and the preview, shown on hover and focus. */
const currentGlyph = (label: string): SVGElement => indicator(label).querySelector<SVGElement>('[class*="sort-glyph--current"]')!
const previewGlyph = (label: string): SVGElement => indicator(label).querySelector<SVGElement>('[class*="sort-glyph--preview"]')!
const isShown = (glyph: Element): boolean => getComputedStyle(glyph).visibility === 'visible'
/** Which of the two glyphs the user sees. Exactly one at most: never both, whatever the state. */
const expectShown = async (label: string, which: 'current' | 'preview' | 'none'): Promise<void> => {
    await expect(isShown(currentGlyph(label)), `${label}: current glyph`).toBe(which === 'current')
    await expect(isShown(previewGlyph(label)), `${label}: preview glyph`).toBe(which === 'preview')
}
/** The glyph the user sees; throws when none is shown. */
const shownGlyph = (label: string): SVGElement => {
    const shown = [currentGlyph(label), previewGlyph(label)].find(isShown)

    if (!shown) throw new Error(`Header "${label}" shows no glyph`)

    return shown
}
/**
 * Nothing is drawn behind the glyph in any state (UX: no square): the slot holds only the glyph and paints nothing,
 * has no generated box, and neither the sortable parent nor the header cell paints more than it does at rest.
 */
const expectNoSquare = async (label: string): Promise<void> => {
    const slotElement = indicator(label)
    const slot = getComputedStyle(slotElement)

    await expect(slotElement.childNodes.length).toBe(2)
    await expect(Array.from(slotElement.children)).toEqual([currentGlyph(label), previewGlyph(label)])
    await expect(slot.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    await expect(slot.backgroundImage).toBe('none')
    await expect(slot.boxShadow).toBe('none')
    await expect(slot.outlineStyle).toBe('none')
    await expect(getComputedStyle(slotElement, '::before').content).toBe('none')
    await expect(getComputedStyle(slotElement, '::after').content).toBe('none')
    for (const glyph of [currentGlyph(label), previewGlyph(label)]) {
        await expect(getComputedStyle(glyph).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    }

    const cell = headerCell(label)

    for (const element of [cell, slotElement.parentElement!]) {
        const rest = restLooks.get(element)!
        const now = lookOf(element)

        await expect(now.background).toBe(rest.background)
        await expect(now.image).toBe(rest.image)
        // While a control in the header has keyboard focus, the header row draws its own focus frame on every cell
        // (ASMA-8087): existing styling, so only a cell's shadow is excused then, and only by that frame.
        const hasFocusFrame = element === cell && cell.closest('thead')!.matches(':has(:focus-visible)')

        if (!hasFocusFrame) await expect(now.shadow).toBe(rest.shadow)
    }
}
const labelOf = (label: string): HTMLElement => headerCell(label).querySelector<HTMLElement>('[class*="header-content"]')!
const resizerOf = (label: string): HTMLElement => headerCell(label).querySelector<HTMLElement>('[class*="resizer"]')!
const pathOf = (glyph: Element): string | null => glyph.querySelector('path')!.getAttribute('d')
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
        mountHeader()
        // An unsorted header has the slot only while it is hovered or focused (ST-15).
        await userEvent.hover(sortButton('Name'))

        const slot = rect(indicator('Name'))
        const label = rect(labelOf('Name'))

        await expect(slot.width).toBe(20)
        await expect(slot.height).toBe(28)
        // Both glyphs lie on top of each other, 28px, centred in the slot; the user sees the preview.
        await expectShown('Name', 'preview')
        for (const element of [currentGlyph('Name'), previewGlyph('Name')]) {
            const glyph = rect(element)

            await expect(glyph.width).toBe(28)
            await expect(glyph.height).toBe(28)
            await expect(Math.abs(glyph.left + glyph.width / 2 - (slot.left + slot.width / 2))).toBeLessThanOrEqual(0.5)
            await expect(Math.abs(glyph.top + glyph.height / 2 - (slot.top + slot.height / 2))).toBeLessThanOrEqual(0.5)
        }
        // No gap between the label and the slot.
        await expect(Math.abs(slot.left - label.right)).toBeLessThanOrEqual(0.5)
    })

    it('ST-10: a sorted column shows the glyph in gama-500 at rest, ascending or descending; the slot is decorative (A-03)', async () => {
        mountHeader()

        await userEvent.click(sortButton('Name'))
        // Under the pointer the header shows the preview (ST-16); at rest it shows the current glyph.
        await userEvent.unhover(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('ascending')
        await expect(pathOf(currentGlyph('Name'))).toBe(ASC_PATH)
        await expectShown('Name', 'current')
        await expect(getComputedStyle(indicator('Name')).color).toBe(resolveColor('var(--colors-gama-500)'))

        await userEvent.click(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('descending')
        await expect(pathOf(currentGlyph('Name'))).toBe(DESC_PATH)

        // Decorative: hidden from assistive technology; `aria-sort` on the header carries the state.
        await expect(indicator('Name')).toHaveAttribute('aria-hidden', 'true')
        await expect(headerCell('Name')).toHaveAttribute('aria-sort', 'descending')

        await userEvent.click(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('none')
    })

    it('ST-10: an unsorted column shows nothing at rest, and no unsortable column ever shows anything', async () => {
        // `notes` has no accessor, so it cannot sort; it sits in the middle so the pointer can reach it.
        const columns: ColumnDef<Person>[] = [personColumns[0]!, personColumns[3]!, personColumns[1]!]

        mountHeader({ columns })

        await expectShown('Role', 'none')
        await expectNoSquare('Role')
        // The slot takes no room at rest (UX, OQ-07); ST-15 pins when it appears.
        await expect(rect(indicator('Role')).width).toBe(0)

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

        // Sorted, so that the slot is there; an unsorted header gets it back on hover or focus (ST-15).
        mountHeader({ columns, initialState: { sorting: [{ id: 'name', desc: false }] } })

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

const LONG = 'An extremely long column label that cannot possibly fit here'
const longColumns: ColumnDef<Person>[] = [
    { accessorKey: 'name', header: LONG, size: 110 },
    { accessorKey: 'role', header: 'Role', size: 160 },
]

/** The label ellipsizes and the slot, with its glyph visible, stays inside the column (AC 15, 16). */
const expectTruncatedWithGlyph = async (label: string): Promise<void> => {
    const text = labelOf(label)
    const cell = rect(headerCell(label))
    const slot = rect(indicator(label))

    await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth)
    await expect(getComputedStyle(text).textOverflow).toBe('ellipsis')
    const shown = shownGlyph(label)

    await expect(slot.width).toBe(20)
    await expect(slot.left).toBeGreaterThanOrEqual(cell.left)
    await expect(slot.right).toBeLessThanOrEqual(cell.right + 0.5)
    // The glyph is not clipped by the header: all of its 11.67px triangle lies inside the cell.
    const glyph = rect(shown)

    await expect(glyph.left + glyph.width / 2).toBeLessThanOrEqual(cell.right)
}

describe('Truncated long labels keep the glyph (AC 15, AC 16)', () => {
    beforeEach(parkPointer)
    afterEach(cleanup)

    it('a sorted column: the label ellipsizes and the primary glyph stays visible', async () => {
        mountHeader({ columns: longColumns, initialState: { sorting: [{ id: 'name', desc: false }] } })

        await expect(ariaSorts()[LONG]).toBe('ascending')
        await expectTruncatedWithGlyph(LONG)
        await expect(getComputedStyle(indicator(LONG)).color).toBe(resolveColor('var(--colors-gama-500)'))
    })

    it('a hovered unsorted column: the label ellipsizes and the grey glyph appears, with no square', async () => {
        mountHeader({ columns: longColumns })

        await expectShown(LONG, 'none')
        await userEvent.hover(sortButton(LONG))

        await expectTruncatedWithGlyph(LONG)
        await expectShown(LONG, 'preview')
        await expectNoSquare(LONG)
        await expect(getComputedStyle(indicator(LONG)).color).toBe(resolveColor('var(--colors-delta-600)'))
    })

    it('a hovered sorted column keeps both: truncated label and the glyph, which previews the removal (grey, pointing first), with no square', async () => {
        mountHeader({ columns: longColumns, initialState: { sorting: [{ id: 'name', desc: true }] } })

        await userEvent.hover(sortButton(LONG))

        await expectTruncatedWithGlyph(LONG)
        // Descending, and a text column sorts ascending first: the next click removes the sort.
        await expect(indicator(LONG)).toHaveAttribute('data-sort-direction', 'desc')
        await expect(indicator(LONG)).toHaveAttribute('data-preview-direction', 'asc')
        await expect(indicator(LONG)).toHaveAttribute('data-preview-tone', 'neutral')
        await expectShown(LONG, 'preview')
        await expectNoSquare(LONG)
        await expect(getComputedStyle(indicator(LONG)).color).toBe(resolveColor('var(--colors-delta-600)'))
    })
})

describe('Hover and focus (AC 16)', () => {
    beforeEach(parkPointer)
    afterEach(cleanup)

    it('ST-10: hovering an unsorted column shows only the grey glyph, pointing the way the click sorts', async () => {
        mountHeader()

        await userEvent.hover(sortButton('Role'))

        await expectShown('Role', 'preview')
        await expect(getComputedStyle(indicator('Role')).color).toBe(resolveColor('var(--colors-delta-600)'))
        // Only the triangle: 11.67 x 5.83px drawn by a 28px glyph, and no square behind it.
        await expectNoSquare('Role')

        await userEvent.unhover(sortButton('Role'))
        await expectShown('Role', 'none')
        await expectNoSquare('Role')
    })

    it('ST-10: a sorted column keeps a glyph on hover, in the colour it has at rest (no gama-400, ST-16), with no square', async () => {
        mountHeader()

        await userEvent.click(sortButton('Name'))
        await userEvent.unhover(sortButton('Name'))
        await expectNoSquare('Name')

        await expect(getComputedStyle(indicator('Name')).color).toBe(resolveColor('var(--colors-gama-500)'))

        // Ascending, so the next click sorts descending: the preview is teal as well.
        await userEvent.hover(sortButton('Name'))
        await expect(getComputedStyle(indicator('Name')).color).toBe(resolveColor('var(--colors-gama-500)'))
        await expectNoSquare('Name')
    })

    it('U-H01: the hover glyph points where the next click sorts: getFirstSortDir(), sortDescFirst respected', async () => {
        const columns: ColumnDef<Person>[] = [
            { accessorKey: 'name', header: 'Name', size: 160 }, // string: ascending first
            { accessorKey: 'age', header: 'Age', size: 160 }, // number: descending first
            { accessorKey: 'role', header: 'Role', size: 160, sortDescFirst: true },
            { accessorKey: 'id', header: 'Id', size: 160, sortDescFirst: false },
        ]

        mountHeader({ columns })

        // An unsorted column previews the way its first click sorts.
        await expect(indicator('Name')).toHaveAttribute('data-preview-direction', 'asc')
        await expect(pathOf(previewGlyph('Name'))).toBe(ASC_PATH)
        await expect(indicator('Age')).toHaveAttribute('data-preview-direction', 'desc')
        await expect(pathOf(previewGlyph('Age'))).toBe(DESC_PATH)
        await expect(indicator('Role')).toHaveAttribute('data-preview-direction', 'desc')
        await expect(pathOf(previewGlyph('Role'))).toBe(DESC_PATH)
        await expect(indicator('Id')).toHaveAttribute('data-preview-direction', 'asc')

        // The hover glyph and the first click agree.
        await userEvent.click(sortButton('Age'))
        await expect(ariaSorts()['Age']).toBe('descending')
        await userEvent.click(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('ascending')
    })

    it('ST-11a: Shift+Tab from the body lands on the pin, then reaches a sortable header with the focus look, Tab moves to the next header control, Enter sorts, leaving clears the look', async () => {
        mountHeader()
        const pin = document.querySelector<HTMLElement>('button[aria-haspopup="true"]')!

        // The only programmatic step puts the focus on the active body row. The pin is reached by a real Shift+Tab
        // (ASMA-8702), so the focus counts as keyboard focus (`:focus-visible`).
        document.querySelector<HTMLElement>('tbody tr[tabindex="0"]')!.focus()
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
        await expect(document.activeElement).toBe(pin)

        // Shift+Tab: the sortable header before the pin, with the hover look: the grey triangle, no square.
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
        await expect(document.activeElement).toBe(sortButton('Age'))
        await expect(sortButton('Age').matches(':focus-visible')).toBe(true)
        await expectShown('Age', 'preview')
        await expectNoSquare('Age')
        await expect(getComputedStyle(indicator('Age')).color).toBe(resolveColor('var(--colors-delta-600)'))

        // Enter sorts (a number column sorts descending first). The header keeps keyboard focus, so it previews the
        // next click: ascending, still gama-500 (ST-16).
        await userEvent.keyboard('{Enter}')
        await expect(ariaSorts()['Age']).toBe('descending')
        await expectShown('Age', 'preview')
        await expect(pathOf(previewGlyph('Age'))).toBe(ASC_PATH)
        await expect(getComputedStyle(indicator('Age')).color).toBe(resolveColor('var(--colors-gama-500)'))

        // Shift+Tab goes on to the previous header control; Tab comes back to the next one, never down to the rows.
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
        await expect(document.activeElement).toBe(sortButton('Role'))
        await expectShown('Role', 'preview')
        await expect(getComputedStyle(indicator('Role')).color).toBe(resolveColor('var(--colors-delta-600)'))
        await expectNoSquare('Role')
        // Age was left: it keeps only its current glyph, descending.
        await expectShown('Age', 'current')
        await expect(pathOf(currentGlyph('Age'))).toBe(DESC_PATH)
        await expect(getComputedStyle(indicator('Age')).color).toBe(resolveColor('var(--colors-gama-500)'))
        await expectNoSquare('Age')

        await userEvent.keyboard('{Tab}')
        await expect(document.activeElement).toBe(sortButton('Age'))
        await userEvent.keyboard('{Tab}')
        await expect(document.activeElement).toBe(pin)
        await expect(document.activeElement?.closest('tbody')).toBeNull()

        // Leaving cleared every look: an unsorted header shows nothing, a sorted one keeps its glyph only.
        await expectShown('Role', 'none')
        await expectNoSquare('Role')
        await expectShown('Age', 'current')

        // Space sorts too, on a header reached by Shift+Tab from the pin.
        await userEvent.keyboard('{Shift>}{Tab}{Tab}{/Shift}')
        await expect(document.activeElement).toBe(sortButton('Role'))
        await userEvent.keyboard('{ }')
        await expect(ariaSorts()['Role']).toBe('ascending')
    })

    // K-12 (ASMA-8702). It was an `it.todo` (ST-11c): a keyboard user could not ENTER the header controls from outside
    // the header, because the header row was the one tab stop and the controls came after it in the DOM.
    it('ST-11c / K-12: the header controls are reachable by sequential keyboard navigation (WCAG 2.1.1): Tab from before the table walks the sort headers and the pin, and Enter sorts', async () => {
        mount(
            <div>
                <button type='button'>Before</button>
                {table()}
            </div>,
        )
        const pin = document.querySelector<HTMLElement>('button[aria-haspopup="true"]')!
        const stops: (Element | null)[] = []

        document.querySelector<HTMLElement>('button')!.focus()

        // Name, Role and Age sort; Notes does not; then the pin. No `.focus()` on a header or the pin.
        for (let presses = 0; presses < 4; presses += 1) {
            await userEvent.keyboard('{Tab}')
            stops.push(document.activeElement)
        }

        await expect(stops).toEqual([sortButton('Name'), sortButton('Role'), sortButton('Age'), pin])
        await expect(stops.some((stop) => stop?.closest('tbody'))).toBe(false)

        await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
        await expect(document.activeElement).toBe(sortButton('Age'))
        await userEvent.keyboard('{Enter}')
        await expect(ariaSorts()['Age']).toBe('descending')
    })

    it('A-04: both glyph colours reach 3:1 on the header in all three themes', async () => {
        mountHeader()
        const original = document.documentElement.getAttribute('data-theme')

        try {
            for (const theme of ['default', 'greenish', 'fretex']) {
                document.documentElement.setAttribute('data-theme', theme)

                const header = resolveColor('var(--colors-gray-10)')
                const grey = resolveColor('var(--colors-delta-600)')
                const primary = resolveColor('var(--colors-gama-500)')

                for (const [name, glyph] of [['delta-600', grey], ['gama-500', primary]] as const) {
                    await expect(contrast(glyph, header), `${theme}: ${name} on the header`).toBeGreaterThanOrEqual(3)
                }
            }
        } finally {
            if (original) document.documentElement.setAttribute('data-theme', original)
        }
    })
})

describe('Contrast of the sorted glyph (A-04, A-05)', () => {
    beforeEach(parkPointer)
    afterEach(cleanup)

    it('A-05: a sorted glyph is gama-500 at rest and when the next click sorts again, with at least 4.4:1 on the header in every theme; the removal preview is delta-600 and gama-400 is gone (P2d)', async () => {
        mountHeader({ initialState: { sorting: [{ id: 'name', desc: false }] } })
        const original = document.documentElement.getAttribute('data-theme')
        // `greenish` is the jade theme (Ad Opus). The preview of a click that sorts again is gama-500 too (UX round 3,
        // 2026-11-02; the removal preview is delta-600, which A-04 holds to 3:1), so the OQ-12 exception for gama-400 on
        // hover and focus (3.02:1, 2.62:1 and 2.15:1) no longer exists. Each ratio is
        // pinned to two decimals (the exact values are 4.4743, 4.4162 and 4.4998), so this fails if a token moves any of
        // them, in either direction.
        const accepted = [
            ['greenish', 4.47],
            ['default', 4.42],
            ['fretex', 4.5],
        ] as const

        try {
            for (const [theme, restContrast] of accepted) {
                document.documentElement.setAttribute('data-theme', theme)

                const header = resolveColor('var(--colors-gray-10)')
                const primary = resolveColor('var(--colors-gama-500)')

                await expect(contrast(primary, header), `${theme}: gama-500`).toBeCloseTo(restContrast, 2)
                await expect(contrast(primary, header), `${theme}: gama-500`).toBeGreaterThanOrEqual(4.4)
                // At rest, and under the pointer (the preview of the next sort): the same colour, so the same contrast.
                await expect(getComputedStyle(indicator('Name')).color, `${theme}: at rest`).toBe(primary)
                await userEvent.hover(sortButton('Name'))
                await expect(getComputedStyle(indicator('Name')).color, `${theme}: hovered`).toBe(primary)
                await userEvent.unhover(sortButton('Name'))
            }
        } finally {
            if (original) document.documentElement.setAttribute('data-theme', original)
            else document.documentElement.removeAttribute('data-theme')
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

    it('ST-12: the zone is 24 x 28px with a 4px radius, centred in the header content at the right edge; the bar 4 x 24px, 4px radius, centred in it (P2d, Figma 46298:231237 and 46298:231480)', async () => {
        mountHeader({ columns: narrow, enableColumnResizing: true })

        const zoneElement = resizerOf('Name')
        const zone = rect(zoneElement)
        const cell = rect(headerCell('Name'))
        const content = rect(headerCell('Name').querySelector('[class*="show-table-header"]')!)
        const bar = getComputedStyle(zoneElement, '::after')

        // The header row stays 32px: 30px of content and the 1px borders. The zone is shorter than the content.
        await expect(cell.height).toBe(32)
        await expect(content.height).toBe(30)
        await expect(zone.width).toBe(24)
        await expect(zone.height).toBe(28)
        await expect(getComputedStyle(zoneElement).borderRadius).toBe('4px')
        await expect(Math.abs(zone.right - cell.right)).toBeLessThanOrEqual(0.5)
        // Vertically centred in the header content: 1px above and 1px below.
        await expect(Math.abs(zone.top + zone.height / 2 - (content.top + content.height / 2))).toBeLessThanOrEqual(0.5)

        await expect(bar.width).toBe('4px')
        await expect(bar.height).toBe('24px')
        await expect(bar.borderRadius).toBe('4px')
        // UX confirmed (ASMA-8597 OQ-03): the bar stays at the zone's right edge, as the Figma Resize frame draws it.
        await expect(bar.right).toBe('0px')
        // Centred vertically in the zone: 2px above and 2px below.
        await expect(Number.parseFloat(bar.top) + Number.parseFloat(bar.height) / 2).toBe(zone.height / 2)
        // UX answered OQ-10 (ASMA-8597, comment 94751): the bar is delta-400.
        await expect(bar.backgroundColor).toBe(resolveColor('var(--colors-delta-400)'))
    })

    it('ST-12: in a 100px column nothing sits under the zone: label and glyph end before it', async () => {
        mountHeader({ columns: narrow, enableColumnResizing: true })
        // The slot shows while the header is hovered (ST-15), which is when it could end up under the zone.
        await userEvent.hover(sortButton('Name'))

        const zone = rect(resizerOf('Name'))
        const slot = rect(indicator('Name'))
        const glyph = rect(shownGlyph('Name'))
        const centre = { x: glyph.left + glyph.width / 2, y: glyph.top + glyph.height / 2 }
        const hit = document.elementFromPoint(centre.x, centre.y)

        await expect(slot.right).toBeLessThanOrEqual(zone.left + 0.5)
        await expect(hit).not.toBe(resizerOf('Name'))
        await expect(resizerOf('Name').contains(hit)).toBe(false)
        // And the zone itself belongs to the handle.
        const zoneHit = document.elementFromPoint(zone.left + zone.width / 2, zone.top + zone.height / 2)

        await expect(zoneHit).toBe(resizerOf('Name'))
    })

    it('ST-12: an unsorted resizable header at rest has no slot, its label runs up to the zone, and the collapsed glyph cannot be hit', async () => {
        const columns: ColumnDef<Person>[] = [
            { accessorKey: 'name', header: 'Name', size: 100, minSize: 100 },
            { accessorKey: 'role', header: LONG, size: 100, minSize: 100 },
            { accessorKey: 'age', header: 'Age', size: 160 },
        ]

        mountHeader({ columns, enableColumnResizing: true })

        for (const header of ['Name', LONG]) {
            const zone = rect(resizerOf(header))
            const slot = indicator(header)

            // Unsorted, at rest, not hovered: no slot (P2b, UX OQ-07), so the label keeps all the room before the zone.
            await expect(slotWidth(header)).toBe(0)
            await expectShown(header, 'none')
            await expect(rect(labelOf(header)).right).toBeLessThanOrEqual(zone.left + 0.5)

            // Nothing of the collapsed 28px glyph boxes can be hit: not at their centre, which lies at the zone's edge,
            // nor at their left half, which lies over the label.
            const glyph = rect(previewGlyph(header))

            for (const x of [glyph.left + 2, glyph.left + glyph.width / 2]) {
                const hit = document.elementFromPoint(x, glyph.top + glyph.height / 2)

                await expect(slot.contains(hit)).toBe(false)
                await expect(hit).not.toBe(previewGlyph(header))
                await expect(hit).not.toBe(currentGlyph(header))
            }
        }

        // A truncated label fills the room: it ends exactly where the zone begins, with no 20px slot taken from it.
        const label = labelOf(LONG)

        await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth)
        await expect(Math.abs(rect(label).right - rect(resizerOf(LONG)).left)).toBeLessThanOrEqual(0.5)
    })

    it('ST-12: fixed-left and fixed-right resizable columns have the same zone and bar, flush with their cell, and the same zone hover look', async () => {
        const columns: ColumnDef<Person>[] = [
            { accessorKey: 'name', header: 'Name', size: 120, minSize: 100, fixedLeft: true },
            { accessorKey: 'role', header: 'Role', size: 160, minSize: 100 },
            { accessorKey: 'age', header: 'Age', size: 120, minSize: 100, fixedRight: true },
        ]

        // `enableResizing` gives the last column a handle too, and here the last column is the fixed-right one.
        mountHeader({ columns, enableColumnResizing: true, enableResizing: true })

        await expect(headerCell('Name').className).toContain('t-cell__fixed')
        await expect(headerCell('Age').className).toContain('t-cell__fixed-right')

        for (const label of ['Name', 'Role', 'Age']) {
            const zoneElement = resizerOf(label)

            await expect(zoneElement, `${label} has a handle`).not.toBeNull()

            const zone = rect(zoneElement)
            const cell = rect(headerCell(label))
            const content = rect(headerCell(label).querySelector('[class*="show-table-header"]')!)
            const bar = getComputedStyle(zoneElement, '::after')

            await expect(zone.width, `${label}: zone width`).toBe(24)
            await expect(zone.height, `${label}: zone height`).toBe(28)
            await expect(Math.abs(zone.right - cell.right), `${label}: zone flush with its cell`).toBeLessThanOrEqual(0.5)
            await expect(
                Math.abs(zone.top + zone.height / 2 - (content.top + content.height / 2)),
                `${label}: zone centred in the header content`,
            ).toBeLessThanOrEqual(0.5)
            // The bar sits at the zone's right edge (`--resizer-bar-offset` is 0), 4 x 24.
            await expect(bar.right, `${label}: bar right edge`).toBe('0px')
            await expect(bar.width).toBe('4px')
            await expect(bar.height).toBe('24px')
            await expect(Number.parseFloat(bar.top) + Number.parseFloat(bar.height) / 2).toBe(zone.height / 2)

            // The pointer over the zone: the same fill and bar colour as in a plain column.
            const control = sortButton(label)

            await userEvent.hover(control, { position: { x: control.clientWidth - 12, y: 15 } })
            await expect(zoneElement.matches(':hover'), `${label}: pointer over the zone`).toBe(true)
            await expect(getComputedStyle(zoneElement).backgroundColor, `${label}: zone fill`).toBe(resolveColor('var(--colors-gama-50)'))
            await expect(getComputedStyle(zoneElement, '::after').backgroundColor, `${label}: bar on zone hover`).toBe(
                resolveColor('var(--colors-gama-400)'),
            )
        }
    })

    it('ST-12: pressing on the zone starts a resize and never sorts', async () => {
        mountHeader({ columns: narrow, enableColumnResizing: true })

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
        mountHeader({ columns: narrow, enableColumnResizing: true })

        const padding = (label: string): string =>
            getComputedStyle(headerCell(label).querySelector('[class*="show-table-header"]')!).paddingRight

        await expect(padding('Name')).toBe('24px')
        await expect(padding('Role')).toBe('24px')
        // The last data column has no handle (resizing the last one would only resize the table): unchanged.
        await expect(resizerOf('Age')).toBeNull()
        await expect(padding('Age')).toBe('10px')
    })

    it('without resizing no handle and no reserved space', async () => {
        mountHeader({ columns: narrow })

        await expect(resizerOf('Name')).toBeNull()
        await expect(
            getComputedStyle(headerCell('Name').querySelector('[class*="show-table-header"]')!).paddingRight,
        ).not.toBe('24px')
    })
})

const slotWidth = (label: string): number => rect(indicator(label)).width

describe('ST-15: the slot exists only when it has something to show (P2b, UX OQ-07, comments 94750 and 94751)', () => {
    beforeEach(parkPointer)
    afterEach(cleanup)

    it('an unsorted header at rest has no slot: 0px wide, drawing nothing, with no overflow and no hit area', async () => {
        mountHeader()

        const slot = indicator('Role')
        const parent = sortButton('Role')

        await expect(slotWidth('Role')).toBe(0)
        await expect(getComputedStyle(slot).overflowX).toBe('hidden')
        await expectShown('Role', 'none')
        await expectNoSquare('Role')
        // The 28px glyph boxes do not stick out of the collapsed slot: the header gets no extra scrollable width.
        await expect(parent.scrollWidth).toBeLessThanOrEqual(parent.clientWidth)
        // And nothing of them can be hit: a point where the glyph boxes would lie reaches neither the slot nor a glyph.
        const glyph = rect(previewGlyph('Role'))
        const hit = document.elementFromPoint(glyph.right - 2, glyph.top + glyph.height / 2)

        await expect(slot.contains(hit)).toBe(false)
    })

    it('hovering the header gives an unsorted column its 20px slot, and leaving takes it back', async () => {
        mountHeader()

        await userEvent.hover(sortButton('Role'))
        await expect(slotWidth('Role')).toBe(20)
        await expect(rect(indicator('Role')).height).toBe(28)
        await expectShown('Role', 'preview')
        // Only the hovered header: the other unsorted ones keep none.
        await expect(slotWidth('Age')).toBe(0)

        await userEvent.unhover(sortButton('Role'))
        await expect(slotWidth('Role')).toBe(0)
    })

    it('keyboard focus (:focus-visible) gives it the slot too, and leaving the header takes it back', async () => {
        mountHeader()

        // After a key press, programmatic focus counts as keyboard focus.
        await userEvent.keyboard('{Shift}')
        sortButton('Role').focus()
        await expect(sortButton('Role').matches(':focus-visible')).toBe(true)
        await expect(slotWidth('Role')).toBe(20)
        await expectShown('Role', 'preview')
        await expect(slotWidth('Age')).toBe(0)

        sortButton('Role').blur()
        await expect(slotWidth('Role')).toBe(0)
    })

    it('a header clicked until it is unsorted keeps no slot once the pointer leaves: focus from a click is not :focus-visible', async () => {
        mountHeader()

        // asc, desc, none: the header ends unsorted and, being clicked, still has focus.
        await userEvent.click(sortButton('Role'))
        await userEvent.click(sortButton('Role'))
        await userEvent.click(sortButton('Role'))
        await expect(ariaSorts()['Role']).toBe('none')
        await userEvent.unhover(sortButton('Role'))

        // Focus from a pointer press is `:focus`, not `:focus-visible`, and only the latter gives the slot.
        await expect(document.activeElement).toBe(sortButton('Role'))
        await expect(sortButton('Role').matches(':focus')).toBe(true)
        await expect(sortButton('Role').matches(':focus-visible')).toBe(false)
        await expect(slotWidth('Role')).toBe(0)
        await expectShown('Role', 'none')
        await expectNoSquare('Role')
    })

    it('a sorted header always has the slot: at rest, hovered, focused and after leaving', async () => {
        mountHeader({ initialState: { sorting: [{ id: 'name', desc: false }] } })

        await expect(slotWidth('Name')).toBe(20)
        await userEvent.hover(sortButton('Name'))
        await expect(slotWidth('Name')).toBe(20)
        await userEvent.unhover(sortButton('Name'))
        await expect(slotWidth('Name')).toBe(20)

        await userEvent.keyboard('{Shift}')
        sortButton('Name').focus()
        await expect(slotWidth('Name')).toBe(20)
        sortButton('Name').blur()
        await expect(slotWidth('Name')).toBe(20)

        // A column sorted by a click keeps it once the pointer has left.
        await userEvent.click(sortButton('Role'))
        await userEvent.unhover(sortButton('Role'))
        await expect(ariaSorts()['Role']).toBe('ascending')
        await expect(slotWidth('Role')).toBe(20)
    })

    it('a truncated unsorted label is 20px shorter while the header is hovered or focused, and leaving restores it', async () => {
        mountHeader({ columns: longColumns })

        const atRest = rect(labelOf(LONG)).width

        await expect(labelOf(LONG).scrollWidth).toBeGreaterThan(labelOf(LONG).clientWidth)

        await userEvent.hover(sortButton(LONG))
        await expect(Math.abs(rect(labelOf(LONG)).width - (atRest - 20))).toBeLessThanOrEqual(0.5)
        await userEvent.unhover(sortButton(LONG))
        await expect(Math.abs(rect(labelOf(LONG)).width - atRest)).toBeLessThanOrEqual(0.5)

        await userEvent.keyboard('{Shift}')
        sortButton(LONG).focus()
        await expect(Math.abs(rect(labelOf(LONG)).width - (atRest - 20))).toBeLessThanOrEqual(0.5)
        sortButton(LONG).blur()
        await expect(Math.abs(rect(labelOf(LONG)).width - atRest)).toBeLessThanOrEqual(0.5)
    })
})

const GAMA_500 = (): string => resolveColor('var(--colors-gama-500)')
const GAMA_400 = (): string => resolveColor('var(--colors-gama-400)')
const GAMA_50 = (): string => resolveColor('var(--colors-gama-50)')
const DELTA_400 = (): string => resolveColor('var(--colors-delta-400)')
const DELTA_600 = (): string => resolveColor('var(--colors-delta-600)')
const TRANSPARENT = 'rgba(0, 0, 0, 0)'
const glyphColour = (label: string): string => getComputedStyle(indicator(label)).color

type Direction = 'asc' | 'desc'
/** What the user sees in a header's slot: which glyph, which way it points, in which of the two colours. */
interface Look {
    shown: 'none' | 'current' | 'preview'
    direction?: Direction
    colour?: 'primary' | 'neutral'
}

const lookOfHeader = (label: string): { shown: string; direction?: string; colour?: string } => {
    const shown = isShown(currentGlyph(label)) ? 'current' : isShown(previewGlyph(label)) ? 'preview' : 'none'

    if (shown === 'none') return { shown }

    const glyph = shown === 'current' ? currentGlyph(label) : previewGlyph(label)
    const colour = glyphColour(label)

    // Any other colour (gama-400 for one) shows up as itself and fails the comparison.
    return {
        shown,
        direction: pathOf(glyph) === ASC_PATH ? 'asc' : 'desc',
        colour: colour === GAMA_500() ? 'primary' : colour === DELTA_600() ? 'neutral' : colour,
    }
}

const NONE: Look = { shown: 'none' }
const current = (direction: Direction): Look => ({ shown: 'current', direction, colour: 'primary' })
const preview = (direction: Direction, colour: 'primary' | 'neutral'): Look => ({ shown: 'preview', direction, colour })

const previewColumns: ColumnDef<Person>[] = [
    { accessorKey: 'name', header: 'Name', size: 160 }, // text: ascending first
    { accessorKey: 'role', header: 'Role', size: 160, sortDescFirst: true }, // descending first
    { accessorKey: 'age', header: 'Age', size: 160 }, // number: descending first
]

/**
 * Every state of a sortable header: the sort it is in, what it looks like at rest, and what it previews while it is
 * hovered or keyboard-focused. The preview is what the header will look like right after the click (UX round 3,
 * 2026-11-02; `getNextSortingOrder()`): teal for a sort in a direction, grey for the removal of the sort and for an
 * unsorted column, which is unchanged.
 */
const PREVIEW_CASES: { name: string; label: string; sorting: Direction | null; rest: Look; hover: Look }[] = [
    { name: 'text column, unsorted', label: 'Name', sorting: null, rest: NONE, hover: preview('asc', 'neutral') },
    { name: 'text column, ascending', label: 'Name', sorting: 'asc', rest: current('asc'), hover: preview('desc', 'primary') },
    { name: 'text column, descending (the next click removes the sort)', label: 'Name', sorting: 'desc', rest: current('desc'), hover: preview('asc', 'neutral') },
    { name: 'descending-first column, unsorted', label: 'Role', sorting: null, rest: NONE, hover: preview('desc', 'neutral') },
    { name: 'descending-first column, descending', label: 'Role', sorting: 'desc', rest: current('desc'), hover: preview('asc', 'primary') },
    { name: 'descending-first column, ascending (the next click removes the sort)', label: 'Role', sorting: 'asc', rest: current('asc'), hover: preview('desc', 'neutral') },
    { name: 'number column, unsorted', label: 'Age', sorting: null, rest: NONE, hover: preview('desc', 'neutral') },
    { name: 'number column, descending', label: 'Age', sorting: 'desc', rest: current('desc'), hover: preview('asc', 'primary') },
]

const mountPreview = (label: string, sorting: Direction | null): void => {
    const id = label.toLowerCase()

    mountHeader({
        columns: previewColumns,
        ...(sorting ? { initialState: { sorting: [{ id, desc: sorting === 'desc' }] } } : {}),
    })
}

describe('ST-16: a hovered or :focus-visible header previews the state after the click (P2d, UX round 3, 2026-11-02)', () => {
    beforeEach(parkPointer)
    afterEach(cleanup)

    it.each(PREVIEW_CASES)('$name: the look at rest, under the pointer, and at rest again', async ({ label, sorting, rest, hover }) => {
        mountPreview(label, sorting)

        await expect(lookOfHeader(label)).toEqual(rest)

        await userEvent.hover(sortButton(label))
        await expect(lookOfHeader(label)).toEqual(hover)
        await expectNoSquare(label)
        // `aria-sort` is the state now, never the preview.
        await expect(headerCell(label)).toHaveAttribute('aria-sort', sorting ? (sorting === 'asc' ? 'ascending' : 'descending') : 'none')

        await userEvent.unhover(sortButton(label))
        await expect(lookOfHeader(label)).toEqual(rest)
    })

    it.each(PREVIEW_CASES)('$name: :focus-visible shows the same preview as hover, and leaving the header the look at rest', async ({ label, sorting, rest, hover }) => {
        mountPreview(label, sorting)

        // After a key press, programmatic focus counts as keyboard focus.
        await userEvent.keyboard('{Shift}')
        sortButton(label).focus()
        await expect(sortButton(label).matches(':focus-visible')).toBe(true)
        await expect(lookOfHeader(label)).toEqual(hover)
        await expectNoSquare(label)

        sortButton(label).blur()
        await expect(lookOfHeader(label)).toEqual(rest)
    })

    it('a sorted glyph is gama-500 at rest and in a preview that sorts again, delta-600 in the removal preview, and never gama-400', async () => {
        for (const desc of [false, true]) {
            mountPreview('Name', desc ? 'desc' : 'asc')

            await expect(glyphColour('Name')).toBe(GAMA_500())
            await userEvent.hover(sortButton('Name'))
            // Ascending previews descending in teal; descending previews the removal, in grey.
            await expect(glyphColour('Name')).toBe(desc ? DELTA_600() : GAMA_500())
            await expect(glyphColour('Name')).not.toBe(GAMA_400())
            await userEvent.unhover(sortButton('Name'))
            await expect(glyphColour('Name')).toBe(GAMA_500())
            await expect(glyphColour('Name')).not.toBe(GAMA_400())
            cleanup()
        }
    })

    it('for a sorted column the preview is what a plain click produces, in direction and colour: ascending, descending, then removed', async () => {
        mountPreview('Name', 'asc')

        // Ascending: the click sorts descending, previewed in teal, and the header then rests that way.
        await userEvent.hover(sortButton('Name'))
        await expect(lookOfHeader('Name')).toEqual(preview('desc', 'primary'))
        await userEvent.click(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('descending')
        await userEvent.unhover(sortButton('Name'))
        await expect(lookOfHeader('Name')).toEqual(current('desc'))

        // Descending: the click removes the sort, previewed as the grey first direction; the header then shows nothing.
        await userEvent.hover(sortButton('Name'))
        await expect(lookOfHeader('Name')).toEqual(preview('asc', 'neutral'))
        await userEvent.click(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('none')
        await userEvent.unhover(sortButton('Name'))
        await expect(lookOfHeader('Name')).toEqual(NONE)
    })

    it('an unsorted header previews the way its first click sorts, in grey (UX keeps the unsorted look); the click then sorts it that way, in teal', async () => {
        mountPreview('Name', null)

        await userEvent.hover(sortButton('Name'))
        await expect(lookOfHeader('Name')).toEqual(preview('asc', 'neutral'))
        await userEvent.click(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('ascending')
        await userEvent.unhover(sortButton('Name'))
        await expect(lookOfHeader('Name')).toEqual(current('asc'))
    })

    it('a mouse click and then the pointer leaving shows the new rest state: focus from a click is not :focus-visible, so no stale preview', async () => {
        mountPreview('Name', null)

        // Unsorted -> ascending, then away.
        await userEvent.click(sortButton('Name'))
        await userEvent.unhover(sortButton('Name'))
        await expect(document.activeElement).toBe(sortButton('Name'))
        await expect(sortButton('Name').matches(':focus')).toBe(true)
        await expect(sortButton('Name').matches(':focus-visible')).toBe(false)
        await expect(ariaSorts()['Name']).toBe('ascending')
        await expect(lookOfHeader('Name')).toEqual(current('asc'))
        await expect(slotWidth('Name')).toBe(20)

        // Ascending -> descending, then away.
        await userEvent.click(sortButton('Name'))
        await userEvent.unhover(sortButton('Name'))
        await expect(lookOfHeader('Name')).toEqual(current('desc'))

        // Descending -> unsorted (the removal), then away: nothing is shown and the slot is gone, though the header is still focused.
        await userEvent.click(sortButton('Name'))
        await userEvent.unhover(sortButton('Name'))
        await expect(ariaSorts()['Name']).toBe('none')
        await expect(document.activeElement).toBe(sortButton('Name'))
        await expect(lookOfHeader('Name')).toEqual(NONE)
        await expect(slotWidth('Name')).toBe(0)
    })
})

type Aria = 'ascending' | 'descending' | 'none'
type SortSpec = [id: string, direction: Direction][]

const mountSorted = (sorting: SortSpec, props: TableProps = {}): void => {
    mountHeader({
        columns: previewColumns,
        initialState: { sorting: sorting.map(([id, direction]) => ({ id, desc: direction === 'desc' })) },
        ...props,
    })
}

const ariaOf = (sorting: SortSpec): Record<string, Aria> =>
    Object.fromEntries(
        ['Name', 'Role', 'Age'].map((label) => {
            const entry = sorting.find(([id]) => id === label.toLowerCase())

            return [label, entry ? (entry[1] === 'asc' ? 'ascending' : 'descending') : 'none']
        }),
    )

const ALL_NONE = { Name: 'none', Role: 'none', Age: 'none' } as const

/**
 * A plain click on one column of a multi-sort (TanStack's `toggleSorting(undefined, false)`): a sorted column that is
 * NOT the last entry replaces the whole sorting by itself and is never removed (a removal becomes ascending); the
 * last entry toggles in place and a removal drops only it. The preview must say which, and a real click must agree.
 * Name sorts ascending first; Role is `sortDescFirst`; Age is a number, so it sorts descending first.
 */
const MULTI_CASES: {
    name: string
    label: string
    sorting: SortSpec
    hover: Look
    after: Record<string, Aria>
    rest: Look
}[] = [
    { name: 'not last, ascending-first, ascending (flips, alone)', label: 'Name', sorting: [['name', 'asc'], ['age', 'desc']], hover: preview('desc', 'primary'), after: { ...ALL_NONE, Name: 'descending' }, rest: current('desc') },
    { name: 'not last, ascending-first, descending (the removal becomes ascending, alone)', label: 'Name', sorting: [['name', 'desc'], ['age', 'desc']], hover: preview('asc', 'primary'), after: { ...ALL_NONE, Name: 'ascending' }, rest: current('asc') },
    { name: 'not last, descending-first, ascending (the removal becomes ascending, alone)', label: 'Role', sorting: [['role', 'asc'], ['age', 'asc']], hover: preview('asc', 'primary'), after: { ...ALL_NONE, Role: 'ascending' }, rest: current('asc') },
    { name: 'not last, descending-first, descending (flips to ascending, alone)', label: 'Role', sorting: [['role', 'desc'], ['name', 'asc']], hover: preview('asc', 'primary'), after: { ...ALL_NONE, Role: 'ascending' }, rest: current('asc') },
    { name: 'last, number column, descending (flips in place)', label: 'Age', sorting: [['name', 'asc'], ['age', 'desc']], hover: preview('asc', 'primary'), after: { ...ALL_NONE, Name: 'ascending', Age: 'ascending' }, rest: current('asc') },
    { name: 'last, number column, ascending (removed, the others stay)', label: 'Age', sorting: [['name', 'asc'], ['age', 'asc']], hover: preview('desc', 'neutral'), after: { ...ALL_NONE, Name: 'ascending' }, rest: NONE },
    { name: 'last, ascending-first, ascending (flips in place)', label: 'Name', sorting: [['age', 'desc'], ['name', 'asc']], hover: preview('desc', 'primary'), after: { ...ALL_NONE, Age: 'descending', Name: 'descending' }, rest: current('desc') },
    { name: 'last, ascending-first, descending (removed, the others stay)', label: 'Name', sorting: [['age', 'desc'], ['name', 'desc']], hover: preview('asc', 'neutral'), after: { ...ALL_NONE, Age: 'descending' }, rest: NONE },
    { name: 'last, descending-first, ascending (removed, the others stay)', label: 'Role', sorting: [['name', 'asc'], ['role', 'asc']], hover: preview('desc', 'neutral'), after: { ...ALL_NONE, Name: 'ascending' }, rest: NONE },
    { name: 'last, descending-first, descending (flips in place)', label: 'Role', sorting: [['name', 'asc'], ['role', 'desc']], hover: preview('asc', 'primary'), after: { ...ALL_NONE, Name: 'ascending', Role: 'ascending' }, rest: current('asc') },
    { name: 'unsorted among sorted columns (grey first direction; the click replaces the sorting by it)', label: 'Role', sorting: [['name', 'asc'], ['age', 'asc']], hover: preview('desc', 'neutral'), after: { ...ALL_NONE, Role: 'descending' }, rest: current('desc') },
]

describe('ST-16: in a multi-sort the preview is the plain click, which replaces the sorting unless the column is the last entry (TanStack toggleSorting)', () => {
    beforeEach(parkPointer)
    afterEach(cleanup)

    it.each(MULTI_CASES)('$name: the preview, and the rendered state after a real plain click', async ({ label, sorting, hover, after, rest }) => {
        mountSorted(sorting)

        await expect(ariaSorts()).toEqual(ariaOf(sorting))

        await userEvent.hover(sortButton(label))
        await expect(lookOfHeader(label)).toEqual(hover)
        // The preview never changes `aria-sort`: it is the current state.
        await expect(ariaSorts()).toEqual(ariaOf(sorting))

        await userEvent.click(sortButton(label))
        await userEvent.unhover(sortButton(label))
        await expect(ariaSorts()).toEqual(after)
        await expect(lookOfHeader(label)).toEqual(rest)

        // The preview equals the rendered state: a primary preview is the direction the header now has, in teal.
        if (hover.colour === 'primary') await expect(rest).toEqual(current(hover.direction!))
    })

    it.each(MULTI_CASES)('$name: :focus-visible previews the same', async ({ label, sorting, hover }) => {
        mountSorted(sorting)

        await userEvent.keyboard('{Shift}')
        sortButton(label).focus()
        await expect(sortButton(label).matches(':focus-visible')).toBe(true)
        await expect(lookOfHeader(label)).toEqual(hover)
    })
})

describe('ST-16: with enableSortingRemoval: false a sorted column never previews the grey removal', () => {
    beforeEach(parkPointer)
    afterEach(cleanup)

    it.each([
        { label: 'Name', direction: 'asc' as const, hover: preview('desc', 'primary'), after: 'descending' },
        { label: 'Name', direction: 'desc' as const, hover: preview('asc', 'primary'), after: 'ascending' },
        { label: 'Role', direction: 'asc' as const, hover: preview('desc', 'primary'), after: 'descending' },
        { label: 'Role', direction: 'desc' as const, hover: preview('asc', 'primary'), after: 'ascending' },
    ])('$label, $direction: the opposite direction in teal under hover and :focus-visible, and the click does that', async ({ label, direction, hover, after }) => {
        mountSorted([[label.toLowerCase(), direction]], { enableSortingRemoval: false })

        await userEvent.hover(sortButton(label))
        await expect(lookOfHeader(label)).toEqual(hover)
        await userEvent.unhover(sortButton(label))

        await userEvent.keyboard('{Shift}')
        sortButton(label).focus()
        await expect(lookOfHeader(label)).toEqual(hover)
        sortButton(label).blur()

        await userEvent.click(sortButton(label))
        await userEvent.unhover(sortButton(label))
        await expect(ariaSorts()[label]).toBe(after)
        await expect(lookOfHeader(label)).toEqual(current(hover.direction!))
    })
})

describe('ST-17: the resize bar and zone while the header is hovered and while dragging (P2d, UX round 3, 2026-11-02)', () => {
    beforeEach(parkPointer)
    afterEach(cleanup)

    const narrow: ColumnDef<Person>[] = [
        { accessorKey: 'name', header: 'Name', size: 100, minSize: 100 },
        { accessorKey: 'role', header: 'Role', size: 100, minSize: 100 },
        { accessorKey: 'age', header: 'Age', size: 160 },
    ]
    const barColour = (label: string): string => getComputedStyle(resizerOf(label), '::after').backgroundColor
    const zoneFill = (label: string): string => getComputedStyle(resizerOf(label)).backgroundColor

    it('with the header hovered (not the zone) the bar is a grey delta-400 and the zone has no fill; at rest nothing shows', async () => {
        mountHeader({ columns: narrow, enableColumnResizing: true })

        // Hover-capable devices show the bar only while the header is hovered.
        await expect(getComputedStyle(resizerOf('Name')).opacity).toBe('0')
        await userEvent.hover(sortButton('Name'))
        // The pointer is on the label, not on the zone.
        await expect(resizerOf('Name').matches(':hover')).toBe(false)
        await expect(getComputedStyle(resizerOf('Name')).opacity).toBe('1')
        await expect(barColour('Name')).toBe(DELTA_400())
        await expect(barColour('Name')).not.toBe(GAMA_400())
        await expect(barColour('Name')).not.toBe(resolveColor('var(--colors-delta-300)'))
        await expect(zoneFill('Name')).toBe(TRANSPARENT)
        await expect(getComputedStyle(resizerOf('Name')).backgroundImage).toBe('none')
    })

    it('with the pointer over the zone (Figma "Resize hovered") the zone is filled gama-50 and the bar is gama-400', async () => {
        mountHeader({ columns: narrow, enableColumnResizing: true })

        // Playwright cannot build a locator for the bare zone, so put the pointer over it by position, in the header
        // control that holds it: 12px from the control's right edge, halfway down.
        const control = sortButton('Name')

        await userEvent.hover(control, { position: { x: control.clientWidth - 12, y: 15 } })
        await expect(resizerOf('Name').matches(':hover')).toBe(true)
        await expect(zoneFill('Name')).toBe(GAMA_50())
        await expect(barColour('Name')).toBe(GAMA_400())
        await expect(getComputedStyle(resizerOf('Name'), '::after').backgroundColor).not.toBe(GAMA_500())

        // Only the hovered zone: the next column's zone is not filled.
        await expect(zoneFill('Role')).toBe(TRANSPARENT)
        await expect(barColour('Role')).toBe(DELTA_400())

        // Back on the label: the zone loses its fill and the bar is grey again.
        await userEvent.hover(sortButton('Name'))
        await expect(zoneFill('Name')).toBe(TRANSPARENT)
        await expect(barColour('Name')).toBe(DELTA_400())
    })

    it('while the column is being resized the zone is filled gama-50 and the bar is gama-400 (as on zone hover), and grey again afterwards', async () => {
        mountHeader({ columns: narrow, enableColumnResizing: true })

        const zone = resizerOf('Name')
        const { left, top } = rect(zone)
        const press = (type: string, target: EventTarget): void => {
            target.dispatchEvent(
                new MouseEvent(type, { bubbles: true, cancelable: true, clientX: left + 12, clientY: top + 10, view: window }),
            )
        }
        const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 30))

        press('mousedown', zone)
        await settle()
        await expect(zone.className).toContain('isResizing')
        await expect(getComputedStyle(zone).opacity).toBe('1')
        // The real pointer is parked elsewhere, so this is the drag look and not the hover one.
        await expect(zone.matches(':hover')).toBe(false)
        await expect(zoneFill('Name')).toBe(GAMA_50())
        await expect(barColour('Name')).toBe(GAMA_400())
        await expect(barColour('Name')).not.toBe(GAMA_500())
        await expect(barColour('Name')).not.toBe(DELTA_400())

        // End the press the way a real one ends, with a click, so the next header click is not swallowed.
        press('mouseup', document)
        await settle()
        press('click', zone)
        await settle()

        await expect(zone.className).not.toContain('isResizing')
        await expect(zoneFill('Name')).toBe(TRANSPARENT)
        await expect(barColour('Name')).toBe(DELTA_400())
    })

    /** The table's rules about the resize zone and the sort slot, and whether each sits inside a `(hover: hover)` block. */
    const stylesheetRules = (): { selector: string; inHoverBlock: boolean; hidesAtRest: boolean }[] => {
        const found: { selector: string; inHoverBlock: boolean; hidesAtRest: boolean }[] = []
        const walk = (rules: CSSRuleList, inHoverBlock: boolean): void => {
            for (const rule of Array.from(rules)) {
                if (rule instanceof CSSMediaRule) {
                    walk(rule.cssRules, inHoverBlock || /\(hover:\s*hover\)/.test(rule.conditionText))
                } else if (rule instanceof CSSStyleRule && /resizer|isResizing|sort-indicator|sort-glyph/.test(rule.selectorText)) {
                    found.push({ selector: rule.selectorText, inHoverBlock, hidesAtRest: rule.style.opacity === '0' })
                }
            }
        }

        for (const sheet of Array.from(document.styleSheets)) {
            try {
                walk(sheet.cssRules, false)
            } catch {
                // A sheet from another origin cannot be read; the table's own sheet can.
            }
        }

        return found
    }

    it('on a touch-only device (no hover) the bar stays a grey, always visible delta-400 with no fill, and :hover previews nothing: every hover look sits in the (hover: hover) block', async () => {
        // The browser here can hover, so the rules are read instead: a touch-only device ignores the media block
        // (`@media (hover: hover)`) and so gets only what stands outside it.
        mountHeader({ columns: narrow, enableColumnResizing: true })

        // Anything that is a hover look, or hides the zone until the header is hovered.
        const hoverLooks = stylesheetRules().filter((rule) => rule.selector.includes(':hover') || rule.hidesAtRest)
        const outsideHover = hoverLooks.filter((rule) => !rule.inHoverBlock).map((rule) => rule.selector)

        // The rules exist (so this is not vacuous): the zone's `opacity: 0`, the header reveal, the zone's hover look and
        // the sort preview on hover.
        await expect(hoverLooks.length).toBeGreaterThanOrEqual(6)
        await expect(hoverLooks.some((rule) => /resizer\S*:hover/.test(rule.selector))).toBe(true)
        await expect(hoverLooks.some((rule) => /sortable-column\S*:hover .*sort-glyph--preview/.test(rule.selector))).toBe(true)
        await expect(outsideHover, `outside the (hover: hover) block: ${outsideHover.join(' | ')}`).toEqual([])

        // So a device without hover has the rest look: the zone is shown (no `opacity: 0` outside the block) in delta-400.
        await expect(barColour('Name')).toBe(DELTA_400())
        await expect(zoneFill('Name')).toBe(TRANSPARENT)
    })

    it('while a column is dragged the zone and bar look the same on every device: the .isResizing rules sit outside the (hover: hover) block', async () => {
        mountHeader({ columns: narrow, enableColumnResizing: true })

        const dragging = stylesheetRules().filter((rule) => rule.selector.includes('isResizing'))

        // The zone's fill and `opacity: 1`, and its bar: two rules at least, and none of them inside the hover block, so
        // a touch drag shows the `gama-50` fill and the `gama-400` bar as a mouse drag does.
        await expect(dragging.length).toBeGreaterThanOrEqual(2)
        await expect(dragging.some((rule) => rule.selector.includes('::after'))).toBe(true)
        await expect(dragging.filter((rule) => rule.inHoverBlock).map((rule) => rule.selector)).toEqual([])
    })
})
