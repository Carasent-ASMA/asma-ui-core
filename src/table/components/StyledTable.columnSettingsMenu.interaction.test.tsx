import { afterEach, beforeEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, parkPointer, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { centreOf, mouse, settle } from 'src/test-utils/pressedInteraction'
import {
    REASONS,
    RESTRICTED,
    arrowTo,
    boxOf,
    dragRow,
    handleOf,
    iconOf,
    isChecked,
    isLifted,
    itemOf,
    list,
    mountTable,
    nameOf,
    openMenu,
    pressAndMove,
    rect,
    resetButton,
    rowOf,
    shown,
    tabTo,
} from 'src/test-utils/columnSettingsMenu'

/**
 * The column settings menu (the pin) shows or hides a column from anywhere on its row, as Figma's checkbox Menus item: the
 * row is the column's checkbox, a `menuitemcheckbox` (ASMA-9003 round 5, which widened ASMA-8597's checkbox-only target to
 * the whole row; ASMA-8875 made the row the control itself). The drag handle is a button of its own beside the row: a click
 * on it, and a press and release on it that never became a drag, leave the column as it is (ASMA-8597). Reordering by
 * dragging the handle is as it was. The keyboard model is in `StyledTable.columnSettingsKeyboard.interaction.test.tsx`.
 *
 * Asserted in a real browser. The drags use the trusted mouse events a user's mouse makes (the Chrome DevTools protocol), so
 * dnd-kit's `PointerSensor` (8px activation distance) really activates or really does not.
 */

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
 * none. (The handle is described by its lifting instructions too, which are not a reason.)
 */
const descriptionOf = (control: Element): string =>
    (control.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter(Boolean)
        .map((id) => document.getElementById(id))
        .filter((described) => described?.getAttribute('role') === 'tooltip')
        .map((described) => described?.textContent ?? '')
        .join(' ')
/** A read-only box takes no pointer events, so the hover is forced onto where it is. */
const hoverBox = (label: string): Promise<void> => userEvent.hover(boxOf(label), { force: true })

beforeEach(async () => {
    localStorage.clear()
    await parkPointer()
})
afterEach(cleanup)

describe('A column is shown or hidden from anywhere on its row, but never from its drag handle', () => {
    it('a click on the empty part of the row hides the column, and a second click shows it', async () => {
        await mountTable()
        await openMenu()
        const emptyPart = { position: { x: rect(rowOf('Role')).width - 20, y: 20 } }

        await userEvent.click(rowOf('Role'), emptyPart)
        await waitFor(() => expect(shown()).toEqual(['Name', 'Age', 'Notes']))
        await expect(isChecked('Role')).toBe(false)

        await userEvent.click(rowOf('Role'), emptyPart)
        await waitFor(() => expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes']))
        await expect(isChecked('Role')).toBe(true)
    })

    it('a click on the name hides the column', async () => {
        await mountTable()
        await openMenu()

        await userEvent.click(nameOf('Role'))

        await waitFor(() => expect(shown()).toEqual(['Name', 'Age', 'Notes']))
    })

    it('a click on the handle leaves the column as it is', async () => {
        await mountTable()
        await openMenu()

        await userEvent.click(handleOf('Role'))
        await settle(60)

        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
    })

    it('a press and release on the handle that never became a drag (3px, under the 8px activation distance) leaves the column as it is', async () => {
        await mountTable()
        await openMenu()

        await pressAndMove('Role', 3)

        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
    })

    it('a short drag of the handle (7px, still under the activation distance) leaves the column as it is, and does not reorder', async () => {
        await mountTable()
        await openMenu()

        await pressAndMove('Role', 7)

        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
    })

    it('a click on the box hides the column, and a second click shows it', async () => {
        await mountTable()
        await openMenu()

        await userEvent.click(boxOf('Role'))
        await waitFor(() => expect(shown()).toEqual(['Name', 'Age', 'Notes']))
        await expect(isChecked('Role')).toBe(false)

        await userEvent.click(boxOf('Role'))
        await waitFor(() => expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes']))
        await expect(isChecked('Role')).toBe(true)
    })

    it('Space and Enter on the focused row each hide and show the column, and the focus stays on the row', async () => {
        await mountTable()
        await openMenu()
        await arrowTo('Role')

        await userEvent.keyboard(' ')
        await waitFor(() => expect(shown()).toEqual(['Name', 'Age', 'Notes']))
        await expect(document.activeElement).toBe(rowOf('Role'))

        await userEvent.keyboard(' ')
        await waitFor(() => expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes']))

        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(shown()).toEqual(['Name', 'Age', 'Notes']))
        await expect(isChecked('Role')).toBe(false)

        await userEvent.keyboard('{Enter}')
        await waitFor(() => expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes']))
        await expect(document.activeElement).toBe(rowOf('Role'))
    })
})

describe('Reordering by dragging the handle is as it was', () => {
    it('a drag of the handle down to another row reorders the columns, and hides none', async () => {
        await mountTable()
        await openMenu()

        await dragRow('Role', 'Notes')

        await waitFor(() => expect(shown()).toEqual(['Name', 'Age', 'Notes', 'Role']))
        // The drag ends with a release over the handle, which must not count as a click on anything.
        await expect(isChecked('Role')).toBe(true)
        await expect(shown()).toHaveLength(4)
    })

    it('a drag of the handle up reorders too, and the column stays shown', async () => {
        await mountTable()
        await openMenu()

        await dragRow('Notes', 'Name')

        await waitFor(() => expect(shown()).toEqual(['Notes', 'Name', 'Role', 'Age']))
        await expect(isChecked('Notes')).toBe(true)
    })

    it('a drag starts after 8px of movement and not before (the PointerSensor activation distance), and looks as it always did: no shadow, no landing line', async () => {
        await mountTable()
        await openMenu()
        const { x, y } = centreOf(handleOf('Role'))

        await mouse('mouseMoved', { x, y })
        await mouse('mousePressed', { x, y })
        await mouse('mouseMoved', { x, y: y + 4 }, { held: true })
        await mouse('mouseMoved', { x, y: y + 7 }, { held: true })
        await settle(80)
        await expect(isLifted('Role')).toBe(false)

        await mouse('mouseMoved', { x, y: y + 12 }, { held: true })
        await settle(80)
        await expect(isLifted('Role')).toBe(true)
        await expect(itemOf('Role').getAttribute('data-lifted')).toBe('pointer')
        // Figma draws no drag state: the raised look and the landing line are the keyboard's only (ASMA-8875).
        await expect(getComputedStyle(itemOf('Role')).boxShadow).toBe('none')

        await mouse('mouseMoved', { x, y: y + 52 }, { held: true })
        await settle(120)
        await expect(itemOf('Role').hasAttribute('data-drop-edge')).toBe(false)
        await expect(getComputedStyle(itemOf('Role'), '::after').content).toBe('none')
        await mouse('mouseMoved', { x, y: y + 12 }, { held: true })
        await settle(120)

        await mouse('mouseReleased', { x, y: y + 12 })
        await settle(250)
        await expect(isLifted('Role')).toBe(false)
        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
    })

    it('a fixed column cannot be dragged, and it stays shown', async () => {
        await mountTable(RESTRICTED)
        await openMenu()
        await expect(handleOf('Name').getAttribute('aria-disabled')).toBe('true')

        await dragRow('Name', 'Notes')
        await settle(60)

        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
    })

    it('a column cannot be dragged onto a fixed one', async () => {
        await mountTable(RESTRICTED)
        await openMenu()

        await dragRow('Role', 'Name')
        await settle(60)

        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
    })
})

describe('A column that cannot be hidden', () => {
    it('keeps its column when its row, its name or its box is clicked, and says so (aria-readonly)', async () => {
        await mountTable(RESTRICTED)
        await openMenu()
        await expect(rowOf('Age').getAttribute('aria-readonly')).toBe('true')
        // It looks read only: the default cursor on the row, where an editable row shows the pointer.
        await expect(getComputedStyle(rowOf('Age')).cursor).toBe('default')
        await expect(getComputedStyle(rowOf('Role')).cursor).toBe('pointer')

        await userEvent.click(rowOf('Age'), { position: { x: rect(rowOf('Age')).width - 20, y: 20 } })
        await userEvent.click(nameOf('Age'))
        // A read-only box takes no pointer events, so the click is forced to land where the box is.
        await userEvent.click(boxOf('Age'), { force: true })
        await settle(60)

        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
        await expect(isChecked('Age')).toBe(true)
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

    it('a fixed column: its handle says why it cannot be moved, and its row says nothing', async () => {
        await mountTable(REASONS, locale)
        await openMenu()

        await userEvent.hover(handleOf('Name'))
        await waitForTooltip()
        await expect(tooltipText()).toBe(text.reorder)
        await expect(descriptionOf(handleOf('Name'))).toBe(text.reorder)
        await expect(descriptionOf(rowOf('Name'))).toBe('')

        await closeTooltip()
        await hoverBox('Name')
        await expectNoTooltip()
        await expect(descriptionOf(rowOf('Name'))).toBe('')
    })

    it('a column that cannot be hidden but is not fixed: its row says so without calling it fixed, its handle says nothing', async () => {
        await mountTable(REASONS, locale)
        await openMenu()

        await hoverBox('Age')
        await waitForTooltip()
        await expect(tooltipText()).toBe(text.unhideable)
        await expect(descriptionOf(rowOf('Age'))).toBe(text.unhideable)
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
        await expect(descriptionOf(rowOf('Notes'))).toBe(text.hidden)
        await expect(descriptionOf(handleOf('Notes'))).toBe('')

        await closeTooltip()
        await userEvent.hover(handleOf('Notes'))
        await waitForTooltip()
        await expect(tooltipText()).toBe(text.reorder)
        await expect(descriptionOf(handleOf('Notes'))).toBe(text.reorder)
        await expect(descriptionOf(rowOf('Notes'))).toBe('')
    })
})

describe('The reason a control cannot be used, by keyboard and for a column with none', () => {
    it('the focus on the handle of a fixed column opens its reason, and the row of that column has none', async () => {
        await mountTable(REASONS)
        await openMenu()

        await tabTo(rowOf('Name'))
        await expectNoTooltip()
        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(handleOf('Name'))
        await waitForTooltip()
        await expect(descriptionOf(handleOf('Name'))).toBe(REASON_TEXTS.en.reorder)
        await expect(descriptionOf(rowOf('Name'))).toBe('')
    })

    it('the focus on the row of a column that cannot be hidden opens its reason, and its handle has none', async () => {
        await mountTable(REASONS)
        await openMenu()

        await arrowTo('Age')
        await waitForTooltip()
        await expect(descriptionOf(rowOf('Age'))).toBe(REASON_TEXTS.en.unhideable)

        await userEvent.keyboard('{ArrowRight}')
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
        await expect(gapTo(rowOf('Age'))).toBeLessThanOrEqual(24)
    })

    it('a column with no restriction shows no tooltip on either control', async () => {
        await mountTable(REASONS)
        await openMenu()

        await userEvent.hover(boxOf('Role'))
        await expectNoTooltip()
        await userEvent.hover(handleOf('Role'))
        await expectNoTooltip()
        await expect(descriptionOf(rowOf('Role'))).toBe('')
        await expect(descriptionOf(handleOf('Role'))).toBe('')
    })
})

describe('Accessibility of the rows', () => {
    it('each row is named by its column, and none by the check glyph inside it; each handle is named "Reorder" and its column', async () => {
        await mountTable(RESTRICTED)
        await openMenu()

        for (const label of ['Name', 'Role', 'Age', 'Notes']) {
            await expect(rowOf(label)).toHaveAccessibleName(label)
            await expect(rowOf(label).getAttribute('aria-labelledby')).toBe(nameOf(label).id)
            await expect(handleOf(label)).toHaveAccessibleName(`Reorder ${label}`)
        }
    })

    it('the list is a menu of checkbox rows, each with its handle beside it and nothing nested; only Reset columns is a button outside it', async () => {
        await mountTable()
        await openMenu()

        await expect(list()).toHaveAccessibleName('Column settings')
        // Every `<button>` on the page but the pin in the header and the handles in the menu.
        const buttons = [...document.querySelectorAll<HTMLElement>('button')].filter(
            (button) => button.closest('thead') === null && button.closest('[role="menu"]') === null,
        )
        await expect(buttons.map((button) => button.textContent?.trim())).toEqual(['Reset columns'])

        for (const [index, label] of ['Name', 'Role', 'Age', 'Notes'].entries()) {
            const row = rowOf(label)

            await expect(row.getAttribute('role'), label).toBe('menuitemcheckbox')
            await expect(row.getAttribute('aria-checked'), label).toBe('true')
            await expect(handleOf(label).getAttribute('role'), label).toBe('menuitem')
            await expect(itemOf(label).getAttribute('role'), label).toBe('none')
            // Two controls side by side: neither holds a control of its own.
            await expect(row.querySelector('button, input, label, [tabindex]'), label).toBeNull()
            await expect(row.contains(handleOf(label)), label).toBe(false)
            // Both say where the column stands: "2 of 4".
            for (const control of [row, handleOf(label)]) {
                await expect(control.getAttribute('aria-posinset'), label).toBe(String(index + 1))
                await expect(control.getAttribute('aria-setsize'), label).toBe('4')
            }
            // The box is drawn only: the row is the one checkbox a screen reader meets.
            await expect(boxOf(label).getAttribute('aria-hidden'), label).toBe('true')
        }
    })

    it('the target of every row is its whole row, and the handle is a 24 x 24px target (WCAG 2.5.8)', async () => {
        await mountTable(RESTRICTED)
        await openMenu()

        for (const label of ['Name', 'Role', 'Age', 'Notes']) {
            await expect(rect(rowOf(label)).width, `${label}: width`).toBeGreaterThanOrEqual(24)
            await expect(rect(rowOf(label)).height, `${label}: height`).toBe(40)
            await expect(rect(handleOf(label)).width, `${label}: handle width`).toBe(24)
            await expect(rect(handleOf(label)).height, `${label}: handle height`).toBe(24)
        }
    })

    it('the row looks as it did in an app: 40px tall, the icon at the padding, then the 16px box, then the name', async () => {
        await mountTable()
        await openMenu()

        const row = rect(rowOf('Role'))
        const box = rect(boxOf('Role').lastElementChild!)

        // The core Reset columns button adds 8px of side padding in ASMA-8137; it sets the menu width.
        await expect(Math.abs(row.width - 140.2)).toBeLessThan(1)
        await expect(row.height).toBe(40)
        await expect(rect(iconOf('Role')).left - row.left).toBeCloseTo(8, 0)
        await expect(rect(iconOf('Role')).top - row.top).toBeCloseTo(10, 0)
        await expect(box.width).toBe(16)
        await expect(box.height).toBe(16)
        await expect(box.left - row.left).toBeCloseTo(36, 0)
        await expect(box.top - row.top).toBeCloseTo(12, 0)
        await expect(rect(nameOf('Role')).left - row.left).toBeCloseTo(60, 0)
        // The row fits its place: it does not stick out of the menu (a row sized by its content box would, by its padding).
        await expect(rowOf('Role').scrollWidth).toBeLessThanOrEqual(rowOf('Role').clientWidth)
        await expect(row.right).toBeLessThanOrEqual(rect(itemOf('Role')).right + 0.5)
    })
})

describe('Focus and the pointer', () => {
    it('a click on the row or the name gives that row the focus, and Space then works', async () => {
        await mountTable()
        await openMenu()

        await userEvent.click(rowOf('Role'), { position: { x: rect(rowOf('Role')).width - 20, y: 20 } })
        await expect(document.activeElement).toBe(rowOf('Role'))
        await waitFor(() => expect(shown()).toEqual(['Name', 'Age', 'Notes']))

        await userEvent.keyboard(' ')
        await waitFor(() => expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes']))

        await userEvent.click(nameOf('Notes'))
        await expect(document.activeElement).toBe(rowOf('Notes'))
    })

    it('the keyboard focus on a row shows the menu items’ 3px focus bar, and none at rest or after a click', async () => {
        await mountTable()
        await openMenu()
        const focusRing = resolveTokenColor('--colors-focus-ring')

        await expect(getComputedStyle(rowOf('Role')).boxShadow, 'at rest').toBe('none')
        await arrowTo('Role')
        await expect(getComputedStyle(rowOf('Role')).boxShadow).toBe(`${focusRing} 3px 0px 0px 0px inset`)
        await expect(getComputedStyle(rowOf('Name')).boxShadow, 'the row left').toBe('none')

        await userEvent.click(nameOf('Age'))
        await expect(getComputedStyle(rowOf('Age')).boxShadow, 'clicked').toBe('none')
    })

    it('a click on the handle gives it the focus, and changes nothing else', async () => {
        await mountTable()
        await openMenu()

        await userEvent.click(handleOf('Role'))

        await expect(document.activeElement).toBe(handleOf('Role'))
        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
    })

    it('a click on the box gives the row the focus, and Space then works', async () => {
        await mountTable()
        await openMenu()

        await userEvent.click(boxOf('Role'))
        await expect(document.activeElement).toBe(rowOf('Role'))

        await userEvent.keyboard(' ')
        await waitFor(() => expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes']))
    })

    it('Tab stops once in the list (its row) and then at Reset columns, never in the table body', async () => {
        await mountTable()
        await openMenu()
        const stop = (element: Element): string =>
            element.getAttribute('role') === 'menuitemcheckbox' ? 'row' : element === resetButton() ? 'reset' : element.tagName

        await tabTo(rowOf('Name'))
        const visited: string[] = [stop(document.activeElement!)]
        await userEvent.tab()
        visited.push(stop(document.activeElement!))

        await expect(visited).toEqual(['row', 'reset'])
        await expect(document.activeElement?.closest('tbody')).toBeNull()
    })
})
