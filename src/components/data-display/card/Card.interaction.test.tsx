import { afterEach, describe, it, vi } from 'vitest'
import { expect, userEvent, waitFor } from 'src/test-utils/interaction-api'
import { cleanup, mount, parkPointer, tabbableWithin } from 'src/test-utils/renderInteraction'
import { Card } from './Card'
import type { CardProps } from './Card.types'
import { CardControl } from './CardParts'

/**
 * Card contract (ASMA-8318) in real Chromium: model, name and description, stretched link, controls
 * on top, scoped hover/pressed/focus.
 *
 * @see asma-modules/_docs/ux/components/component-card.md:122 — §5 Rules
 */

const TITLE = 'Achieve a 20% increase in monthly active users'
const DELTA_50 = 'rgb(240, 242, 244)'
const GAMA_100 = 'rgb(204, 230, 241)'
const WARNING_800 = 'rgb(95, 81, 7)'

const noNavigation = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())

const renderCard = (props: Partial<CardProps> = {}): { card: HTMLElement; link: HTMLElement | null } => {
    const { container } = mount(
        <Card
            dataTest='card'
            title={TITLE}
            headingLevel={3}
            open={{ href: '#item', onClick: noNavigation }}
            type={{ label: 'Spørreskjema' }}
            status={{ label: 'Ikke startet' }}
            cta='Svar'
            // The contract's wording is bokmål (Q11); the default language is tested on its own.
            locale='no'
            {...props}
        >
            {props.children ?? <p>Mottatt: 19.01.2026</p>}
        </Card>,
    )
    const card = container.querySelector<HTMLElement>('[data-testid="card"]')!
    return { card, link: card.querySelector<HTMLElement>('[data-card-link]') }
}

const clickAt = async (card: HTMLElement, x: number, y: number): Promise<void> => {
    await userEvent.click(card, { position: { x, y } })
}

const backgroundOf = (element: HTMLElement): string => getComputedStyle(element).backgroundColor

/** Computed `rgb()` of a theme token, so assertions follow the theme under test. */
const tokenColor = (token: string): string => {
    const probe = document.createElement('span')
    probe.style.color = `var(${token})`
    document.body.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
}

const ACCENT = 'rgb(209, 107, 246)'

describe('Card — fully clickable', () => {
    afterEach(() => {
        noNavigation.mockClear()
        cleanup()
    })

    it('opens through one link in a heading, named by its title alone, described by type and status', async () => {
        const { card, link } = renderCard()

        await expect(card).toHaveAttribute('data-model', 'full')
        await expect(card).not.toHaveAttribute('role')
        await expect(link?.closest('h3')).not.toBeNull()
        await expect(link).toHaveAttribute('href', '#item')
        await expect(link).toHaveAccessibleName(TITLE)
        await expect(link).toHaveAccessibleDescription('Spørreskjema Ikke startet')
        await expect(tabbableWithin(card)).toEqual([link])
    })

    it('opens from anywhere on the card, including the CTA label', async () => {
        const { card } = renderCard()
        const rect = card.getBoundingClientRect()
        const cta = card.querySelector<HTMLElement>('[id$="-cta"]')!.getBoundingClientRect()

        await clickAt(card, 8, rect.height - 6)
        await clickAt(card, cta.left - rect.left + cta.width / 2, cta.top - rect.top + cta.height / 2)

        await expect(noNavigation).toHaveBeenCalledTimes(2)
    })

    it('opens from the coloured leading edge and the border too', async () => {
        const { card, link } = renderCard({ accentColor: '#D16BF6' })
        const rect = card.getBoundingClientRect()
        const hitAt = (x: number, y: number): Element | null | undefined => document.elementFromPoint(rect.left + x, rect.top + y)?.closest('[data-card-link]')

        // The stretched link covers the border box: the 5 px leading edge, the 1 px border, the bottom-left corner.
        await expect(hitAt(2, rect.height / 2)).toBe(link)
        await expect(hitAt(rect.width - 0.5, rect.height / 2)).toBe(link)
        await expect(hitAt(rect.width / 2, rect.height - 0.5)).toBe(link)
        await expect(hitAt(6, rect.height - 4)).toBe(link)
    })

    it('opens on Enter but not on Space, like any link', async () => {
        const { link } = renderCard()
        link!.focus()

        await userEvent.keyboard(' ')
        await expect(noNavigation).not.toHaveBeenCalled()
        await userEvent.keyboard('{Enter}')
        await expect(noNavigation).toHaveBeenCalledTimes(1)
    })

    it('opens a dialog through a button that says it does', async () => {
        const onOpen = vi.fn()
        const { card } = renderCard({ open: { onOpen } })
        const button = card.querySelector<HTMLElement>('button[data-card-link]')!

        await expect(button).toHaveAttribute('aria-haspopup', 'dialog')
        await clickAt(card, 8, 8)
        await expect(onOpen).toHaveBeenCalledTimes(1)
    })

    it('marks the item viewed now with aria-current and "Vises nå", and drops the hidden CTA from the name', async () => {
        const { card, link } = renderCard({ selected: true })

        await expect(link).toHaveAttribute('aria-current', 'true')
        await expect(link).toHaveAccessibleName(TITLE)
        // Every id the name points at exists: no dangling reference to a CTA that is not rendered.
        for (const id of link!.getAttribute('aria-labelledby')!.split(' ')) {
            await expect(document.getElementById(id)).not.toBeNull()
        }
        await expect(card).toHaveTextContent('Vises nå')
        await expect(card).not.toHaveTextContent('Svar')
    })

    it('puts the title chevron inside the link only when titleChevron is on, never in the name', async () => {
        const { link } = renderCard({ cta: undefined, titleChevron: true })

        await expect(link!.querySelectorAll('svg')).toHaveLength(1)
        await expect(link!.querySelector('[aria-hidden="true"] svg')).not.toBeNull()
        await expect(link).toHaveAccessibleName(TITLE)

        cleanup()
        const { link: plain } = renderCard({ cta: undefined, titleChevron: false })
        await expect(plain!.querySelectorAll('svg')).toHaveLength(0)
    })

    it('shows the overdue words in the status slot and turns the CTA warning-800', async () => {
        const { card, link } = renderCard({ status: undefined, overdue: { label: 'Forfalt • 4 dager' } })

        await expect(card).toHaveAttribute('data-overdue')
        await expect(link).toHaveAccessibleDescription('Spørreskjema Forfalt • 4 dager')
        await expect(getComputedStyle(card.querySelector('[id$="-cta"]')!).color).toBe(WARNING_800)
    })

    it('speaks English with locale="en", and labels still override single strings', async () => {
        const { link } = renderCard({ locale: 'en', unread: true, menu: { actions: [{ label: 'Duplicate', onSelect: vi.fn() }] } })
        await expect(link).toHaveAccessibleDescription('Spørreskjema Ikke startet Unread')
        await expect(document.querySelector('[aria-haspopup="menu"]')).toHaveAccessibleName(`More actions for “${TITLE}”`)

        cleanup()
        const { card } = renderCard({ locale: 'en', selected: true, labels: { viewingNow: 'Open now' } })
        await expect(card).toHaveTextContent('Open now')
    })

    it('names its controls from the text of an element title, without titleText', async () => {
        const { card } = renderCard({
            title: (
                <>
                    <svg aria-hidden='true' />
                    {TITLE}
                </>
            ),
            checkbox: { checked: false, onChange: vi.fn() },
        })

        const [checkbox] = tabbableWithin(card)
        await expect(checkbox).toHaveAccessibleName(`Velg «${TITLE}»`)
    })

    it('says "Ulest" in the description for an unread card', async () => {
        const { link } = renderCard({ unread: true })
        await expect(link).toHaveAccessibleDescription('Spørreskjema Ikke startet Ulest')
    })

    it('describes a visible "ULEST" label in normal case, so it is not spelled out', async () => {
        const { link } = renderCard({ unread: { visibleLabel: true } })
        const describedBy = link!.getAttribute('aria-describedby')!.split(' ')
        const unread = document.getElementById(describedBy[describedBy.length - 1]!)!

        await expect(link).toHaveAccessibleDescription('Spørreskjema Ikke startet Ulest')
        await expect(getComputedStyle(unread).textTransform).toBe('none')
    })

    it('keeps the title chevron right after the ellipsis of a one-line title', async () => {
        const { link } = renderCard({ cta: undefined, titleChevron: true, titleClamp: 1, title: `${TITLE} ${TITLE} ${TITLE}` })
        const title = link!.querySelector<HTMLElement>('[id$="-title"]')!
        const text = title.getBoundingClientRect()
        const chevron = link!.querySelector('svg')!.getBoundingClientRect()

        // `text-overflow` cuts at the box edge; `line-clamp` would cut after the last whole word.
        await expect(getComputedStyle(title).textOverflow).toBe('ellipsis')
        await expect(text.height).toBeLessThanOrEqual(24)
        await expect(chevron.left - text.right).toBeLessThan(8)
        await expect(chevron.right).toBeLessThanOrEqual(link!.closest('[data-model]')!.getBoundingClientRect().right)
        await expect(link).toHaveAccessibleName(`${TITLE} ${TITLE} ${TITLE}`)
    })

    it('keeps the pressed look at least ~100 ms after a fast tap', async () => {
        const { card } = renderCard()

        await clickAt(card, 8, 8)
        // A real click releases within a few ms; the look must outlast it.
        await new Promise((resolve) => setTimeout(resolve, 50))
        await expect(card).toHaveAttribute('data-pressed')
        await expect(backgroundOf(card)).toBe(GAMA_100)
        await waitFor(() => expect(card).not.toHaveAttribute('data-pressed'), { timeout: 500 })
    })

    it('draws the focus ring around the whole card on keyboard focus only, without moving anything', async () => {
        const { card, link } = renderCard()
        const before = card.getBoundingClientRect()

        await clickAt(card, 8, 8)
        await expect(getComputedStyle(card).boxShadow).toBe('none')

        const previousControl = document.createElement('button')
        card.before(previousControl)
        previousControl.focus()
        await userEvent.tab()
        previousControl.remove()
        await expect(document.activeElement).toBe(link)
        // The 1px edge turns focus colour and a 2px outer shadow completes the 3px ring.
        await expect(getComputedStyle(card).borderTopColor).toBe(tokenColor('--colors-focus-ring'))
        await expect(getComputedStyle(card).boxShadow).toBe(`${tokenColor('--colors-focus-ring')} 0px 0px 0px 2px`)
        await expect(card.getBoundingClientRect()).toEqual(before)
    })

    it('nudges the title chevron forward while the card is hovered, not the CTA', async () => {
        await parkPointer()
        const { card } = renderCard({ cta: undefined, titleChevron: true })
        const chevron = card.querySelector<SVGElement>('[data-card-chevron] > svg')!

        await expect(getComputedStyle(chevron).transform).toBe('none')
        await userEvent.hover(card)
        await waitFor(() => expect(getComputedStyle(chevron).transform).toBe('matrix(1, 0, 0, 1, 4, 0)'))

        cleanup()
        const { card: withCta } = renderCard()
        await userEvent.hover(withCta)
        await expect(getComputedStyle(withCta.querySelector('[id$="-cta"] svg') ?? withCta).transform).toBe('none')
    })

    it('keeps the coloured leading edge whole inside the focus ring and while pressed (Figma)', async () => {
        const { card, link } = renderCard({ accentColor: '#D16BF6' })

        link!.focus()
        await userEvent.keyboard('{Enter}')
        const focusRing = tokenColor('--colors-focus-ring')
        await expect(getComputedStyle(card).borderLeftColor).toBe(ACCENT)
        await expect(getComputedStyle(card).borderLeftWidth).toBe('5px')
        await expect(getComputedStyle(card).boxShadow).toBe(`${focusRing} 0px 0px 0px 2px, ${focusRing} -1px 0px 0px 2px`)

        link!.blur()
        await clickAt(card, 8, 8)
        await expect(card).toHaveAttribute('data-pressed')
        await expect(getComputedStyle(card).borderTopColor).toBe(tokenColor('--colors-gama-300'))
        await expect(getComputedStyle(card).borderLeftColor).toBe(ACCENT)
    })

    it('takes the resting edge colour from the app, and still draws the focus edge over it', async () => {
        const { card, link } = renderCard({ classes: { root: '[--card-border-color:rgb(211,216,223)]' } })

        await expect(getComputedStyle(card).borderTopColor).toBe('rgb(211, 216, 223)')
        const previousControl = document.createElement('button')
        card.before(previousControl)
        previousControl.focus()
        await userEvent.tab()
        previousControl.remove()
        await expect(document.activeElement).toBe(link)
        await expect(getComputedStyle(card).borderTopColor).toBe(tokenColor('--colors-focus-ring'))
        await expect(card.querySelector('[data-card-title]')).not.toBeNull()
    })

    it('draws the selected edge in border/selected, never the focus colour, and keeps the leading edge', async () => {
        const { card } = renderCard({ selected: true, accentColor: '#D16BF6' })
        const selectedEdge = tokenColor('--colors-gama-400')

        await expect(selectedEdge).not.toBe(tokenColor('--colors-focus-ring'))
        await expect(getComputedStyle(card).borderTopColor).toBe(selectedEdge)
        await expect(getComputedStyle(card).boxShadow).toContain(`${selectedEdge} 0px 1px 0px 0px inset`)
        await expect(getComputedStyle(card).borderLeftColor).toBe(ACCENT)
        await expect(backgroundOf(card)).toBe(tokenColor('--colors-gama-25'))
    })
})

describe('Card — CTA button', () => {
    afterEach(() => {
        noNavigation.mockClear()
        cleanup()
    })

    it('puts a real button in the CTA place, with its own action, and drops the CTA label', async () => {
        const onAction = vi.fn()
        const { card, link } = renderCard({ ctaAction: <button type='button' onClick={onAction}>Åpne</button> })
        const button = card.querySelector<HTMLElement>('[data-card-control] button')!

        await expect(card).toHaveAttribute('data-model', 'partial')
        await expect(card.querySelector('[id$="-cta"]')).toBeNull()
        await expect(card).not.toHaveTextContent('Svar')
        await expect(link).toHaveAccessibleName(TITLE)
        await expect(tabbableWithin(card)).toEqual([link, button])

        await userEvent.click(button)
        await expect(onAction).toHaveBeenCalledOnce()
        await expect(noNavigation).not.toHaveBeenCalled()
    })

    it('is hidden on read-only and disabled cards', async () => {
        const ctaAction = <button type='button'>Åpne</button>
        const { card: readOnly } = renderCard({ readOnly: true, ctaAction })
        await expect(readOnly.querySelector('button')).toBeNull()

        cleanup()
        const { card: disabled } = renderCard({ disabled: true, ctaAction })
        await expect(disabled.querySelector('[data-card-control]')).toBeNull()
    })
})

describe('Card — disabled', () => {
    afterEach(cleanup)

    it('keeps its tab stop but opens nothing and shows no CTA, with the grey look and no pressed state', async () => {
        const onClick = vi.fn()
        const { card, link } = renderCard({
            disabled: true,
            accentColor: '#D16BF6',
            open: { href: '#item', onClick },
            footerAction: <button type='button'>Sign</button>,
        })

        await expect(link).toHaveAttribute('aria-disabled', 'true')
        await expect(link).not.toHaveAttribute('href')
        await expect(link).toHaveAccessibleName(TITLE)
        await expect(card.querySelector('[id$="-cta"]')).toBeNull()
        await expect(card).not.toHaveTextContent('Sign')
        await expect(tabbableWithin(card)).toEqual([link])

        // Playwright waits for an aria-disabled element to turn enabled; force the click a user can still make.
        await userEvent.click(link!, { force: true })
        link!.focus()
        await userEvent.keyboard('{Enter}')
        await expect(onClick).not.toHaveBeenCalled()
        await expect(card).not.toHaveAttribute('data-pressed')

        await expect(backgroundOf(card)).toBe(tokenColor('--colors-delta-50'))
        await expect(getComputedStyle(card).borderLeftColor).toBe(tokenColor('--colors-delta-300'))
        await expect(getComputedStyle(link!).cursor).toBe('not-allowed')
    })
})

describe('Card — read-only (static)', () => {
    afterEach(cleanup)

    it('has no link, no tab stop, no cue, no footer button and no pointer cursor', async () => {
        const { card, link } = renderCard({ readOnly: true, titleChevron: true, footerAction: <button type='button'>Sign</button> })

        await expect(card).toHaveAttribute('data-model', 'static')
        await expect(link).toBeNull()
        await expect(tabbableWithin(card)).toHaveLength(0)
        await expect(card).not.toHaveTextContent('Svar')
        await expect(card).not.toHaveTextContent('Sign')
        await expect(card.querySelector('svg')).toBeNull()
        await expect(getComputedStyle(card).cursor).not.toBe('pointer')
    })

    it('gets no hover', async () => {
        await parkPointer()
        const { card } = renderCard({ readOnly: true })
        const resting = backgroundOf(card)

        await userEvent.hover(card)
        await expect(backgroundOf(card)).toBe(resting)
    })
})

describe('Card — partially clickable', () => {
    afterEach(() => {
        noNavigation.mockClear()
        cleanup()
    })

    const renderPartial = (onCheck = vi.fn()): ReturnType<typeof renderCard> =>
        renderCard({
            cta: undefined,
            titleChevron: true,
            checkbox: { checked: false, onChange: onCheck },
            menu: { actions: [{ label: 'Dupliser', onSelect: vi.fn() }] },
            ctaAction: (
                <button type='button' aria-label={`Vis detaljer, «${TITLE}»`}>
                    Vis detaljer
                </button>
            ),
            children: (
                <CardControl>
                    <button type='button'>Kopier ID</button>
                </CardControl>
            ),
        })

    it('names every control after its card and keeps them in visual order', async () => {
        const { card, link } = renderPartial()
        const [checkbox, menu, title, copy, details] = tabbableWithin(card)

        await expect(card).toHaveAttribute('data-model', 'partial')
        await expect(checkbox).toHaveAccessibleName(`Velg «${TITLE}»`)
        await expect(menu).toHaveAccessibleName(`Flere handlinger for «${TITLE}»`)
        await expect(menu).toHaveAttribute('aria-haspopup', 'menu')
        await expect(title).toBe(link)
        await expect(copy).toHaveAccessibleName('Kopier ID')
        await expect(details).toHaveAccessibleName(`Vis detaljer, «${TITLE}»`)
    })

    it('never opens the card from a control, and the visible "Velg" toggles the checkbox', async () => {
        const onCheck = vi.fn()
        const { card } = renderPartial(onCheck)

        await userEvent.click(card.querySelector('label[for]')!)
        await expect(onCheck).toHaveBeenCalledWith(true)
        await userEvent.click(card.querySelector('[aria-haspopup="menu"]')!)
        await userEvent.keyboard('{Escape}')
        await userEvent.click(card.querySelector('[aria-label^="Vis detaljer"]')!)
        await userEvent.click(card.querySelector('[data-card-control] button:not([aria-label])')!)

        await expect(noNavigation).not.toHaveBeenCalled()
    })

    it('opens the design-system menu from ⋮; choosing an action closes it and puts focus back on ⋮', async () => {
        const onDelete = vi.fn()
        const { card } = renderCard({
            menu: {
                actions: [
                    { label: 'Last ned', onSelect: vi.fn() },
                    { label: 'Arkiver', onSelect: vi.fn(), disabledReason: 'Låst' },
                    { label: 'Slett', onSelect: onDelete, danger: true },
                ],
            },
        })
        const trigger = card.querySelector<HTMLElement>('[aria-haspopup="menu"]')!

        await userEvent.click(trigger)
        await expect(trigger).toHaveAttribute('aria-expanded', 'true')
        const items = Array.from(document.querySelectorAll<HTMLElement>('[role="menu"] [role="menuitem"]'))
        await expect(items.map((item) => item.textContent)).toEqual(['Last ned', 'Arkiver', 'Slett'])
        await expect(items[1]).toHaveAttribute('aria-disabled', 'true')
        await expect(getComputedStyle(items[2]!).color).toBe(tokenColor('--colors-error-500'))

        await userEvent.click(items[2]!)
        await expect(onDelete).toHaveBeenCalledTimes(1)
        await waitFor(() => expect(document.querySelector('[role="menu"]')).toBeNull())
        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
        await waitFor(() => expect(document.activeElement).toBe(trigger))
        await expect(noNavigation).not.toHaveBeenCalled()
    })

    it('lets the app draw its own popover from ⋮ with menu.render', async () => {
        const { card } = renderCard({
            menu: {
                render: ({ open, close }) =>
                    open ? (
                        <div role='dialog' aria-label='Eget'>
                            <button type='button' onClick={close}>
                                Lukk
                            </button>
                        </div>
                    ) : null,
            },
        })
        const trigger = card.querySelector<HTMLElement>('[aria-haspopup="dialog"]:not([data-card-link])')!

        await expect(trigger).toHaveAccessibleName(`Flere handlinger for «${TITLE}»`)
        await userEvent.click(trigger)
        await expect(document.querySelector('[role="dialog"][aria-label="Eget"]')).not.toBeNull()
        await userEvent.click(document.querySelector<HTMLElement>('[aria-label="Eget"] button')!)
        await expect(document.querySelector('[aria-label="Eget"]')).toBeNull()
        await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('starts the footer with its buttons and ends it with the CTA', async () => {
        const { card } = renderCard({ footerAction: <button type='button'>Signer</button> })
        const sign = card.querySelector<HTMLElement>('[data-card-control] button')!.getBoundingClientRect()
        const cta = card.querySelector<HTMLElement>('[id$="-cta"]')!.getBoundingClientRect()

        await expect(sign.left - card.getBoundingClientRect().left).toBeLessThan(24)
        await expect(cta.right).toBeGreaterThan(card.getBoundingClientRect().right - 24)
    })

    it('opens from the whole card when a CTA label says it opens, even with controls', async () => {
        const { card } = renderCard({ footerAction: <button type='button'>Signer</button> })
        const rect = card.getBoundingClientRect()
        const body = card.querySelector<HTMLElement>('p')!.getBoundingClientRect()

        await expect(card).toHaveAttribute('data-model', 'partial')
        await clickAt(card, body.left - rect.left + body.width / 2, body.top - rect.top + body.height / 2)
        await expect(noNavigation).toHaveBeenCalledTimes(1)
    })

    it('without a CTA label opens from its title row only, never from the body (Figma note 5021:142373)', async () => {
        await parkPointer()
        const { card, link } = renderCard({ cta: undefined, checkbox: { checked: false, onChange: vi.fn() } })
        const rect = card.getBoundingClientRect()
        const row = card.querySelector<HTMLElement>('[data-card-title-row]')!.getBoundingClientRect()
        const body = card.querySelector<HTMLElement>('p')!.getBoundingClientRect()

        await clickAt(card, body.left - rect.left + body.width / 2, body.top - rect.top + body.height / 2)
        await clickAt(card, 8, rect.height - 6)
        await expect(noNavigation).not.toHaveBeenCalled()

        await userEvent.hover(card.querySelector('p')!)
        await expect(backgroundOf(card)).toBe('rgb(255, 255, 255)')

        await clickAt(card, row.right - rect.left - 4, row.top - rect.top + row.height / 2)
        await expect(noNavigation).toHaveBeenCalledTimes(1)
        await userEvent.hover(link!)
        await waitFor(() => expect(backgroundOf(card)).toBe(DELTA_50))
    })

    it('gives every control at least a 40 × 40 hit area', async () => {
        const { card } = renderPartial()
        const controls = Array.from(card.querySelectorAll<HTMLElement>('[data-card-control]'))

        await expect(controls.length).toBeGreaterThanOrEqual(4)
        for (const control of controls) {
            const { width, height } = control.getBoundingClientRect()
            await expect(width).toBeGreaterThanOrEqual(40)
            await expect(height).toBeGreaterThanOrEqual(40)
        }
    })

    it('hovers the card from its surface, and only the control from a control', async () => {
        await parkPointer()
        const { card } = renderPartial()

        await userEvent.hover(card.querySelector('h3')!)
        await waitFor(() => expect(backgroundOf(card)).toBe(DELTA_50))
        await userEvent.hover(card.querySelector('[aria-haspopup="menu"]')!)
        await waitFor(() => expect(backgroundOf(card)).toBe('rgb(255, 255, 255)'))
    })

    it('shows a checked card only in its checkbox: the edge and fill stay as they are (Figma, F2)', async () => {
        const { card } = renderCard({ checkbox: { checked: true, onChange: vi.fn() } })

        await expect(getComputedStyle(card).borderTopColor).toBe(tokenColor('--colors-delta-300'))
        await expect(backgroundOf(card)).toBe('rgb(255, 255, 255)')
    })

    it('keeps an unavailable checkbox from toggling or opening the card', async () => {
        const onCheck = vi.fn()
        const { card } = renderCard({ checkbox: { checked: false, onChange: onCheck, disabledReason: 'Arkivert' } })

        await userEvent.click(card.querySelector('label[for]')!, { force: true })
        await expect(onCheck).not.toHaveBeenCalled()
        await expect(noNavigation).not.toHaveBeenCalled()
    })
})
