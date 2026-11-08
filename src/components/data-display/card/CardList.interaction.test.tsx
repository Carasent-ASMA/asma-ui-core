import { useState } from 'react'
import { afterEach, describe, it } from 'vitest'
import { expect, page, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount } from 'src/test-utils/renderInteraction'
import { Card } from './Card'
import { CardList, type CardListProps } from './CardList'

/**
 * Card lists (CARD-13, CARD-16, CARD-17) in real Chromium.
 *
 * @see asma-modules/_docs/ux/components/component-card.md:203 — CARD-17
 */

const ITEMS = ['Modul 1', 'Modul 2', 'Modul 3']

const renderList = (props: Partial<CardListProps<string>> = {}): HTMLElement => {
    const { container } = mount(
        <CardList
            dataTest='list'
            items={ITEMS}
            getId={(item) => item}
            cardHeadingLevel={2}
            renderCard={(item) => <Card dataTest={`card-${item}`} title={item} open={{ href: `#${item}` }} />}
            {...props}
        />,
    )
    return container
}

const RemovableList = (): JSX.Element => {
    const [items, setItems] = useState(ITEMS)
    const [message, setMessage] = useState<string>()

    return (
        <CardList
            dataTest='list'
            items={items}
            getId={(item) => item}
            cardHeadingLevel={3}
            statusMessage={message}
            renderCard={(item) => (
                <Card
                    dataTest={`card-${item}`}
                    title={item}
                    open={{ href: `#${item}` }}
                    footerAction={
                        <button
                            type='button'
                            onClick={() => {
                                setItems((list) => list.filter((value) => value !== item))
                                setMessage(`${item} fjernet`)
                            }}
                        >
                            Fullfør {item}
                        </button>
                    }
                />
            )}
        />
    )
}

const FilteredList = (): JSX.Element => {
    const [query, setQuery] = useState('')

    return (
        <>
            <input aria-label='Søk' value={query} onChange={(event) => setQuery(event.target.value)} />
            <CardList
                dataTest='list'
                items={ITEMS.filter((item) => item.includes(query))}
                getId={(item) => item}
                cardHeadingLevel={3}
                renderCard={(item) => <Card dataTest={`card-${item}`} title={item} open={{ href: `#${item}` }} />}
            />
        </>
    )
}

const SelectableList = (): JSX.Element => {
    const [checkedIds, setCheckedIds] = useState<string[]>([])

    // The bulk-actions bar is the app's, drawn from the checked ids the list reports.
    return (
        <>
            {checkedIds.length > 0 && <div data-testid='bulk-bar'>{checkedIds.length} valgt</div>}
            <CardList
                dataTest='list'
                items={ITEMS}
                getId={(item) => item}
                cardHeadingLevel={3}
                selection={{
                    checkedIds,
                    onCheckedChange: (id, checked) => setCheckedIds((ids) => (checked ? [...ids, id] : ids.filter((value) => value !== id))),
                }}
                renderCard={(item) => <Card dataTest={`card-${item}`} title={item} open={{ href: `#${item}` }} />}
            />
        </>
    )
}

describe('CardList', () => {
    afterEach(async () => {
        await page.viewport(1280, 720)
        cleanup()
    })

    it('is only a list of cards, every title at the same heading level', async () => {
        const container = renderList()

        await expect(container.querySelector('[data-testid="list"]')!.children).toHaveLength(2) // the live region and the list
        await expect(container.querySelectorAll('ul > li')).toHaveLength(3)
        await expect(container.querySelectorAll('h2')).toHaveLength(3)
    })

    it('passes its locale to every card', async () => {
        const container = renderList({
            locale: 'en',
            renderCard: (item) => <Card dataTest={`card-${item}`} title={item} open={{ href: `#${item}` }} unread />,
        })

        await expect(container.querySelector('[data-card-link]')).toHaveAccessibleDescription('Unread')
    })

    it('marks the list busy and keeps the card shape while loading', async () => {
        const container = renderList({ loading: true, skeletonCount: 2 })

        await expect(container.querySelector('ul')).toHaveAttribute('aria-busy', 'true')
        await expect(container.querySelectorAll('li [aria-hidden="true"]')).toHaveLength(2)
        await expect(container.querySelector('[data-card-link]')).toBeNull()
    })

    it('says why it is empty instead of rendering an empty list', async () => {
        const container = renderList({ items: [], empty: <p>Ingen moduler ennå</p> })

        await expect(container.querySelector('ul')).toBeNull()
        await expect(container).toHaveTextContent('Ingen moduler ennå')
    })

    it('announces a removed card and moves focus to the next card, not the top of the page', async () => {
        const { container } = mount(<RemovableList />)

        await userEvent.click(container.querySelector('button')!)

        await waitFor(() => expect(container.querySelector('[role="status"]')).toHaveTextContent('Modul 1 fjernet'))
        await waitFor(() => expect(document.activeElement).toHaveAccessibleName('Modul 2'))
    })

    it('leaves focus where the user moved it when a card they left earlier is filtered out', async () => {
        const { container } = mount(<FilteredList />)
        const search = container.querySelector('input')!

        container.querySelector<HTMLElement>('[href="#Modul 1"]')!.focus()
        search.focus()
        await userEvent.keyboard('3')

        await expect(container.querySelectorAll('ul > li')).toHaveLength(1)
        await expect(document.activeElement).toBe(search)
    })

    it('lays out a grid of columns between 18 and 37.5 rem that fills the row', async () => {
        await page.viewport(1000, 720)
        const container = renderList({ layout: 'grid', items: ['Modul 1', 'Modul 2', 'Modul 3', 'Modul 4'] })
        const items = Array.from(container.querySelectorAll('li'))
        const firstRowTop = Math.round(items[0]!.getBoundingClientRect().top)
        const columns = items.filter((item) => Math.round(item.getBoundingClientRect().top) === firstRowTop).length

        // ~1000 px holds three 18 rem columns; a 37.5 rem track would leave a single column.
        await expect(columns).toBe(3)
        for (const item of items) {
            await expect(item.getBoundingClientRect().width).toBeGreaterThanOrEqual(288)
            await expect(item.getBoundingClientRect().width).toBeLessThanOrEqual(600)
        }
    })

    it('restores focus to the card the user came back from', async () => {
        const container = renderList({ restoreFocusId: 'Modul 3' })

        await waitFor(() => expect(document.activeElement).toBe(container.querySelector('[href="#Modul 3"]')))
    })

    it('puts a checkbox on every card and reports the checked ids, so the app can show its bulk bar', async () => {
        const { container } = mount(<SelectableList />)
        const checkboxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')

        await expect(checkboxes).toHaveLength(3)
        await expect(container.querySelector('[data-testid="bulk-bar"]')).toBeNull()

        checkboxes[0]!.focus()
        await userEvent.keyboard(' ')
        await expect(container.querySelector('[data-testid="bulk-bar"]')).toHaveTextContent('1 valgt')
        await expect(container.querySelector('[data-testid="card-Modul 1"]')).toHaveAttribute('data-model', 'partial')

        await userEvent.keyboard(' ')
        await expect(container.querySelector('[data-testid="bulk-bar"]')).toBeNull()
    })

    it('reflows at 320 px, 200 % text and text spacing without horizontal scrolling, cards at least 8 px apart', async () => {
        await page.viewport(320, 720)
        document.documentElement.style.fontSize = '200%'
        // WCAG 1.4.12 text-spacing override on top of the 200 % text.
        const spacing = document.createElement('style')
        spacing.textContent = '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }'
        document.head.append(spacing)
        try {
            const container = renderList({
                renderCard: (item) => (
                    <Card
                        dataTest={`card-${item}`}
                        title={item}
                        open={{ href: `#${item}` }}
                        type={{ label: 'Spørreskjemaundersøkelse' }}
                        status={{ label: 'Ikke startet' }}
                        cta='Åpne'
                    />
                ),
            })
            const items = Array.from(container.querySelectorAll('li'))

            for (const item of items) {
                await expect(item.scrollWidth).toBeLessThanOrEqual(item.clientWidth)
            }
            const gap = items[1]!.getBoundingClientRect().top - items[0]!.getBoundingClientRect().bottom
            await expect(gap).toBeGreaterThanOrEqual(8)
            await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320)
        } finally {
            document.documentElement.style.fontSize = ''
            spacing.remove()
        }
    })
})
