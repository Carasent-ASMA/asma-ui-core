import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { afterEach, beforeEach, describe, it } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { StyledTable } from './StyledTableIndex'
import { readPageIndexFromUrl, useControlledPageUrlParam } from '../hooks/usePageUrlParam'

/**
 * `pageUrlParam` (ASMA-8470): the page survives Back, Forward, a reload and a remount through the URL, and paging never
 * adds a history entry, because the overlay-back adapter counts on one Back leaving the list.
 */

interface Item {
    id: string
    name: string
}

const items = (count: number, prefix = 'Item'): Item[] =>
    Array.from({ length: count }, (_, index) => ({ id: `${prefix}-${index + 1}`, name: `${prefix} ${index + 1}` }))

const columns: ColumnDef<Item>[] = [{ accessorKey: 'name', header: 'Name', size: 200 }]

const ALL = items(50)

const List = ({ data = ALL, loading, param = 'page' }: { data?: Item[]; loading?: boolean; param?: string | null }) => (
    <div style={{ height: 600 }}>
        <StyledTable<Item>
            locale='en'
            columns={columns}
            data={data}
            loading={loading}
            pageSize={10}
            pageUrlParam={param ?? undefined}
        />
    </div>
)

const pager = (): string =>
    [...document.querySelectorAll('button')].map((button) => button.textContent?.trim() ?? '').find((text) => /^Page \d+ of \d+$/.test(text)) ??
    'no pager'
const firstRow = (): string => document.querySelector('tbody tr td:not(:empty)')?.textContent?.trim() ?? ''
const next = async (): Promise<void> => {
    await userEvent.click(document.querySelector<HTMLElement>('[data-testid="next-page-button"]')!)
}
const search = (): string => window.location.search
const startUrl = window.location.pathname

const popTo = async (move: () => void): Promise<void> => {
    const popped = new Promise((resolve) => window.addEventListener('popstate', resolve, { once: true }))
    move()
    await popped
}

describe('StyledTable pageUrlParam (ASMA-8470)', () => {
    beforeEach(() => {
        localStorage.clear()
        window.history.replaceState(window.history.state, '', startUrl)
    })

    afterEach(() => {
        cleanup()
        window.history.replaceState(window.history.state, '', startUrl)
    })

    it('opens the page the URL names, before the first paint', async () => {
        window.history.replaceState(null, '', `${startUrl}?page=3`)
        mount(<List />)

        await expect(pager()).toBe('Page 3 of 5')
        await expect(firstRow()).toBe('Item 21')
        await expect(search()).toBe('?page=3')
    })

    it('waits for rows that load after mount, and does not let their arrival reset the page', async () => {
        window.history.replaceState(null, '', `${startUrl}?page=4`)
        const { rerender } = mount(<List data={[]} />)

        rerender(<List data={[]} loading />)
        rerender(<List data={ALL} loading />)
        rerender(<List data={ALL} />)

        await waitFor(() => expect(pager()).toBe('Page 4 of 5'))
        await expect(firstRow()).toBe('Item 31')
        await expect(search()).toBe('?page=4')
    })

    it('replaces the entry on every page change, keeps its state and the other parameters, and leaves page 1 out', async () => {
        const state = { usr: null, key: 'k1', idx: 7 }
        window.history.replaceState(state, '', `${startUrl}?tab=a&ids=1,2#top`)
        const length = window.history.length
        mount(<List />)

        await next()
        await next()

        await waitFor(() => expect(search()).toBe('?tab=a&ids=1,2&page=3'))
        await expect(window.location.hash).toBe('#top')
        await expect(pager()).toBe('Page 3 of 5')

        await userEvent.click(document.querySelector<HTMLElement>('[data-testid="prev-page-button"]')!)
        await userEvent.click(document.querySelector<HTMLElement>('[data-testid="prev-page-button"]')!)

        await waitFor(() => expect(search()).toBe('?tab=a&ids=1,2'))
        await expect(window.history.length).toBe(length)
        await expect(window.history.state).toEqual(state)
    })

    it('goes back to page 1, and drops the parameter, when the rows change (a filter)', async () => {
        window.history.replaceState(null, '', `${startUrl}?page=3`)
        const { rerender } = mount(<List />)
        await expect(pager()).toBe('Page 3 of 5')
        // TanStack arms its page reset in a microtask after the first render; a user's filter always comes later.
        await new Promise((resolve) => setTimeout(resolve, 0))

        rerender(<List data={ALL.slice(0, 30)} />)

        await waitFor(() => expect(pager()).toBe('Page 1 of 3'))
        await waitFor(() => expect(search()).toBe(''))
    })

    it('opens the last page when the URL names a page past the end', async () => {
        window.history.replaceState(null, '', `${startUrl}?page=40`)
        mount(<List />)

        await expect(pager()).toBe('Page 5 of 5')
        await waitFor(() => expect(search()).toBe('?page=5'))
    })

    it('restores the page of the entry Back and Forward land on', async () => {
        window.history.replaceState(null, '', `${startUrl}?page=2`)
        mount(<List />)
        await next()
        await waitFor(() => expect(search()).toBe('?page=3'))

        // Somewhere else, with the list still mounted: an entry without a page.
        window.history.pushState(null, '', `${startUrl}?view=other`)

        await popTo(() => window.history.back())
        await waitFor(() => expect(pager()).toBe('Page 3 of 5'))
        await expect(search()).toBe('?page=3')

        await popTo(() => window.history.forward())
        await waitFor(() => expect(pager()).toBe('Page 1 of 5'))
        await expect(search()).toBe('?view=other')

        await popTo(() => window.history.back())
        await waitFor(() => expect(pager()).toBe('Page 3 of 5'))
    })

    it("ignores single-spa's replayed popstate", async () => {
        window.history.replaceState(null, '', `${startUrl}?page=3`)
        mount(<List />)
        window.history.replaceState(null, '', `${startUrl}?view=other`)

        window.dispatchEvent(Object.assign(new PopStateEvent('popstate'), { singleSpa: true }))
        await new Promise((resolve) => setTimeout(resolve, 50))

        await expect(pager()).toBe('Page 3 of 5')
    })

    it('leaves the URL alone without the prop', async () => {
        window.history.replaceState(null, '', `${startUrl}?page=3`)
        mount(<List param={null} />)

        await expect(pager()).toBe('Page 1 of 5')
        await next()
        await new Promise((resolve) => setTimeout(resolve, 50))
        await expect(search()).toBe('?page=3')
        await expect(pager()).toBe('Page 2 of 5')
    })

    describe('useControlledPageUrlParam, for an app that owns the page (server-side paging)', () => {
        const ServerPagedList = () => {
            const [pageIndex, setPageIndex] = useState(() => readPageIndexFromUrl('page'))
            useControlledPageUrlParam('page', pageIndex, setPageIndex)
            const rows = ALL.slice(pageIndex * 10, pageIndex * 10 + 10)

            return (
                <div style={{ height: 600 }}>
                    <StyledTable<Item>
                        locale='en'
                        columns={columns}
                        data={rows}
                        manualPagination
                        pageCount={5}
                        pageSize={10}
                        state={{ pagination: { pageIndex, pageSize: 10 } }}
                        onPaginationChange={(updater) =>
                            setPageIndex((typeof updater === 'function' ? updater({ pageIndex, pageSize: 10 }) : updater).pageIndex)
                        }
                    />
                </div>
            )
        }

        it('opens on the page the URL names, replaces the entry on paging, and follows Back and Forward', async () => {
            window.history.replaceState(null, '', `${startUrl}?page=2`)
            const length = window.history.length
            mount(<ServerPagedList />)
            await expect(pager()).toBe('Page 2 of 5')

            await next()
            await waitFor(() => expect(search()).toBe('?page=3'))
            await expect(firstRow()).toBe('Item 21')
            await expect(window.history.length).toBe(length)

            window.history.pushState(null, '', `${startUrl}?view=other`)
            await popTo(() => window.history.back())
            await waitFor(() => expect(pager()).toBe('Page 3 of 5'))

            await popTo(() => window.history.forward())
            await waitFor(() => expect(pager()).toBe('Page 1 of 5'))
            await expect(search()).toBe('?view=other')
        })
    })
})
