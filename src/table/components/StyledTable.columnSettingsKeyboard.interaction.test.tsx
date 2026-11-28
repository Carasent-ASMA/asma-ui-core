import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount, parkPointer, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { settle } from 'src/test-utils/pressedInteraction'
import { people, type Person } from 'src/test-utils/tableFixture'
import {
    REASONS,
    RESTRICTED,
    announcement,
    arrowTo,
    handleOf,
    hint,
    hintText,
    isLifted,
    itemOf,
    list,
    mountTable,
    openMenu,
    pin,
    rect,
    resetButton,
    rowOf,
    shown,
    tabTo,
    waitForMenu,
} from 'src/test-utils/columnSettingsMenu'
import { StyledTable } from './StyledTableIndex'

/**
 * Keyboard reordering in the column settings menu (ASMA-8875, UX comment 95823). The table's rule: arrows move inside, Tab
 * enters and leaves, Space activates.
 *
 * | Focus  | Keys                                                                                                 |
 * | ------ | ---------------------------------------------------------------------------------------------------- |
 * | Row    | Space / Enter show or hide the column · Up / Down previous / next row · Right to the handle            |
 * | Handle | Space / Enter lift the column · then Up / Down move it, Space / Enter drop, Escape cancel · Left to the row |
 *
 * Asserted in a real browser with real key presses, so dnd-kit's `KeyboardSensor` (which reads `event.code`) really runs.
 */

/** Lets dnd-kit attach its document listener (it does so a tick after the lift) and the rows settle. */
const step = (): Promise<void> => settle(120)
const press = async (keys: string): Promise<void> => {
    await userEvent.keyboard(keys)
    await step()
}
const isOpen = (): boolean => pin().getAttribute('aria-expanded') === 'true'
const isHintShown = (): boolean => getComputedStyle(hint()).display !== 'none'

beforeEach(async () => {
    localStorage.clear()
    await parkPointer()
})
afterEach(cleanup)

describe('Opening and moving around the menu', () => {
    it('Enter on the pin opens the menu with the focus on its first row; a click leaves the focus on the pin', async () => {
        await mountTable()
        pin().focus()
        await userEvent.keyboard('{Enter}')
        await waitForMenu()
        await expect(document.activeElement).toBe(rowOf('Name'))

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(isOpen()).toBe(false))
        await expect(document.activeElement).toBe(pin())

        await openMenu()
        await expect(document.activeElement).toBe(pin())
    })

    it('Up and Down go row to row and wrap at the ends; Home and End go to the first and last row', async () => {
        await mountTable()
        await openMenu()
        await tabTo(rowOf('Name'))

        const visited: string[] = []
        for (const key of ['{ArrowDown}', '{ArrowDown}', '{ArrowDown}', '{ArrowDown}', '{ArrowUp}', '{End}', '{Home}']) {
            await userEvent.keyboard(key)
            visited.push(document.activeElement?.textContent?.trim() ?? '')
        }

        await expect(visited).toEqual(['Role', 'Age', 'Notes', 'Name', 'Notes', 'Notes', 'Name'])
    })

    it('Right goes from a row to its handle and Left back; Right on a handle and Left on a row stay put', async () => {
        await mountTable()
        await openMenu()
        await arrowTo('Role')

        await userEvent.keyboard('{ArrowLeft}')
        await expect(document.activeElement).toBe(rowOf('Role'))
        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(handleOf('Role'))
        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement).toBe(handleOf('Role'))
        await userEvent.keyboard('{ArrowLeft}')
        await expect(document.activeElement).toBe(rowOf('Role'))
    })

    it('Up and Down from a handle go to the next row itself, not to its handle', async () => {
        await mountTable()
        await openMenu()
        await arrowTo('Role')

        await userEvent.keyboard('{ArrowRight}{ArrowDown}')
        await expect(document.activeElement).toBe(rowOf('Age'))
        await userEvent.keyboard('{ArrowRight}{ArrowUp}')
        await expect(document.activeElement).toBe(rowOf('Role'))
    })

    it('the menu keeps one Tab stop, where the focus last was: Shift+Tab from Reset columns goes back to it', async () => {
        await mountTable()
        await openMenu()
        await arrowTo('Age')
        await userEvent.keyboard('{ArrowRight}')

        await userEvent.tab()
        await expect(document.activeElement).toBe(resetButton())
        await userEvent.tab({ shift: true })
        await expect(document.activeElement).toBe(handleOf('Age'))
        await expect([...list().querySelectorAll('[tabindex="0"]')]).toEqual([handleOf('Age')])
    })

    it('a row shows the focus bar while the keyboard is on the row or on its handle, and the handle adds Figma’s focus ring', async () => {
        await mountTable()
        await openMenu()
        const focusRing = resolveTokenColor('--colors-focus-ring')
        await arrowTo('Role')

        await expect(getComputedStyle(rowOf('Role')).boxShadow).toBe(`${focusRing} 3px 0px 0px 0px inset`)
        await expect(getComputedStyle(handleOf('Role')).boxShadow, 'handle at rest').toBe('none')

        await userEvent.keyboard('{ArrowRight}')
        await expect(getComputedStyle(rowOf('Role')).boxShadow, 'on the handle').toBe(`${focusRing} 3px 0px 0px 0px inset`)
        // Figma Button Quaternary, State=Focused: a 3px border/focus stroke inside, radius 4.
        const handle = getComputedStyle(handleOf('Role'))
        await expect({ ring: handle.boxShadow, radius: handle.borderRadius, outline: handle.outlineStyle }).toEqual({
            ring: `${focusRing} 0px 0px 0px 3px inset`,
            radius: '4px',
            outline: 'none',
        })

        await userEvent.keyboard('{ArrowDown}')
        await expect(getComputedStyle(rowOf('Role')).boxShadow, 'the row left').toBe('none')
    })
})

describe('Lifting, moving and dropping a column from its handle', () => {
    it('Space lifts, Down moves, Space drops: the column moves, the focus goes to its row, and each step is announced', async () => {
        await mountTable()
        await openMenu()
        await arrowTo('Role')
        await press('{ArrowRight}')

        await press(' ')
        await expect(isLifted('Role')).toBe(true)
        await expect(announcement()).toBe('Picked up Role. Position 2 of 4.')
        await expect(document.activeElement).toBe(handleOf('Role'))

        await press('{ArrowDown}')
        await expect(announcement()).toBe('Position 3 of 4.')
        // Up and Down move the column now, not the focus.
        await expect(document.activeElement).toBe(handleOf('Role'))

        await press(' ')
        await settle(150)
        await expect(isLifted('Role')).toBe(false)
        await waitFor(() => expect(shown()).toEqual(['Name', 'Age', 'Role', 'Notes']))
        await expect(announcement()).toBe('Dropped Role at position 3 of 4.')
        await expect(document.activeElement).toBe(rowOf('Role'))
        await expect(isOpen()).toBe(true)
    })

    it('Enter lifts and drops too, and Up moves a column up', async () => {
        await mountTable()
        await openMenu()
        await arrowTo('Notes')
        await press('{ArrowRight}')

        await press('{Enter}')
        await press('{ArrowUp}')
        await expect(announcement()).toBe('Position 3 of 4.')
        await press('{ArrowUp}')
        await press('{Enter}')

        await waitFor(() => expect(shown()).toEqual(['Name', 'Notes', 'Role', 'Age']))
        await expect(document.activeElement).toBe(rowOf('Notes'))
    })

    it('Escape puts the column back where it was and keeps the menu open; a second Escape closes the menu', async () => {
        await mountTable()
        await openMenu()
        await arrowTo('Role')
        await press('{ArrowRight}')

        await press(' ')
        await press('{ArrowDown}')
        await press('{ArrowDown}')
        await press('{Escape}')
        await settle(150)

        await expect(isLifted('Role')).toBe(false)
        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
        await expect(announcement()).toBe('Reordering cancelled. Role is back at position 2 of 4.')
        await expect(isOpen()).toBe(true)
        await expect(document.activeElement).toBe(handleOf('Role'))

        await press('{Escape}')
        await waitFor(() => expect(isOpen()).toBe(false))
        await expect(document.activeElement).toBe(pin())
    })

    it('Tab drops a lifted column where it is, and the focus stays in the menu on its row', async () => {
        await mountTable()
        await openMenu()
        await arrowTo('Role')
        await press('{ArrowRight}')

        await press(' ')
        await press('{ArrowDown}')
        await userEvent.tab()
        await step()

        await waitFor(() => expect(shown()).toEqual(['Name', 'Age', 'Role', 'Notes']))
        await expect(isOpen()).toBe(true)
        await expect(document.activeElement).toBe(rowOf('Role'))
    })

    it('the lifted row is raised, with no line where it will land (it stands there itself), and the focus bar stays', async () => {
        await mountTable()
        await openMenu()
        await arrowTo('Role')
        await press('{ArrowRight}')
        await press(' ')
        await press('{ArrowDown}')

        // No separator: the lifted row itself shows where the column will land.
        await expect(getComputedStyle(itemOf('Role'), '::after').content).toBe('none')
        await expect(getComputedStyle(itemOf('Role'), '::before').content).toBe('none')
        await expect(itemOf('Role').getAttribute('data-lifted')).toBe('keyboard')
        await expect(getComputedStyle(itemOf('Role')).boxShadow).not.toBe('none')
        // Which row you are on stays marked while it is lifted; the handle, which has the focus, keeps its ring.
        await expect(getComputedStyle(rowOf('Role')).boxShadow).toBe(`${resolveTokenColor('--colors-focus-ring')} 3px 0px 0px 0px inset`)
        await expect(getComputedStyle(handleOf('Role')).boxShadow).toContain('3px inset')
        await press('{Escape}')
    })

    it('a lifted column never moves over a fixed one: Up from under a fixed first row, Down from over a fixed last row, it stays put', async () => {
        await mountTable(REASONS)
        await openMenu()
        const nameTop = rect(itemOf('Name')).top

        await arrowTo('Role')
        await press('{ArrowRight}')
        const roleTop = rect(itemOf('Role')).top
        await press(' ')
        await press('{ArrowUp}')
        await press('{ArrowUp}')
        await expect(rect(itemOf('Role')).top, 'Role stays under Name').toBeCloseTo(roleTop, 0)
        await expect(rect(itemOf('Name')).top, 'Name stays first').toBeCloseTo(nameTop, 0)
        await press('{Escape}')

        // Age is third of four, over Notes, which is fixed on the right.
        await press('{ArrowDown}{ArrowRight}')
        await expect(document.activeElement).toBe(handleOf('Age'))
        const ageTop = rect(itemOf('Age')).top
        await press(' ')
        await press('{ArrowDown}')
        await expect(rect(itemOf('Age')).top, 'Age stays over Notes').toBeCloseTo(ageTop, 0)
        await press(' ')
        await settle(150)
        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
    })

    it('a fixed column does not lift, and nothing moves past it', async () => {
        await mountTable(RESTRICTED)
        await openMenu()
        await tabTo(rowOf('Name'))
        await press('{ArrowRight}')

        await press(' ')
        await expect(isLifted('Name')).toBe(false)
        await expect(announcement()).toBe('')

        await press('{ArrowDown}{ArrowRight}')
        await press(' ')
        await press('{ArrowUp}')
        await press(' ')
        await settle(150)

        await expect(shown()).toEqual(['Name', 'Role', 'Age', 'Notes'])
        await expect(announcement()).toBe('Dropped Role at position 2 of 4.')
    })
})

describe('Telling the keyboard user what the keys do', () => {
    it('the handle is named by its column and described by the lifting instructions (UX comment 95952); a fixed column’s handle is not described', async () => {
        await mountTable(RESTRICTED)
        await openMenu()
        const description = (control: Element): string =>
            (control.getAttribute('aria-describedby') ?? '')
                .split(/\s+/)
                .map((id) => document.getElementById(id)?.textContent ?? '')
                .join(' ')
                .trim()

        await expect(handleOf('Role')).toHaveAccessibleName('Reorder Role')
        await expect(description(handleOf('Role'))).toBe(
            'Press Space to pick up, then arrow keys to move. Press Space again to drop, or Escape to cancel.',
        )
        await expect(handleOf('Role')).toHaveAccessibleDescription(
            'Press Space to pick up, then arrow keys to move. Press Space again to drop, or Escape to cancel.',
        )
        await expect(handleOf('Name').hasAttribute('aria-describedby')).toBe(false)
    })

    it('the footer hint names only the key that works where the keyboard is: → on a row, Space on its handle, the move keys while lifted (UX comment 95952)', async () => {
        await mountTable()
        await openMenu()

        await expect(isHintShown(), 'at rest').toBe(false)
        await arrowTo('Role')
        await expect(isHintShown(), 'on a row').toBe(true)
        await expect(hintText()).toBe('→ to reorder')

        await press('{ArrowRight}')
        await expect(isHintShown(), 'on a handle').toBe(true)
        await expect(hintText()).toBe('Space to lift')

        await press(' ')
        await expect(hintText()).toBe('↕ move · Space drop · Esc cancel')
        await press('{Escape}')
        await expect(hintText()).toBe('Space to lift')

        await press('{ArrowLeft}')
        await expect(hintText(), 'back on the row').toBe('→ to reorder')
        await press('{ArrowDown}')
        await expect(hintText(), 'the next row').toBe('→ to reorder')
        // It is visual only: a screen reader has the instructions and the live region.
        await expect(hint().getAttribute('aria-hidden')).toBe('true')
    })

    it('a fixed column’s row and handle show no hint: it does not move, so no key would work', async () => {
        await mountTable(RESTRICTED)
        await openMenu()
        await tabTo(rowOf('Name'))
        await expect(isHintShown(), 'fixed row').toBe(false)

        await press('{ArrowRight}')
        await expect(document.activeElement).toBe(handleOf('Name'))
        await expect(isHintShown(), 'fixed handle').toBe(false)

        // Age cannot be hidden but can move: its row shows the hint.
        await press('{ArrowDown}{ArrowDown}')
        await expect(document.activeElement).toBe(rowOf('Age'))
        await expect(isHintShown(), 'movable row').toBe(true)
    })

    it('a mouse click on a handle shows no hint', async () => {
        await mountTable()
        await openMenu()

        await userEvent.click(handleOf('Role'))

        await expect(document.activeElement).toBe(handleOf('Role'))
        await expect(isHintShown()).toBe(false)
    })

    it('in Norwegian: the handle’s name, the announcements and the hint', async () => {
        await mountTable(undefined, 'no')
        await openMenu()
        await arrowTo('Role')

        await expect(handleOf('Role')).toHaveAccessibleName('Flytt Role')
        await expect(handleOf('Role')).toHaveAccessibleDescription(
            'Trykk mellomrom for å plukke opp, og bruk deretter piltastene for å flytte. Trykk mellomrom igjen for å slippe, eller Escape for å avbryte.',
        )
        await expect(hintText()).toBe('→ for å flytte')
        await press('{ArrowRight}')
        await expect(hintText()).toBe('Mellomrom for å plukke opp')
        await press(' ')
        await expect(announcement()).toBe('Plukket opp Role. Posisjon 2 av 4.')
        await expect(hintText()).toBe('↕ flytt · Mellomrom slipp · Esc avbryt')
        await press('{ArrowDown}')
        await expect(announcement()).toBe('Posisjon 3 av 4.')
        await press(' ')
        await expect(announcement()).toBe('Slapp Role på posisjon 3 av 4.')
    })
})

describe('The footer stays pinned under a long list', () => {
    const MANY: ColumnDef<Person>[] = Array.from({ length: 10 }, (_, index) => ({
        id: `c${index}`,
        header: `Column ${index + 1}`,
        size: 100,
    }))

    it('the list scrolls on its own and Reset columns stays in view below it', async () => {
        mount(<StyledTable<Person> columns={MANY} data={people} hideFooter />)
        await settle(150)
        await openMenu()
        const paper = list().closest<HTMLElement>('[class*="rounded"]')!

        await expect(list().scrollHeight).toBeGreaterThan(list().clientHeight)
        await expect(rect(list()).height).toBeCloseTo(280, 0)
        await expect(rect(resetButton()).bottom).toBeLessThanOrEqual(rect(paper).bottom)
        await expect(rect(resetButton()).top).toBeGreaterThanOrEqual(rect(list()).bottom - 0.5)

        await tabTo(rowOf('Column 1'))
        await userEvent.keyboard('{End}')
        await expect(document.activeElement).toBe(rowOf('Column 10'))
        // The focused row is scrolled into the list's view, and the footer has not moved.
        await expect(rect(rowOf('Column 10')).bottom).toBeLessThanOrEqual(rect(list()).bottom + 0.5)
        await expect(rect(resetButton()).top).toBeGreaterThanOrEqual(rect(list()).bottom - 0.5)
    })
})
