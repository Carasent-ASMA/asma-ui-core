import { afterEach, describe, it } from 'vitest'
import { expect, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { PathfinderCard, type PathfinderCardItem } from './PathfinderCard'

/**
 * ASMA-8427 — collapsed, the card shows one line beside an absolutely positioned chevron. A value
 * wider than the card used to be clipped mid-glyph *under* the chevron (no ellipsis, no boundary).
 * Now the content reserves the chevron's width and items may shrink, so the value's own `truncate`
 * ellipsizes — the shape `CareReceiverBarMapper`'s name item uses.
 *
 * Asserted on measured geometry: whether text slides under the chevron is a layout fact, and only a
 * real browser resolves it.
 */

const LONG_NAME = 'Eugene - You are not the user. Do not make me think about this name'

const nameItems: PathfinderCardItem[] = [
    {
        id: 'name',
        order: 1,
        render: () => (
            <span className='relative inline-flex min-w-0 max-w-full items-center gap-1'>
                <span data-test='pathfinder-name' className='min-w-0 truncate text-lg font-semibold'>
                    {LONG_NAME}
                </span>
            </span>
        ),
    },
]

const mountCollapsed = (width: number) =>
    mount(
        <div style={{ width }}>
            <PathfinderCard items={nameItems} expanded={false} onToggleExpanded={() => undefined} />
        </div>,
    )

/** Resolves once the card has measured itself and rendered the item. */
const findName = async (): Promise<HTMLElement> => {
    let name: HTMLElement | null = null
    await waitFor(() => {
        name = document.querySelector<HTMLElement>('[data-test="pathfinder-name"]')
        if (!name) throw new Error('card content not rendered yet')
    })

    return name!
}

describe('PathfinderCard — collapsed truncation', () => {
    afterEach(cleanup)

    it('ellipsizes an over-long value instead of clipping it', async () => {
        mountCollapsed(360)

        const name = await findName()

        await waitFor(() => {
            // Constrained → the text is wider than its box, so the ellipsis has something to shorten.
            if (name.scrollWidth <= name.clientWidth) throw new Error('name is not constrained yet')
        })
        await expect(getComputedStyle(name).textOverflow).toBe('ellipsis')
    })

    it('stops the value before the chevron instead of running underneath it', async () => {
        mountCollapsed(360)

        const name = await findName()
        const nameRow = name.parentElement!

        await waitFor(() => {
            if (nameRow.getBoundingClientRect().width === 0) throw new Error('name is not laid out yet')
        })

        const card = document.querySelector<HTMLElement>('[role="button"]')!
        const chevron = card.querySelector<SVGElement>('svg')!

        // A 1px tolerance for sub-pixel rounding.
        await expect(nameRow.getBoundingClientRect().right).toBeLessThanOrEqual(
            chevron.getBoundingClientRect().left + 1,
        )
    })
})
