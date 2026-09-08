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
        /* The full string is the accessible name; the native tooltip is added only once the
         * 2-line clamp is measured as actually truncating, so SSR carries no title attribute. */
        expect(html).not.toContain('title="Inbox and outbox"')
    })

    it('owns the heading and exposes the host selector contract via titleDataTest', () => {
        const html = renderToStaticMarkup(<PageHeader title='Home' titleDataTest='page-title' />)

        /* Both attribute styles: `data-test` is the hosts' and e2e suites' existing
         * `page-title` contract, `data-testid` is the ui-core convention. */
        expect(html).toContain('data-test="page-title"')
        expect(html).toContain('data-testid="page-title"')
        expect(html).toContain('<h1')
    })

    it('renders no heading for an empty title (an empty h1 is an a11y defect)', () => {
        const html = renderToStaticMarkup(<PageHeader title='' titleDataTest='page-title' />)

        expect(html).not.toContain('<h1')
        expect(html).not.toContain('data-test="page-title"')
    })

    it('renders one heading element per state, so focus survives loading and search flips', () => {
        /* The heading node identity must not depend on loading/search: a state flip that
         * unmounts the focused heading drops the focus to <body>. */
        for (const props of [{}, { loading: true }, { search: <input />, searchOpen: true }]) {
            const html = renderToStaticMarkup(<PageHeader title='Documents' {...props} />)

            expect(html.split('<h1').length - 1).toBe(1)
        }
    })

    it('keeps the heading programmatically focusable for route-change focus', () => {
        const html = renderToStaticMarkup(<PageHeader title='Home' />)

        expect(html).toContain('tabindex="-1"')
    })

    it('clamps the title to a 2-line max at every width (AC: wrap then truncate)', () => {
        const html = renderToStaticMarkup(<PageHeader title='A very long page title' />)

        expect(html).toContain('line-clamp-2')
    })

    it('measures the title as an unconstrained nowrap copy, not the clamped heading', () => {
        /* Inline elements report scrollWidth 0, so the natural width must come from the
         * measurement strip copy (whitespace-nowrap) — the visible h1 stays clamped. */
        const html = renderToStaticMarkup(<PageHeader title='Measured title' />)

        expect(html).toContain('whitespace-nowrap')
        const stripCopyCount = html.split('Measured title').length - 1
        expect(stripCopyCount).toBeGreaterThanOrEqual(2)
    })

    it('uses the same base height at every width', () => {
        const html = renderToStaticMarkup(<PageHeader title='Home' />)

        expect(html).toContain('min-h-[64px]')
        expect(html).not.toContain('min-h-[72px]')
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

    it('loading keeps the leading control and the route heading, replacing only title/actions', () => {
        const html = renderToStaticMarkup(
            <PageHeader title='Home' loading leading='back' onLeadingClick={noop} actions={[bellAction]} />,
        )

        expect(html).toContain('animate-pulse')
        expect(html).toContain('data-testid="page-header-back"')
        /* Heading semantics survive as a visually hidden h1. */
        expect(html).toContain('<h1')
        expect(html).toContain('sr-only')
    })

    it('search mode keeps the leading control and heading semantics next to the search slot', () => {
        const html = renderToStaticMarkup(
            <PageHeader
                title='Home'
                searchOpen
                onSearchClose={noop}
                leading='back'
                onLeadingClick={noop}
                search={<input data-test='the-search' />}
                actions={[bellAction]}
            />,
        )

        expect(html).toContain('data-test="the-search"')
        expect(html).toContain('data-testid="page-header-search-close"')
        expect(html).toContain('data-testid="page-header-back"')
        expect(html).toContain('<h1')
        expect(html).toContain('sr-only')
    })

    it('sticky variant pins to the top on the page background token and renders the scroll sentinel', () => {
        const html = renderToStaticMarkup(<PageHeader title='Home' sticky />)

        expect(html).toContain('sticky')
        expect(html).toContain('bg-delta-50')
        expect(html).toContain('data-stuck="false"')
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
})
