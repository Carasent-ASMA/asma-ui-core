import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { people, type Person } from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'

/**
 * The column settings menu (the pin) shows or hides a column from its checkbox and from nothing else (ASMA-8597; the
 * owner, 2026-11-12: "it works exclusively with the checkbox, turning it on and off"). A click on the row, on the name or on
 * the drag icon, and a press and release on the drag icon that never became a drag, used to hide the column too, because the
 * whole row was a button that toggled it. Reordering by dragging the icon is as it was.
 *
 * Asserted in a real browser. The drags use the trusted mouse events a user's mouse makes (the Chrome DevTools protocol), so
 * dnd-kit's `PointerSensor` (8px activation distance) really activates or really does not.
 */

const PLAIN: ColumnDef<Person>[] = [
    { accessorKey: 'name', header: 'Name', size: 160 },
    { accessorKey: 'role', header: 'Role', size: 160 },
    { accessorKey: 'age', header: 'Age', size: 120 },
    { id: 'notes', header: 'Notes', size: 120 },
]

/** Name is fixed on the left (it cannot be reordered); Age cannot be hidden. */
const RESTRICTED: ColumnDef<Person>[] = [
    { accessorKey: 'name', header: 'Name', size: 160, fixedLeft: true },
    { accessorKey: 'role', header: 'Role', size: 160 },
    { accessorKey: 'age', header: 'Age', size: 120, enableHiding: false },
    { id: 'notes', header: 'Notes', size: 120 },
]

/** Name is fixed (it cannot be reordered); Age cannot be hidden; Notes is both; Role is neither. */
const REASONS: ColumnDef<Person>[] = [
    { accessorKey: 'name', header: 'Name', size: 160, fixedLeft: true },
    { accessorKey: 'role', header: 'Role', size: 160 },
    { accessorKey: 'age', header: 'Age', size: 120, enableHiding: false },
    { id: 'notes', header: 'Notes', size: 120, fixedRight: true, enableHiding: false },
]

const settle = (milliseconds = 60): Promise<void> => new Promise((resolve) => setTimeout(resolve, milliseconds))

const mountTable = async (columns: ColumnDef<Person>[] = PLAIN, locale: 'en' | 'no' = 'en'): Promise<void> => {
    mount(<StyledTable<Person> columns={columns} data={people} hideFooter locale={locale} />)
    await settle(150)
}

const pin = (): HTMLElement => document.querySelector<HTMLElement>('button[aria-haspopup="true"]')!
const openMenu = async (): Promise<void> => {
    await userEvent.click(pin())
    await waitFor(() => expect(pin().getAttribute('aria-expanded')).toBe('true'))
    // The popover opens with a transition: its boxes are only where they stay once it has run.
    await waitFor(() => expect(document.getAnimations().filter((animation) => animation.playState === 'running')).toHaveLength(0))
    await settle(100)
}

/** The labels of the columns shown, in order. */
const shown = (): string[] =>
    [...document.querySelectorAll('thead th')].map((cell) => cell.textContent?.trim() ?? '').filter((text) => text !== '')

const rowOf = (label: string): HTMLElement => {
    const row = [...document.querySelectorAll<HTMLElement>('[class*="table-action-item"]')].find((candidate) =>
        candidate.textContent?.includes(label),
    )

    if (!row) throw new Error(`No row "${label}"`)

    return row
}
const nameOf = (label: string): HTMLElement => [...rowOf(label).querySelectorAll<HTMLElement>('span')].at(-1)!
const handleOf = (label: string): SVGElement => rowOf(label).querySelector<SVGElement>('svg[role="button"]')!
const inputOf = (label: string): HTMLInputElement => rowOf(label).querySelector<HTMLInputElement>('input[type="checkbox"]')!
/** What a user clicks: the checkbox's own box, the label around its input. */
const boxOf = (label: string): HTMLElement => inputOf(label).closest('label')!
const rect = (element: Element): DOMRect => element.getBoundingClientRect()

/** The trusted mouse. `x` and `y` are viewport coordinates. */
const mouse = async (type: 'mousePressed' | 'mouseMoved' | 'mouseReleased', x: number, y: number): Promise<void> => {
    await cdp().send('Input.dispatchMouseEvent', {
        type,
        x,
        y,
        button: type === 'mouseMoved' ? 'none' : 'left',
        buttons: type === 'mouseReleased' ? 0 : 1,
        clickCount: 1,
    })
}
const centre = (element: Element): { x: number; y: number } => ({
    x: rect(element).left + rect(element).width / 2,
    y: rect(element).top + rect(element).height / 2,
})

/** Presses the icon, moves `distance` px straight down in small steps, and releases. */
const pressAndMove = async (label: string, distance: number): Promise<void> => {
    const { x, y } = centre(handleOf(label))

    await mouse('mouseMoved', x, y)
    await mouse('mousePressed', x, y)
    for (let step = 1; step <= 6; step += 1) {
        await mouse('mouseMoved', x, y + (distance * step) / 6)
        await settle(16)
    }
    await mouse('mouseReleased', x, y + distance)
    await settle(250)
}

/** Drags the icon of one row down to the row of another. */
const dragRow = async (from: string, to: string): Promise<void> => {
    const distance = centre(handleOf(to)).y - centre(handleOf(from)).y

    await pressAndMove(from, distance + (distance > 0 ? 6 : -6))
}

/** Tabs until `target` has the focus, with real key presses. */
const tabTo = async (target: Element, limit = 30): Promise<void> => {
    for (let presses = 0; presses < limit && document.activeElement !== target; presses += 1) await userEvent.tab()

    await expect(document.activeElement).toBe(target)
}

const parkPointer = async (): Promise<void> => {
    const parking = document.createElement('button')

    parking.type = 'button'
    parking.setAttribute('aria-label', 'parking')
    parking.style.cssText = 'position:fixed;right:0;bottom:0;width:40px;height:40px;opacity:0.01'
    document.body.appendChild(parking)
    await userEvent.hover(parking)
    parking.remove()
}

const tooltipText = (): string | null => document.querySelector('[role="tooltip"]')?.textContent ?? null
const waitForTooltip = (): Promise<void> =>
    waitFor(() => expect(document.querySelector('[role="tooltip"]')).not.toBeNull(), { timeout: 3000 })
/** The tooltip opens after 500ms: when nothing should open, wait past that. */
const expectNoTooltip = async (): Promise<void> => {
    await settle(900)
    await expect(document.querySelector('[role="tooltip"]')).toBeNull()
}
const closeTooltip = async (): Promise<void> => {
    await parkPointer()
    await waitFor(() => expect(document.querySelector('[role="tooltip"]')).toBeNull(), { timeout: 3000 })
}
/**
 * The reason a tooltip gives a control: the text of the open tooltip its `aria-describedby` points at, '' when it points at
 * none. (The drag icon is described by dnd-kit's own instructions too, which are not a reason.)
 */
const descriptionOf = (control: Element): string =>
    (control.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter(Boolean)
        .map((id) => document.getElementById(id))
        .filter((described) => described?.getAttribute('role') === 'tooltip')
        .map((described) => described?.textContent ?? '')
        .join(' ')
/** A read-only checkbox takes no pointer events, so the hover is forced onto where its box is. */
const hoverBox = (label: string): Promise<void> => userEvent.hover(boxOf(label), { force: true })

beforeEach(async () => {
    localStorage.clear()
    await parkPointer()
})
afterEach(cleanup)

describe('A column is shown or hidden only from its checkbox', () => {
    it('a click on the empty part of the row leaves the column as it is', async () => {
        await mountTable()
        await openMenu()

        await userEvent.click(rowOf('Role'), { position: { x: rect(rowOf('Role')).width - 20, y: 20 } })
        await settle()

        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
    })

    it('a click on the name leaves the column as it is', async () => {
        await mountTable()
        await openMenu()

        await userEvent.click(nameOf('Role'))
        await settle()

        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
    })

    it('a click on the move icon leaves the column as it is', async () => {
        await mountTable()
        await openMenu()

        await userEvent.click(handleOf('Role'))
        await settle()

        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
    })

    it('a press and release on the move icon that never became a drag (3px, under the 8px activation distance) leaves the column as it is', async () => {
        await mountTable()
        await openMenu()

        await pressAndMove('Role', 3)

        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
    })

    it('a short drag of the move icon (7px, still under the activation distance) leaves the column as it is, and does not reorder', async () => {
        await mountTable()
        await openMenu()

        await pressAndMove('Role', 7)

        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
    })

    it('the checkbox hides the column when clicked, and shows it when clicked again', async () => {
        await mountTable()
        await openMenu()

        await userEvent.click(boxOf('Role'))
        await waitFor(() => expect(shown()).toEqual(['Name', 'Age', 'Notes']))
        await expect(inputOf('Role').checked).toBe(false)

        await userEvent.click(boxOf('Role'))
        await waitFor(() => expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes']))
        await expect(inputOf('Role').checked).toBe(true)
    })

    it('Space on the focused checkbox hides and shows the column, and Enter does not', async () => {
        await mountTable()
        await openMenu()
        await tabTo(inputOf('Role'))

        await userEvent.keyboard('{Enter}')
        await settle()
        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])

        await userEvent.keyboard(' ')
        await waitFor(() => expect(shown()).toEqual(['Name', 'Age', 'Notes']))
        await expect(document.activeElement).toBe(inputOf('Role'))

        await userEvent.keyboard(' ')
        await waitFor(() => expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes']))
    })
})

describe('Reordering by the move icon is as it was', () => {
    it('a drag of the icon down to another row reorders the columns, and hides none', async () => {
        await mountTable()
        await openMenu()

        await dragRow('Role', 'Notes')

        await waitFor(() => expect(shown()).toEqual(['Name', 'Age', 'Notes', 'Role']))
        // The drag ends with a release over the icon, which must not count as a click on anything.
        await expect(inputOf('Role').checked).toBe(true)
        await expect(shown()).toHaveLength(4)
    })

    it('a drag of the icon up reorders too, and the column stays shown', async () => {
        await mountTable()
        await openMenu()

        await dragRow('Notes', 'Name')

        await waitFor(() => expect(shown()).toEqual(['Notes', 'Name', 'Role', 'Age']))
        await expect(inputOf('Notes').checked).toBe(true)
    })

    it('a drag starts after 8px of movement and not before (the PointerSensor activation distance)', async () => {
        await mountTable()
        await openMenu()
        const { x, y } = centre(handleOf('Role'))
        // dnd-kit marks the icon `aria-pressed` while it is being dragged.
        const dragging = (): boolean => handleOf('Role').getAttribute('aria-pressed') === 'true'

        await mouse('mouseMoved', x, y)
        await mouse('mousePressed', x, y)
        await mouse('mouseMoved', x, y + 4)
        await mouse('mouseMoved', x, y + 7)
        await settle(80)
        await expect(dragging()).toBe(false)

        await mouse('mouseMoved', x, y + 12)
        await settle(80)
        await expect(dragging()).toBe(true)

        await mouse('mouseReleased', x, y + 12)
        await settle(250)
        await expect(dragging()).toBe(false)
        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
    })

    it('a fixed column cannot be dragged, and it stays shown', async () => {
        await mountTable(RESTRICTED)
        await openMenu()
        await expect(handleOf('Name').getAttribute('aria-disabled')).toBe('true')

        await dragRow('Name', 'Notes')
        await settle()

        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
    })

    it('a column cannot be dragged onto a fixed one', async () => {
        await mountTable(RESTRICTED)
        await openMenu()

        await dragRow('Role', 'Name')
        await settle()

        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
    })
})

describe('A column that cannot be hidden', () => {
    it('keeps its column when its checkbox is clicked, and says so (aria-readonly)', async () => {
        await mountTable(RESTRICTED)
        await openMenu()
        await expect(inputOf('Age').getAttribute('aria-readonly')).toBe('true')
        // It looks and behaves read only: no pointer events and the default cursor, where an editable one takes them.
        await expect(getComputedStyle(boxOf('Age')).pointerEvents).toBe('none')
        await expect(getComputedStyle(boxOf('Age')).cursor).toBe('default')
        await expect(getComputedStyle(boxOf('Role')).pointerEvents).not.toBe('none')
        await expect(getComputedStyle(boxOf('Role')).cursor).toBe('pointer')

        // A read-only checkbox takes no pointer events, so the click is forced to land where the box is.
        await userEvent.click(boxOf('Age'), { force: true })
        await settle()

        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
        await expect(inputOf('Age').checked).toBe(true)
    })
})

/** The reasons, as the column settings tell them in each language. */
const REASON_TEXTS = {
    en: {
        reorder: 'This column is fixed and can’t be reordered.',
        hidden: 'This column is fixed and can’t be hidden.',
        unhideable: 'This column can’t be hidden.',
    },
    no: {
        reorder: 'Denne kolonnen er fast og kan ikke flyttes.',
        hidden: 'Denne kolonnen er fast og kan ikke skjules.',
        unhideable: 'Denne kolonnen kan ikke skjules.',
    },
} as const

describe.each(['en', 'no'] as const)('The reason a control cannot be used is told by that control (%s)', (locale) => {
    const text = REASON_TEXTS[locale]

    it('a fixed column: its drag icon says why it cannot be moved, and its checkbox says nothing', async () => {
        await mountTable(REASONS, locale)
        await openMenu()

        await userEvent.hover(handleOf('Name'))
        await waitForTooltip()
        await expect(tooltipText()).toBe(text.reorder)
        await expect(descriptionOf(handleOf('Name'))).toBe(text.reorder)
        await expect(descriptionOf(inputOf('Name'))).toBe('')

        await closeTooltip()
        await hoverBox('Name')
        await expectNoTooltip()
        await expect(descriptionOf(inputOf('Name'))).toBe('')
    })

    it('a column that cannot be hidden but is not fixed: its checkbox says so without calling it fixed, its drag icon says nothing', async () => {
        await mountTable(REASONS, locale)
        await openMenu()

        await hoverBox('Age')
        await waitForTooltip()
        await expect(tooltipText()).toBe(text.unhideable)
        await expect(descriptionOf(inputOf('Age'))).toBe(text.unhideable)
        await expect(descriptionOf(handleOf('Age'))).toBe('')

        await closeTooltip()
        await userEvent.hover(handleOf('Age'))
        await expectNoTooltip()
        await expect(descriptionOf(handleOf('Age'))).toBe('')
    })

    it('a fixed column that cannot be hidden: each control says its own reason', async () => {
        await mountTable(REASONS, locale)
        await openMenu()

        await hoverBox('Notes')
        await waitForTooltip()
        await expect(tooltipText()).toBe(text.hidden)
        await expect(descriptionOf(inputOf('Notes'))).toBe(text.hidden)
        await expect(descriptionOf(handleOf('Notes'))).toBe('')

        await closeTooltip()
        await userEvent.hover(handleOf('Notes'))
        await waitForTooltip()
        await expect(tooltipText()).toBe(text.reorder)
        await expect(descriptionOf(handleOf('Notes'))).toBe(text.reorder)
        await expect(descriptionOf(inputOf('Notes'))).toBe('')
    })
})

describe('The reason a control cannot be used, by keyboard and for a column with none', () => {
    it('the focus on the drag icon of a fixed column opens its reason, and the checkbox of that column has none', async () => {
        await mountTable(REASONS)
        await openMenu()

        await tabTo(inputOf('Name'))
        await expectNoTooltip()
        await userEvent.tab()
        await expect(document.activeElement).toBe(handleOf('Name'))
        await waitForTooltip()
        await expect(descriptionOf(handleOf('Name'))).toBe(REASON_TEXTS.en.reorder)
        await expect(descriptionOf(inputOf('Name'))).toBe('')
    })

    it('the focus on the checkbox of a column that cannot be hidden opens its reason, and the drag icon after it has none', async () => {
        await mountTable(REASONS)
        await openMenu()

        await tabTo(inputOf('Age'))
        await waitForTooltip()
        await expect(descriptionOf(inputOf('Age'))).toBe(REASON_TEXTS.en.unhideable)

        await userEvent.tab()
        await expect(document.activeElement).toBe(handleOf('Age'))
        await expectNoTooltip()
        await expect(descriptionOf(handleOf('Age'))).toBe('')
    })

    it('the reason shows right by its control, above it or, with no room, below it', async () => {
        await mountTable(REASONS)
        await openMenu()

        const gapTo = (control: Element): number => {
            const tooltip = rect(document.querySelector('[role="tooltip"]')!)
            const target = rect(control)

            return Math.min(Math.abs(tooltip.bottom - target.top), Math.abs(tooltip.top - target.bottom))
        }

        await userEvent.hover(handleOf('Notes'))
        await waitForTooltip()
        await settle(150)
        await expect(gapTo(handleOf('Notes'))).toBeLessThanOrEqual(24)

        await closeTooltip()
        await hoverBox('Age')
        await waitForTooltip()
        await settle(150)
        await expect(gapTo(boxOf('Age'))).toBeLessThanOrEqual(24)
    })

    it('a column with no restriction shows no tooltip on either control', async () => {
        await mountTable(REASONS)
        await openMenu()

        await userEvent.hover(boxOf('Role'))
        await expectNoTooltip()
        await userEvent.hover(handleOf('Role'))
        await expectNoTooltip()
        await expect(descriptionOf(inputOf('Role'))).toBe('')
        await expect(descriptionOf(handleOf('Role'))).toBe('')
    })
})

describe('Accessibility of the rows', () => {
    it('each checkbox is named by its column, and none by the check glyph inside it', async () => {
        await mountTable(RESTRICTED)
        await openMenu()

        for (const label of ['Name', 'Role', 'Age', 'Notes']) {
            await expect(inputOf(label)).toHaveAccessibleName(label)
            await expect(inputOf(label).getAttribute('aria-labelledby')).toBe(nameOf(label).id)
        }
    })

    it('the rows are not buttons, and no label wraps a row: only Reset columns is a button in the menu', async () => {
        await mountTable()
        await openMenu()

        // Every `<button>` on the page but the pin in the header: the table has no other, so these are the menu's.
        const buttons = [...document.querySelectorAll<HTMLElement>('button')].filter((button) => button.closest('thead') === null)

        await expect(rowOf('Role').tagName).toBe('DIV')
        await expect(buttons.map((button) => button.textContent?.trim())).toEqual(['Reset columns'])
        for (const label of ['Name', 'Role', 'Age', 'Notes']) {
            const wrapper = inputOf(label).closest('label')!

            // The label around the checkbox holds the checkbox and its box, and not the name, the icon or the row.
            await expect(wrapper.contains(nameOf(label))).toBe(false)
            await expect(wrapper.contains(handleOf(label))).toBe(false)
            await expect(wrapper.contains(rowOf(label))).toBe(false)
        }
    })

    it('every checkbox has a target of at least 24 x 24px (WCAG 2.5.8)', async () => {
        await mountTable(RESTRICTED)
        await openMenu()

        for (const label of ['Name', 'Role', 'Age', 'Notes']) {
            await expect(rect(boxOf(label)).width, `${label}: width`).toBeGreaterThanOrEqual(24)
            await expect(rect(boxOf(label)).height, `${label}: height`).toBeGreaterThanOrEqual(24)
        }
    })

    it('the row looks as it did in an app: 40px tall, the icon at the padding, then the 16px box, then the name', async () => {
        await mountTable()
        await openMenu()

        // As the row was in an app, where the stylesheet reset has taken the browser's own 2px border off its button (in this
        // test page that border is still there, which moves everything 2px).
        const row = rect(rowOf('Role'))
        const box = rect(boxOf('Role').lastElementChild!)

        // The width is the Reset columns action's, not the row's: it is not a whole number, and a row is not wider than it.
        await expect(Math.abs(row.width - 132.2)).toBeLessThan(1)
        await expect(row.height).toBe(40)
        await expect(rect(handleOf('Role')).left - row.left).toBeCloseTo(8, 0)
        await expect(box.width).toBe(16)
        await expect(box.height).toBe(16)
        await expect(box.left - row.left).toBeCloseTo(36, 0)
        await expect(box.top - row.top).toBeCloseTo(12, 0)
        await expect(rect(nameOf('Role')).left - row.left).toBeCloseTo(60, 0)
        // The row fits its place: it does not stick out of the menu (a div sized by its content box would, by its padding).
        await expect(rowOf('Role').scrollWidth).toBeLessThanOrEqual(rowOf('Role').clientWidth)
        await expect(row.right).toBeLessThanOrEqual(rect(rowOf('Role').parentElement!).right + 0.5)
    })
})

describe('Focus and the keyboard', () => {
    it('a click on the row or the name does not take the focus from where it was', async () => {
        await mountTable()
        await openMenu()
        await tabTo(inputOf('Age'))

        await userEvent.click(rowOf('Role'), { position: { x: rect(rowOf('Role')).width - 20, y: 20 } })
        await expect(document.activeElement).toBe(inputOf('Age'))

        await userEvent.click(nameOf('Notes'))
        await expect(document.activeElement).toBe(inputOf('Age'))
    })

    it('a click on the move icon gives it the focus, as it does the checkbox, and changes nothing else', async () => {
        await mountTable()
        await openMenu()
        await tabTo(inputOf('Age'))

        await userEvent.click(handleOf('Role'))

        await expect(document.activeElement).toBe(handleOf('Role'))
        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
    })

    it('a click on the checkbox gives it the focus, and Space then works', async () => {
        await mountTable()
        await openMenu()

        await userEvent.click(boxOf('Role'))
        await expect(document.activeElement).toBe(inputOf('Role'))

        await userEvent.keyboard(' ')
        await waitFor(() => expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes']))
    })

    it('Tab goes through each row (its checkbox, then its drag icon) and on to Reset columns, never into the table body', async () => {
        await mountTable()
        await openMenu()
        const reset = [...document.querySelectorAll<HTMLElement>('button')].find((button) => button.textContent?.trim() === 'Reset columns')!
        const stop = (element: Element): string =>
            element instanceof HTMLInputElement ? 'checkbox' : element.getAttribute('role') === 'button' ? 'drag icon' : element === reset ? 'reset' : element.tagName

        await tabTo(inputOf('Name'))
        const visited: string[] = [stop(document.activeElement!)]

        for (let presses = 0; presses < 12 && document.activeElement !== reset; presses += 1) {
            await userEvent.tab()
            visited.push(stop(document.activeElement!))
            await expect(document.activeElement?.closest('tbody')).toBeNull()
        }

        await expect(visited).toEqual([
            'checkbox', 'drag icon',
            'checkbox', 'drag icon',
            'checkbox', 'drag icon',
            'checkbox', 'drag icon',
            'reset',
        ])
    })
})
