import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, describe, it } from 'vitest'
import { expect, fn, userEvent, waitFor, within } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { menuItem, row, rowActionsTrigger } from 'src/test-utils/tableFixture'
import { StyledTable } from './StyledTableIndex'
import type { StyledTableProps } from '../types'

/**
 * ASMA-8875, round 2: the context-menu key and Shift+F10 open the focused row's ⋮, from the row or any control in it.
 *
 * Two paths, either alone or both: the keydown, and the `contextmenu` event a keyboard starts. This Chromium (macOS)
 * fires `contextmenu` on the Menu key's keydown, and nothing for Shift+F10. Windows sends it on the Menu key's keyup and
 * for Shift+F10, whatever the keydown did — that path is simulated here with a synthetic keyboard `contextmenu` (a
 * `PointerEvent` with an empty `pointerType`, as Chromium 125+ makes it). **A real Windows run was not possible here.**
 */

interface Row {
    id: string
    name: string
}

const data: Row[] = [
    { id: 'r-1', name: 'First' },
    { id: 'r-2', name: 'Second' },
]
const columns: ColumnDef<Row>[] = [{ accessorKey: 'name', header: 'Name' }]

const mountRows = (props: Partial<Omit<StyledTableProps<Row, Record<string, unknown>>, 'footer'>> = {}): void => {
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
                actions={() => [
                    { label: 'Edit', onClick: () => undefined },
                    { label: 'Delete', onClick: () => undefined },
                ]}
                {...props}
            />
        </div>,
    )
}

const menus = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[role="menu"]')]

/** A `contextmenu` as a keyboard starts it (`pointerType` empty), or as a mouse right-click does. */
const contextMenuEvent = (source: 'keyboard' | 'mouse'): MouseEvent =>
    new PointerEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerType: source === 'mouse' ? 'mouse' : '',
        button: source === 'mouse' ? 2 : 0,
    })

/** Every `contextmenu` that reaches the document, and whether something prevented it. */
const watchContextMenus = (): { events: MouseEvent[]; stop: () => void } => {
    const events: MouseEvent[] = []
    const record = (event: MouseEvent): void => {
        events.push(event)
    }

    document.addEventListener('contextmenu', record)

    return { events, stop: () => document.removeEventListener('contextmenu', record) }
}

describe('ASMA-8875 the context-menu key opens the row ⋮', () => {
    afterEach(cleanup)

    it('the context-menu key on the row opens its ⋮ on the first item, and no browser menu opens', async () => {
        mountRows()
        row('r-2').focus()

        const watched = watchContextMenus()

        try {
            await userEvent.keyboard('{ContextMenu}')
            await waitFor(() => expect(document.activeElement).toBe(menuItem('Edit')))
            await expect(rowActionsTrigger('r-2')).toHaveAttribute('aria-expanded', 'true')
            // The keydown was taken, so this Chromium sent no `contextmenu` at all (it does for an untaken one, below).
            await expect(watched.events).toHaveLength(0)
        } finally {
            watched.stop()
        }

        await userEvent.keyboard('{Escape}')
        await waitFor(() => expect(document.activeElement).toBe(rowActionsTrigger('r-2')))
    })

    it('Shift+F10 on a control in the row opens the ⋮ too', async () => {
        mountRows()
        row('r-1').focus()
        await userEvent.keyboard('{ArrowRight}')
        await expect(document.activeElement?.getAttribute('role')).toBe('checkbox')

        await userEvent.keyboard('{Shift>}{F10}{/Shift}')
        await waitFor(() => expect(document.activeElement).toBe(menuItem('Edit')))
    })

    it('the Windows sequence: the keydown opens the menu, the keyboard contextmenu that follows on it is prevented, and the menu opens once', async () => {
        mountRows()
        row('r-1').focus()
        await userEvent.keyboard('{ContextMenu}')
        await waitFor(() => expect(document.activeElement).toBe(menuItem('Edit')))

        // Windows sends it now (Menu key keyup), at the focused element: the first item of the portalled menu.
        const event = contextMenuEvent('keyboard')

        document.activeElement!.dispatchEvent(event)

        await expect(event.defaultPrevented).toBe(true)
        await expect(menus()).toHaveLength(1)
        await expect(document.activeElement).toBe(menuItem('Edit'))
        await expect(rowActionsTrigger('r-1')).toHaveAttribute('aria-expanded', 'true')
    })

    it.each([
        ['the row', 0],
        ['a control in it', 1],
    ] as const)('a keyboard contextmenu alone (no keydown) on %s opens the ⋮ and is prevented', async (_label, steps) => {
        mountRows()
        row('r-1').focus()
        if (steps) await userEvent.keyboard('{ArrowRight}')

        const event = contextMenuEvent('keyboard')

        document.activeElement!.dispatchEvent(event)

        await expect(event.defaultPrevented).toBe(true)
        await waitFor(() => expect(document.activeElement).toBe(menuItem('Edit')))
        await expect(menus()).toHaveLength(1)
    })

    it('a mouse right-click is not taken: no menu of ours, the browser keeps its own', async () => {
        mountRows()
        row('r-1').focus()

        const event = contextMenuEvent('mouse')

        row('r-1').dispatchEvent(event)

        await expect(event.defaultPrevented).toBe(false)
        await new Promise((resolve) => setTimeout(resolve, 100))
        await expect(menus()).toHaveLength(0)
        await expect(rowActionsTrigger('r-1')).toHaveAttribute('aria-expanded', 'false')
    })

    it('a disabled ⋮ takes the focus and shows its reason; no menu opens', async () => {
        const onEdit = fn()

        mountRows({
            actions: () => [{ label: 'Edit', onClick: onEdit }],
            rowActionsState: () => ({ state: 'disabled', tooltipTitle: 'Signed rows are locked' }),
        })
        row('r-1').focus()

        await userEvent.keyboard('{ContextMenu}')
        await expect(document.activeElement).toBe(rowActionsTrigger('r-1'))
        await waitFor(async () => expect(within(document.body).getByRole('tooltip')).toHaveTextContent('Signed rows are locked'))
        await expect(menus()).toHaveLength(0)
        await expect(onEdit).not.toHaveBeenCalled()
    })

    it('a row without a ⋮ leaves the key alone: the browser opens its own menu', async () => {
        mountRows({ actions: undefined })
        row('r-1').focus()

        const watched = watchContextMenus()

        try {
            await userEvent.keyboard('{ContextMenu}')
            await new Promise((resolve) => setTimeout(resolve, 100))
            // Not taken, so this Chromium sends its `contextmenu`, and nothing prevents it.
            await expect(watched.events).toHaveLength(1)
            await expect(watched.events[0]!.defaultPrevented).toBe(false)
        } finally {
            watched.stop()
        }
        await expect(menus()).toHaveLength(0)
    })

    it('the key on a row whose menu is already open changes nothing', async () => {
        mountRows()
        row('r-1').focus()
        await userEvent.keyboard('{ArrowRight}{ArrowRight}{Enter}')
        await waitFor(() => expect(document.activeElement).toBe(menuItem('Edit')))
        await userEvent.keyboard('{ArrowDown}')
        await waitFor(() => expect(document.activeElement).toBe(menuItem('Delete')))

        // A keyboard contextmenu on the open ⋮: still one menu, the focus stays where it is.
        const event = contextMenuEvent('keyboard')

        rowActionsTrigger('r-1').dispatchEvent(event)
        await expect(event.defaultPrevented).toBe(true)
        await expect(menus()).toHaveLength(1)
        await expect(document.activeElement).toBe(menuItem('Delete'))
    })
})
