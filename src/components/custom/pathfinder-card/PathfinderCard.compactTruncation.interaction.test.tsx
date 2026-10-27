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

    it('stops the value 8px before the chevron instead of running underneath it', async () => {
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
            chevron.getBoundingClientRect().left - 8 + 1,
        )
    })
})

describe('PathfinderCard — collapsed packing', () => {
    afterEach(cleanup)

    const fixedItems: PathfinderCardItem[] = [1, 2, 3].map((order) => ({
        id: `item-${order}`,
        order,
        render: () => <span data-test='packed-item' style={{ display: 'inline-block', width: 100 }} />,
    }))

    it('reserves the chevron once, so items that fit stay visible', async () => {
        // 404 - 24 (left) - 48 (right, chevron included) = 332 ≥ 3 × 100 + 2 × 12. Reserving the
        // chevron a second time left 316, and the third item was dropped although it fits.
        mount(
            <div style={{ width: 404 }}>
                <PathfinderCard items={fixedItems} expanded={false} onToggleExpanded={() => undefined} />
            </div>,
        )

        await waitFor(() => {
            // The off-screen measurement copy renders every item too; count only the visible row.
            const shown = [...document.querySelectorAll('[data-test="packed-item"]')].filter(
                (item) => !item.closest('[aria-hidden]'),
            ).length
            if (shown !== 3) throw new Error(`expected 3 collapsed items, got ${shown}`)
        })
    })
})

describe('PathfinderCard — expanded width', () => {
    afterEach(cleanup)

    it('keeps a value longer than the card inside it, so it can wrap', async () => {
        const wrappingName: PathfinderCardItem[] = [
            {
                id: 'name',
                order: 1,
                render: () => (
                    <span data-test='pathfinder-name' className='whitespace-normal text-lg font-semibold'>
                        {LONG_NAME}
                    </span>
                ),
            },
        ]
        mount(
            <div style={{ width: 360 }}>
                <PathfinderCard items={wrappingName} expanded onToggleExpanded={() => undefined} />
            </div>,
        )

        const name = await findName()
        const card = document.querySelector<HTMLElement>('[role="button"]')!

        await waitFor(() => {
            // Wrapped onto more than one line rather than laid out as one 800px line.
            if (name.getBoundingClientRect().height < 40) throw new Error('name has not wrapped yet')
        })
        await expect(name.getBoundingClientRect().right).toBeLessThanOrEqual(card.getBoundingClientRect().right)
    })
})

describe('PathfinderCard — collapsed stacked items', () => {
    afterEach(cleanup)

    it('keeps the second stacked item at the line start instead of stretching it', async () => {
        const stacked: PathfinderCardItem[] = [
            nameItems[0]!,
            {
                id: 'process-id',
                order: 2,
                // The directory's process ID centres its content inside its own box.
                render: () => (
                    <div className='flex justify-center'>
                        <span data-test='process-id'>Løpenummer: 12637</span>
                    </div>
                ),
            },
        ]
        mount(
            <div style={{ width: 343 }}>
                <PathfinderCard items={stacked} expanded={false} onToggleExpanded={() => undefined} />
            </div>,
        )

        const name = await findName()
        const processId = [...document.querySelectorAll<HTMLElement>('[data-test="process-id"]')].find(
            (el) => !el.closest('[aria-hidden]'),
        )!

        await waitFor(() => {
            if (processId.getBoundingClientRect().width === 0) throw new Error('not laid out yet')
        })
        // A 1px tolerance for sub-pixel rounding.
        await expect(Math.abs(processId.getBoundingClientRect().left - name.getBoundingClientRect().left)).toBeLessThanOrEqual(1)
    })
})
