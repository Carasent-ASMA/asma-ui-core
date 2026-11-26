import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount, parkPointer, resolveTokenColor } from 'src/test-utils/renderInteraction'
import { centreOf, fillOf, mouse, settle, space, systemColor, transitionOf } from 'src/test-utils/pressedInteraction'
import { menuItem, people, type Person } from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'

/**
 * ASMA-9003 (Figma Pressed state 47847:229830, pattern-pressed-state) on the table's own controls: the
 * row-action menu item, the select cells and the column-visibility rows of the column settings menu.
 * Asserted on computed styles under trusted (CDP) mouse and keyboard input, so the browser itself sets
 * `:active`. The mouse is always released in `finally` (and again after each test), so a failure cannot
 * leave it held.
 */

const look = (element: Element): { fill: string; text: string } => ({
    fill: fillOf(element),
    text: getComputedStyle(element).color,
})

const boxOf = (root: Element): CSSStyleDeclaration => getComputedStyle(root.querySelector('[class*="_Checkbox_"]')!)

const releaseMouse = async (): Promise<void> => {
    await mouse('mouseReleased', { x: 0, y: 0 })
    await parkPointer()
    cleanup()
}

const COLUMNS: ColumnDef<Person>[] = [
    { accessorKey: 'name', header: 'Name', size: 160 },
    { accessorKey: 'role', header: 'Role', size: 160, enableHiding: false },
]

describe('table row-action menu item pressed state (ASMA-9003)', () => {
    afterEach(releaseMouse)

    const openMenu = async (): Promise<{ edit: HTMLElement; remove: HTMLElement }> => {
        mount(
            <StyledTable<Person>
                locale='en'
                columns={COLUMNS}
                data={people.slice(0, 1)}
                actions={() => [
                    { label: 'Edit', onClick: () => undefined },
                    { label: 'Delete', disabled: true, onClick: () => undefined },
                ]}
            />,
        )
        document.querySelector<HTMLButtonElement>('[data-test="row-actions-button"]')!.click()
        const edit = await waitFor(() => {
            const found = menuItem('Edit')
            if (!found) throw new Error('menu not open')
            return found
        })
        await waitFor(() => expect(document.getAnimations().filter((a) => a.playState === 'running')).toHaveLength(0))
        return { edit, remove: menuItem('Delete')! }
    }

    it('fills a hovered, pressed item gama-200 with a gama-700 label at once, and drops it when dragged off', async () => {
        const { edit } = await openMenu()
        const at = centreOf(edit)

        await mouse('mouseMoved', at)
        await settle(200)
        await expect(look(edit).fill, 'hovered').toBe(resolveTokenColor('--colors-delta-50'))
        try {
            await mouse('mousePressed', at)
            await expect(edit).toHaveAttribute('data-pressed')
            await expect(look(edit)).toEqual({
                fill: resolveTokenColor('--colors-gama-200'),
                text: resolveTokenColor('--colors-gama-700'),
            })
            await expect(getComputedStyle(edit).transitionDuration, 'no transition into pressed').toBe('0s')

            await mouse('mouseMoved', { x: at.x, y: at.y + 200 }, { held: true })
            await expect(edit, 'leaving the row cancels the press').not.toHaveAttribute('data-pressed')
            await expect(transitionOf(edit).timing, 'eases back after the press').toContain('ease-out')
            await settle(300)
            await expect(look(edit).fill, 'eased back once dragged off').not.toBe(resolveTokenColor('--colors-gama-200'))
        } finally {
            await mouse('mouseReleased', { x: at.x, y: at.y + 200 })
        }
    })

    it('shows the pressed look from `data-pressed` alone, where a prevented mousedown leaves no `:active` (Firefox)', async () => {
        const { edit } = await openMenu()

        edit.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'mouse' }))
        await expect(edit.matches(':active')).toBe(false)
        await expect(look(edit).fill).toBe(resolveTokenColor('--colors-gama-200'))
        edit.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, pointerType: 'mouse' }))
        await expect(edit).not.toHaveAttribute('data-pressed')
    })

    it('shows nothing on a disabled item', async () => {
        const { remove } = await openMenu()
        const rest = look(remove)
        const at = centreOf(remove)
        try {
            await mouse('mouseMoved', at)
            await mouse('mousePressed', at)
            await expect(remove).not.toHaveAttribute('data-pressed')
            await expect(look(remove)).toEqual(rest)
        } finally {
            await mouse('mouseReleased', at)
        }
    })
})

describe('table select cell pressed state (ASMA-9003)', () => {
    afterEach(releaseMouse)

    const mountSelectable = (): void => {
        mount(
            <StyledTable<Person>
                locale='en'
                columns={COLUMNS}
                data={people}
                enableRowSelection={(row) => row.original.id !== '3'}
                initialState={{ columnVisibility: { select: true } }}
            />,
        )
    }

    it('turns the box of a pressed row cell and of the select-all cell gama-800 at once', async () => {
        mountSelectable()
        const gama800 = resolveTokenColor('--colors-gama-800')
        const cells = await waitFor(() => {
            const found = [...document.querySelectorAll<HTMLElement>('[role="checkbox"]')]
            if (found.length < 2) throw new Error('select column not rendered')
            return found
        })

        // The select-all cell first: releasing it ticks every row, so the row cell is then pressed ticked.
        for (const cell of [cells[0]!, cells[1]!]) {
            const at = centreOf(cell.querySelector('[class*="_Checkbox_"]')!)
            await mouse('mouseMoved', at)
            try {
                await mouse('mousePressed', at)
                // An unticked box shows the colour on its edge, a ticked or mixed one on its fill.
                const box = boxOf(cell)
                const pressed = cell.getAttribute('aria-checked') === 'false' ? box.borderTopColor : box.backgroundColor
                await expect(pressed, cell.getAttribute('aria-label')!).toBe(gama800)
                await expect(boxOf(cell).transitionProperty, 'no transition into pressed').toBe('none')
            } finally {
                await mouse('mouseReleased', at)
            }
            await expect(boxOf(cell).transitionDuration, 'eases back').toContain('0.15s')
        }
    })

    it('turns the box gama-800 while Space is held, and toggles once on release — never on key repeat', async () => {
        mountSelectable()
        const cell = await waitFor(() => {
            const found = document.querySelector<HTMLElement>('tr[id="1"] [role="checkbox"]')
            if (!found) throw new Error('select column not rendered')
            return found
        })
        cell.focus()
        try {
            await space('keyDown')
            for (let repeat = 0; repeat < 3; repeat += 1) await space('keyDown', { repeat: true })
            await expect(cell).toHaveAttribute('data-pressed', 'key')
            await expect(cell, 'held Space does not toggle yet').toHaveAttribute('aria-checked', 'false')
            await expect(boxOf(cell).borderTopColor).toBe(resolveTokenColor('--colors-gama-800'))
        } finally {
            await space('keyUp')
        }
        await expect(cell).not.toHaveAttribute('data-pressed')
        await expect(cell, 'one toggle per press').toHaveAttribute('aria-checked', 'true')
    })

    it('keeps a held Space press while the pointer moves over and off the cell, then toggles once', async () => {
        mountSelectable()
        const cell = await waitFor(() => {
            const found = document.querySelector<HTMLElement>('tr[id="1"] [role="checkbox"]')
            if (!found) throw new Error('select column not rendered')
            return found
        })
        const at = centreOf(cell)
        cell.focus()
        try {
            await space('keyDown')
            await mouse('mouseMoved', at)
            await mouse('mouseMoved', { x: at.x + 300, y: at.y + 300 })
            await expect(cell, 'pointer leave does not end a Space press').toHaveAttribute('data-pressed', 'key')
            await expect(boxOf(cell).borderTopColor).toBe(resolveTokenColor('--colors-gama-800'))
        } finally {
            await space('keyUp')
        }
        await expect(cell).not.toHaveAttribute('data-pressed')
        await expect(cell, 'one toggle per press').toHaveAttribute('aria-checked', 'true')
    })

    it('shows a Highlight outline in forced colours while Space is held on a focused cell', async () => {
        await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value: 'active' }] })
        try {
            mountSelectable()
            const cell = await waitFor(() => {
                const found = document.querySelector<HTMLElement>('tr[id="1"] [role="checkbox"]')
                if (!found) throw new Error('select column not rendered')
                return found
            })
            cell.focus()
            await expect(getComputedStyle(cell).outlineStyle, 'no press outline at rest').toBe('none')
            try {
                await space('keyDown')
                const style = getComputedStyle(cell)
                await expect([style.outlineStyle, style.outlineColor]).toEqual(['solid', systemColor('Highlight')])
            } finally {
                await space('keyUp')
            }
        } finally {
            await cdp().send('Emulation.setEmulatedMedia', { features: [] })
        }
    })

    it('still toggles a cell on Enter keydown', async () => {
        mountSelectable()
        const cell = await waitFor(() => {
            const found = document.querySelector<HTMLElement>('tr[id="1"] [role="checkbox"]')
            if (!found) throw new Error('select column not rendered')
            return found
        })
        cell.focus()
        await userEvent.keyboard('{Enter}')
        await expect(cell).toHaveAttribute('aria-checked', 'true')
        await expect(cell, 'Enter never presses').not.toHaveAttribute('data-pressed')
    })

    it('shows nothing on a locked row', async () => {
        mountSelectable()
        const locked = await waitFor(() => {
            const found = document.querySelector<HTMLElement>('tr[id="3"] [role="checkbox"]')
            if (!found) throw new Error('locked row not rendered')
            return found
        })
        const rest = boxOf(locked).borderTopColor
        const at = centreOf(locked.querySelector('[class*="_Checkbox_"]')!)
        try {
            await mouse('mouseMoved', at)
            await mouse('mousePressed', at)
            await expect(boxOf(locked).borderTopColor).toBe(rest)
        } finally {
            await mouse('mouseReleased', at)
        }
    })
})

describe('column settings row pressed state (ASMA-9003)', () => {
    afterEach(releaseMouse)

    const openSettings = async (): Promise<void> => {
        mount(<StyledTable<Person> locale='en' columns={COLUMNS} data={people} hideFooter />)
        await settle(150)
        const pin = document.querySelector<HTMLElement>('button[aria-haspopup="true"]')!
        await userEvent.click(pin)
        await waitFor(() => expect(pin.getAttribute('aria-expanded')).toBe('true'))
        await waitFor(() => expect(document.getAnimations().filter((a) => a.playState === 'running')).toHaveLength(0))
        await settle(100)
    }

    const rowOf = (label: string): HTMLElement =>
        [...document.querySelectorAll<HTMLElement>('[class*="table-action-item"]')].find((row) => row.textContent?.includes(label))!

    const rowLook = (row: HTMLElement): { fill: string; name: string; box: string } => ({
        fill: fillOf(row),
        name: getComputedStyle(row.querySelector('span[id]')!).color,
        box: boxOf(row).backgroundColor,
    })

    /** The parts of a row a press can start on: the box, the name and the empty part right of it. */
    const partsOf = (row: HTMLElement): [string, { x: number; y: number }][] => {
        const box = row.getBoundingClientRect()
        return [
            ['box', centreOf(row.querySelector('[data-control="checkbox"]')!)],
            ['name', centreOf(row.querySelector('span[id]')!)],
            ['empty part', { x: box.right - 12, y: box.top + box.height / 2 }],
        ]
    }

    it('fills the whole row gama-200 and turns the name and the box gama-700 at once, wherever on it the press starts', async () => {
        await openSettings()
        const row = rowOf('Name')
        for (const [part, at] of partsOf(row)) {
            await mouse('mouseMoved', at)
            try {
                await mouse('mousePressed', at)
                await expect(row, part).toHaveAttribute('data-pressed', '')
                await expect(rowLook(row), part).toEqual({
                    fill: resolveTokenColor('--colors-gama-200'),
                    name: resolveTokenColor('--colors-gama-700'),
                    box: resolveTokenColor('--colors-gama-700'),
                })
                await expect(getComputedStyle(row).transitionDuration, `${part}: no transition into pressed`).toBe('0s')
            } finally {
                await mouse('mouseReleased', at)
            }
            // The release toggles the column: put it back for the next part.
            await waitFor(() => expect(row.getAttribute('aria-checked')).toBe('false'))
            row.click()
        }
    })

    it('eases back over 150ms ease-out only after a press; hover in and out keep master timing (none)', async () => {
        await openSettings()
        const row = rowOf('Name')
        const [, at] = partsOf(row)[1]!

        await mouse('mouseMoved', at)
        await expect(transitionOf(row).duration, 'hovered: as master').toBe('0s')
        await mouse('mousePressed', at)
        await mouse('mouseReleased', at)
        await expect(row).toHaveAttribute('data-press-released', '')
        await expect(transitionOf(row)).toEqual({ property: 'background-color', duration: '0.15s', timing: 'ease-out' })
        await expect(transitionOf(row.querySelector('span[id]')!)).toEqual({ property: 'color', duration: '0.15s', timing: 'ease-out' })

        await parkPointer()
        await expect(row).not.toHaveAttribute('data-press-released')
        await expect(transitionOf(row).duration, 'at rest: as master').toBe('0s')
        await expect(transitionOf(row.querySelector('span[id]')!).duration, 'name at rest: as master').toBe('0s')
    })

    it('shows the pressed row while Space is held on it (the row is the checkbox), and toggles once on release', async () => {
        await openSettings()
        const row = rowOf('Name')
        row.focus()
        try {
            await space('keyDown')
            await space('keyDown', { repeat: true })
            await expect(row).toHaveAttribute('data-pressed', 'key')
            await expect(rowLook(row).fill).toBe(resolveTokenColor('--colors-gama-200'))
        } finally {
            await space('keyUp')
        }
        await expect(row).toHaveAttribute('data-press-released', '')
        await expect(row.getAttribute('aria-checked')).toBe('false')
    })

    it('shows nothing when the drag handle (a button beside the row) is pressed, or anywhere on a column that cannot be hidden', async () => {
        await openSettings()
        const name = rowOf('Name')
        const role = rowOf('Role')
        for (const [label, row, at] of [
            ['Name, drag handle', name, centreOf(name.closest('li')!.querySelector('button')!)],
            ...partsOf(role).map(([part, at]) => [`Role, ${part}`, role, at] as const),
        ] as const) {
            const rest = rowLook(row)
            await mouse('mouseMoved', at)
            try {
                await mouse('mousePressed', at)
                await expect(row, label).not.toHaveAttribute('data-pressed')
                await expect(rowLook(row).fill, label).not.toBe(resolveTokenColor('--colors-gama-200'))
                await expect(rowLook(row).name, label).toBe(rest.name)
            } finally {
                await mouse('mouseReleased', at)
            }
        }
        await expect(name.getAttribute('aria-checked')).toBe('true')
        await expect(role.getAttribute('aria-checked')).toBe('true')
    })
})
