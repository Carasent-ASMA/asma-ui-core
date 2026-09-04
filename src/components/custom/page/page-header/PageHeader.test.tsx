import { renderToStaticMarkup } from 'react-dom/server'
import { beforeAll, describe, expect, it } from 'vitest'
import { PageHeader, toToolbarAction, type PageHeaderAction } from './PageHeader'

/* SSR in the Node test env: stub the browser globals StyledPopover probes. */
beforeAll(() => {
    Object.assign(globalThis, { Element: class {}, HTMLDialogElement: class {} })
})

const noop = () => undefined

const bellAction: PageHeaderAction = {
    id: 'notifications',
    label: 'Notifications',
    icon: <span aria-hidden>B</span>,
    onClick: noop,
    badgeCount: 56,
}

describe('PageHeader (ASMA-7622)', () => {
    it('renders the title as an h1 with the full string in the DOM', () => {
        const html = renderToStaticMarkup(<PageHeader title='Inbox and outbox' />)

        expect(html).toContain('<h1')
        expect(html).toContain('Inbox and outbox')
        expect(html).toContain('title="Inbox and outbox"')
    })

    it('clamps the title to a 2-line max at every width (AC: wrap then truncate)', () => {
        const html = renderToStaticMarkup(<PageHeader title='A very long page title' />)

        expect(html).toContain('line-clamp-2')
        expect(html).not.toContain('whitespace-nowrap text-2xl')
    })

    it('renders the status slot next to the title', () => {
        const html = renderToStaticMarkup(
            <PageHeader title='Note' status={<span data-test='offline-chip'>Offline</span>} />,
        )

        expect(html).toContain('data-test="offline-chip"')
    })

    it('supports a custom heading level', () => {
        const html = renderToStaticMarkup(<PageHeader title='Section' titleAs='h2' />)

        expect(html).toContain('<h2')
        expect(html).not.toContain('<h1')
    })

    it('renders the badge count on actions', () => {
        const html = renderToStaticMarkup(<PageHeader title='Home' actions={[bellAction]} />)

        expect(html).toContain('>56<')
        expect(html).toContain('page-header-action-notifications-badge')
        /* The count is part of the accessible name and survives into the More overflow,
         * whose items render the plain label. */
        expect(html).toContain('aria-label="Notifications (56)"')
    })

    it('never lets an icon-less action collapse its label into a blank button', () => {
        /* The planner treats undefined canHideLabel as collapsible; the adapter must only
         * allow collapse when an icon remains to represent the action. */
        expect(toToolbarAction({ id: 'save', label: 'Save', onClick: noop }).canHideLabel).toBe(false)
        expect(toToolbarAction(bellAction).canHideLabel).toBe(true)
        expect(
            toToolbarAction({ ...bellAction, canHideLabel: false }).canHideLabel,
        ).toBe(false)
    })

    it('gives the icon-only menu control an accessible name', () => {
        const html = renderToStaticMarkup(
            <PageHeader title='Home' leading='menu' onLeadingClick={noop} leadingLabel='Open menu' />,
        )

        expect(html).toContain('aria-label="Open menu"')
    })

    it('renders the back control outside the actions plan so it can never overflow', () => {
        const html = renderToStaticMarkup(<PageHeader title='Detail' leading='back' onLeadingClick={noop} />)

        expect(html).toContain('data-testid="page-header-back"')
    })

    it('loading replaces title and actions with skeleton bars', () => {
        const html = renderToStaticMarkup(<PageHeader title='Home' loading actions={[bellAction]} />)

        expect(html).toContain('animate-pulse')
        expect(html).not.toContain('<h1')
    })

    it('search mode replaces the title row with the search slot and a close button', () => {
        const html = renderToStaticMarkup(
            <PageHeader
                title='Home'
                searchOpen
                onSearchClose={noop}
                search={<input data-test='the-search' />}
                actions={[bellAction]}
            />,
        )

        expect(html).toContain('data-test="the-search"')
        expect(html).toContain('data-testid="page-header-search-close"')
        expect(html).not.toContain('<h1')
    })

    it('sticky variant pins to the top on the page background token', () => {
        const html = renderToStaticMarkup(<PageHeader title='Home' sticky />)

        expect(html).toContain('sticky')
        expect(html).toContain('bg-delta-50')
    })

    it('leadingSlot renders a custom node instead of the built-in control and wins over leading', () => {
        const html = renderToStaticMarkup(
            <PageHeader
                title='Home'
                leading='back'
                onLeadingClick={noop}
                leadingSlot={<button data-test='widget-back'>W</button>}
            />,
        )

        expect(html).toContain('data-test="widget-back"')
        expect(html).not.toContain('data-testid="page-header-back"')
    })

    it('titleSlot replaces the built-in heading so the host keeps its own title contract', () => {
        const html = renderToStaticMarkup(
            <PageHeader title='Home' titleSlot={<h1 data-test='page-title'>Custom</h1>} />,
        )

        expect(html).toContain('data-test="page-title"')
        expect(html).not.toContain('title="Home"')
    })

    it('focusTitleOnMount makes the heading programmatically focusable', () => {
        const html = renderToStaticMarkup(<PageHeader title='Home' focusTitleOnMount />)

        expect(html).toContain('tabindex="-1"')
    })
})
