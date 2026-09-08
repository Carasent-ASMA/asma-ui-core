import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { BellOutlineIcon, PlusIcon, ShareIcon } from 'src/components/icons'
import { StyledSearchField } from 'src/components/inputs/search-field'
import { PageHeader, type PageHeaderAction } from './PageHeader'

const noop = () => undefined

const notificationsAction: PageHeaderAction = {
    id: 'notifications',
    label: 'Notifications',
    icon: <BellOutlineIcon width={24} height={24} />,
    onClick: noop,
    canHideLabel: true,
    keepVisible: true,
    priority: 90,
    badgeCount: 56,
}

const primaryAction: PageHeaderAction = {
    id: 'new-chat',
    label: 'New chat',
    icon: <PlusIcon width={20} height={20} />,
    onClick: noop,
    variant: 'contained',
    canHideLabel: true,
    keepVisible: true,
    priority: 100,
}

const secondaryActions: PageHeaderAction[] = [
    {
        id: 'share',
        label: 'Share',
        icon: <ShareIcon width={20} height={20} />,
        onClick: noop,
        canHideLabel: true,
        priority: 70,
    },
    { id: 'export', label: 'Export', onClick: noop, priority: 60 },
    { id: 'archive', label: 'Archive', onClick: noop, priority: 50 },
]

const Frame = ({ width, children }: { width: number; children: React.ReactNode }) => (
    <div className='rounded-lg border border-delta-200 bg-white' style={{ width }}>
        {children}
    </div>
)

const meta = {
    title: 'Modules/PageHeader',
    component: PageHeader,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'One shared page header for all systems (Ad Voca, Samhandling, Ad Opus, Genesis), ' +
                    'adaptive to the measured container width (ASMA-7622). Actions collapse labels and ' +
                    'overflow into "More" by priority; Back/Menu and the title never overflow. ' +
                    'Accessibility: the component owns the route h1 (`titleDataTest` keeps host selector ' +
                    'contracts, `focusKey` moves focus to it on every route change), wraps to a 2-line max ' +
                    'then truncates while the full string stays the accessible name, icon-only controls carry ' +
                    'aria-labels, targets are ≥40×40px, and the badge conveys a number — never colour alone. ' +
                    'The base height is identical at every width; content may expand it. With `sticky`, the ' +
                    'header compacts once scrolled (`data-stuck`) — give the scroll container ' +
                    '`scroll-padding-top` at least the compacted header height so pinned headers never cover ' +
                    'focused content.',
            },
        },
    },
    args: { title: 'Page title' },
} satisfies Meta<typeof PageHeader>

export default meta

type Story = StoryObj<typeof meta>

/** Root page — title + notifications + primary action (desktop 1262px). */
export const RootDesktop: Story = {
    render: () => (
        <Frame width={1262}>
            <PageHeader title='Overview' actions={[notificationsAction, primaryAction]} />
        </Frame>
    ),
}

/** Root page at tablet width — labels still visible. */
export const RootTablet: Story = {
    render: () => (
        <Frame width={744}>
            <PageHeader title='Overview' actions={[notificationsAction, primaryAction]} />
        </Frame>
    ),
}

/** Root page at mobile width — primary action collapses to icon-only. */
export const RootMobile: Story = {
    render: () => (
        <Frame width={360}>
            <PageHeader title='Overview' actions={[notificationsAction, primaryAction]} />
        </Frame>
    ),
}

/** Nested page — Back control (never overflows) + title. */
export const NestedDesktop: Story = {
    render: () => (
        <Frame width={1262}>
            <PageHeader title='Page title' leading='back' onLeadingClick={noop} actions={[notificationsAction]} />
        </Frame>
    ),
}

/** Nested page on mobile — Back collapses to an icon-only arrow. */
export const NestedMobile: Story = {
    render: () => (
        <Frame width={360}>
            <PageHeader title='Page title' leading='back' onLeadingClick={noop} actions={[notificationsAction]} />
        </Frame>
    ),
}

/** Menu leading control (mobile root pattern). */
export const MenuMobile: Story = {
    render: () => (
        <Frame width={360}>
            <PageHeader title='Home' leading='menu' onLeadingClick={noop} actions={[notificationsAction]} />
        </Frame>
    ),
}

/** Object detail — many actions; low-priority ones reflow into the More menu. */
export const ActionsReflow: Story = {
    render: () => (
        <div className='flex flex-col gap-4'>
            <Frame width={1262}>
                <PageHeader
                    title='Inbox and outbox'
                    actions={[notificationsAction, primaryAction, ...secondaryActions]}
                />
            </Frame>
            <Frame width={744}>
                <PageHeader
                    title='Inbox and outbox'
                    actions={[notificationsAction, primaryAction, ...secondaryActions]}
                />
            </Frame>
            <Frame width={360}>
                <PageHeader
                    title='Inbox and outbox'
                    actions={[notificationsAction, primaryAction, ...secondaryActions]}
                />
            </Frame>
        </div>
    ),
}

/** Long titles wrap to a 2-line max, then truncate — the full string stays the accessible name. */
export const LongTitle: Story = {
    render: () => (
        <div className='flex flex-col gap-4'>
            <Frame width={744}>
                <PageHeader
                    title='Physiotherapy follow-up after knee surgery physiotherapy follow-up after knee surgery'
                    actions={[notificationsAction]}
                />
            </Frame>
            <Frame width={360}>
                <PageHeader
                    title='Physiotherapy follow-up after knee surgery physiotherapy follow-up after knee surgery'
                    actions={[notificationsAction]}
                />
            </Frame>
        </div>
    ),
}

/** Long Norwegian title — verifies wrapping/clamping with long compound words. */
export const LongTitleNorwegian: Story = {
    render: () => (
        <div className='flex flex-col gap-4'>
            <Frame width={744}>
                <PageHeader
                    title='Kartleggingsskjema for helseatferd og livsstilsendringer i primærhelsetjenesten'
                    actions={[notificationsAction]}
                />
            </Frame>
            <Frame width={360}>
                <PageHeader
                    title='Kartleggingsskjema for helseatferd og livsstilsendringer i primærhelsetjenesten'
                    actions={[notificationsAction]}
                />
            </Frame>
        </div>
    ),
}

/** Minimum supported width — 320 CSS px (WCAG reflow / 400% zoom). */
export const MinimumWidth320: Story = {
    render: () => (
        <Frame width={320}>
            <PageHeader
                title='Inbox and outbox'
                leading='back'
                onLeadingClick={noop}
                actions={[notificationsAction, primaryAction, ...secondaryActions]}
            />
        </Frame>
    ),
}

/** Scrolled / sticky — pins to the top of the scroll container and compacts once stuck
 * (`data-stuck`): tighter padding, smaller type, subtitle hidden. The component writes
 * its measured height as scroll-padding-top on the scroll container, so keyboard focus
 * never lands under the pinned header — even with a 2-line title taller than the base. */
export const StickyOnScroll: Story = {
    render: () => (
        <Frame width={744}>
            <div data-testid='sticky-scroll-container' className='h-64 overflow-y-auto'>
                <PageHeader
                    title='A deliberately long scrolled page title that wraps onto two full lines even when compacted'
                    subtitle='Context line — hidden while the header is stuck'
                    sticky
                    actions={[notificationsAction, primaryAction]}
                />
                <div className='flex flex-col gap-3 p-4'>
                    {Array.from({ length: 20 }, (_, index) => (
                        <div
                            key={index}
                            tabIndex={0}
                            data-testid={`content-row-${index + 1}`}
                            className='rounded bg-delta-50 p-3 text-sm text-delta-700'
                        >
                            Content row {index + 1}
                        </div>
                    ))}
                </div>
            </div>
        </Frame>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const header = canvas.getByTestId('page-header')
        const scroller = canvas.getByTestId('sticky-scroll-container')

        await expect(header).toHaveAttribute('data-stuck', 'false')
        await expect(canvas.getByText('Context line — hidden while the header is stuck')).toBeVisible()

        /* The measured header height (not a fixed constant) is the scroll padding. */
        await waitFor(async () => {
            const padding = Number.parseFloat(scroller.style.scrollPaddingTop)
            expect(padding).toBeGreaterThanOrEqual(header.getBoundingClientRect().height - 1)
        })

        scroller.scrollTop = 400
        scroller.dispatchEvent(new Event('scroll'))

        await waitFor(async () => expect(header).toHaveAttribute('data-stuck', 'true'))
        await expect(
            canvas.queryByText('Context line — hidden while the header is stuck'),
        ).not.toBeInTheDocument()

        /* Keyboard focus below the fold must not end up covered by the pinned header:
         * the browser honours scroll-padding-top when scrolling the focused element
         * into view, so its top edge stays at or below the header's bottom edge. */
        const rowAbove = canvas.getByTestId('content-row-2')
        rowAbove.focus()
        await waitFor(async () => {
            const headerBottom = header.getBoundingClientRect().bottom
            const rowTop = rowAbove.getBoundingClientRect().top
            expect(rowTop).toBeGreaterThanOrEqual(headerBottom - 1)
        })

        scroller.scrollTop = 0
        scroller.dispatchEvent(new Event('scroll'))
        await waitFor(async () => expect(header).toHaveAttribute('data-stuck', 'false'))
    },
}

/** Error / offline — expressed through the status slot, never colour alone. */
export const ErrorOrOffline: Story = {
    render: () => (
        <Frame width={744}>
            <PageHeader
                title='Consultation note'
                leading='back'
                onLeadingClick={noop}
                status={
                    <span className='rounded-full bg-warning-100 px-2 py-0.5 text-sm font-semibold text-warning-800'>
                        Offline — changes not saved
                    </span>
                }
                actions={[{ id: 'retry', label: 'Retry', onClick: noop, priority: 100, keepVisible: true }]}
            />
        </Frame>
    ),
}

/* --- System configuration examples: one component, four configurations. --- */

/** Ad Voca — care-receiver language, one clear next action, mobile-first. */
export const SystemAdVoca: Story = {
    render: () => (
        <Frame width={360}>
            <PageHeader
                title='My activities'
                leading='menu'
                onLeadingClick={noop}
                actions={[
                    notificationsAction,
                    {
                        id: 'continue',
                        label: 'Continue',
                        onClick: noop,
                        variant: 'contained',
                        priority: 100,
                        keepVisible: true,
                    },
                ]}
            />
        </Frame>
    ),
}

/** Samhandling — patient context and a locked/sent clinical state. */
export const SystemSamhandling: Story = {
    render: () => (
        <Frame width={1042}>
            <PageHeader
                title='Kartlegging — Ola Nordmann'
                subtitle='Sent to Ad Curis · 26 Aug 2026'
                leading='back'
                onLeadingClick={noop}
                status={
                    <span className='rounded-full bg-delta-100 px-2 py-0.5 text-sm font-semibold text-delta-700'>
                        Locked
                    </span>
                }
                actions={[
                    { id: 'print', label: 'Print', onClick: noop, priority: 60 },
                    { id: 'copy', label: 'Copy to new', onClick: noop, priority: 80, keepVisible: true },
                ]}
            />
        </Frame>
    ),
}

/** Ad Opus — participant context, working on behalf of a caseworker. */
export const SystemAdOpus: Story = {
    render: () => (
        <Frame width={1042}>
            <PageHeader
                title='Kari Hansen'
                subtitle='Working on behalf of NAV Grünerløkka'
                leading='back'
                onLeadingClick={noop}
                actions={[notificationsAction, ...secondaryActions]}
            />
        </Frame>
    ),
}

/** Genesis — configuration context with save, publish, and validation states. */
export const SystemGenesis: Story = {
    render: () => (
        <Frame width={1262}>
            <PageHeader
                title='Questionnaire template — Health check v3'
                leading='back'
                onLeadingClick={noop}
                status={
                    <span className='rounded-full bg-success-100 px-2 py-0.5 text-sm font-semibold text-success-800'>
                        Valid — all fields mapped
                    </span>
                }
                actions={[
                    { id: 'save-draft', label: 'Save draft', onClick: noop, priority: 80 },
                    {
                        id: 'publish',
                        label: 'Publish',
                        onClick: noop,
                        variant: 'contained',
                        priority: 100,
                        keepVisible: true,
                    },
                ]}
            />
        </Frame>
    ),
}

/** Subtitle / context line under the title. */
export const WithSubtitle: Story = {
    render: () => (
        <Frame width={360}>
            <PageHeader
                title='Introduction to the module'
                subtitle='Health Behavior and Lifestyle Questionnaires'
                actions={[notificationsAction]}
            />
        </Frame>
    ),
}

/** Loading — skeleton bars, no actions. */
export const Loading: Story = {
    render: () => (
        <div className='flex flex-col gap-4'>
            <Frame width={1042}>
                <PageHeader title='Loading' loading />
            </Frame>
            <Frame width={360}>
                <PageHeader title='Loading' loading />
            </Frame>
        </div>
    ),
}

/** Search mode (mobile) — the search slot + Close replace title/actions; nav stays. */
export const SearchMode: Story = {
    render: function SearchModeStory() {
        const [open, setOpen] = useState(true)
        const [value, setValue] = useState('query')

        return (
            <Frame width={360}>
                <PageHeader
                    title='Home'
                    leading='back'
                    onLeadingClick={noop}
                    searchOpen={open}
                    onSearchClose={() => setOpen(false)}
                    search={
                        <StyledSearchField
                            dataTest='page-header-search'
                            label='Search'
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                            onClear={() => setValue('')}
                        />
                    }
                    actions={[notificationsAction]}
                />
            </Frame>
        )
    },
}

/* --- Browser acceptance tests (run via the storybook vitest project) --- */

/** The natural title width is measured (not 0), so a long title pushes low-priority
 * actions into overflow — "prioritise title before secondary labels". At 640px the
 * measured title reserves half the container and Archive must overflow; with
 * measurement broken (120px minimum reserve) even the collapsed actions all fit and
 * no More menu appears — this test goes red. Role queries only see visible controls —
 * the aria-hidden measurement strip is excluded. */
export const AcceptanceTitleMeasurement: Story = {
    tags: ['!autodocs'],
    render: () => (
        <Frame width={640}>
            <PageHeader
                title='Physiotherapy follow-up after knee surgery and rehabilitation programme'
                actions={[notificationsAction, primaryAction, ...secondaryActions]}
            />
        </Frame>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const heading = await canvas.findByRole('heading', { level: 1 })

        /* The measured title reserves ~half the container, so the planner must demote
         * the lowest-priority action (Archive — icon-less, so it cannot collapse) into
         * the More menu. With measurement broken (120px minimum reserve) every labelled
         * action fits at this width and no More menu appears — this goes red. */
        await waitFor(async () => {
            expect(canvas.queryByRole('button', { name: 'Archive' })).not.toBeInTheDocument()
            expect(canvas.getByRole('button', { name: 'More' })).toBeVisible()
        })

        /* The heading is visually clamped but keeps the full accessible name, and the
         * kept actions stay visible. */
        await expect(heading).toHaveAccessibleName(
            'Physiotherapy follow-up after knee surgery and rehabilitation programme',
        )
        await expect(canvas.getByRole('button', { name: 'New chat' })).toBeVisible()

        /* Layout invariant: the visible action group must not intrude into the space
         * the measured title reserved. */
        const headingRect = heading.getBoundingClientRect()
        const moreRect = canvas.getByRole('button', { name: 'More' }).getBoundingClientRect()
        expect(moreRect.left).toBeGreaterThanOrEqual(headingRect.right)
    },
}

/** Focus moves to the route heading whenever focusKey changes (route navigation). */
export const AcceptanceRouteFocus: Story = {
    tags: ['!autodocs'],
    render: function RouteFocusStory() {
        const [route, setRoute] = useState('/inbox')

        return (
            <Frame width={744}>
                <button data-testid='navigate' onClick={() => setRoute('/outbox')}>
                    Navigate
                </button>
                <PageHeader
                    title={route === '/inbox' ? 'Inbox' : 'Outbox'}
                    titleDataTest='page-title'
                    focusKey={route}
                />
            </Frame>
        )
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const heading = await canvas.findByRole('heading', { level: 1 })

        /* Initial render must not steal focus. */
        await expect(heading).not.toHaveFocus()

        await userEvent.click(canvas.getByTestId('navigate'))

        await waitFor(async () => expect(canvas.getByRole('heading', { level: 1 })).toHaveFocus())
        await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('Outbox')
    },
}

/** Opening search moves focus into the search field; closing restores it. */
export const AcceptanceSearchFocus: Story = {
    tags: ['!autodocs'],
    render: function SearchFocusStory() {
        const [open, setOpen] = useState(false)
        const [value, setValue] = useState('')

        return (
            <Frame width={744}>
                <PageHeader
                    title='Home'
                    leading='back'
                    onLeadingClick={noop}
                    searchOpen={open}
                    onSearchClose={() => setOpen(false)}
                    search={
                        <StyledSearchField
                            dataTest='page-header-search'
                            label='Search'
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                            onClear={() => setValue('')}
                        />
                    }
                    actions={[
                        {
                            id: 'open-search',
                            label: 'Search',
                            onClick: () => setOpen(true),
                            keepVisible: true,
                            dataTest: 'open-search-action',
                        },
                    ]}
                />
            </Frame>
        )
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)
        const openButton = await canvas.findByTestId('open-search-action')

        await userEvent.click(openButton)

        /* Focus transfers into the search field… */
        await waitFor(async () => {
            const input = canvasElement.querySelector<HTMLInputElement>('input')
            expect(input).not.toBeNull()
            expect(input).toHaveFocus()
        })
        /* …navigation stays through search mode… */
        await expect(canvas.getByTestId('page-header-back')).toBeVisible()

        await userEvent.click(canvas.getByTestId('page-header-search-close'))

        /* …and closing restores focus. The invoker unmounted while search was open
         * (React recreated the button), so focus falls back to the route heading —
         * never lost to <body>. */
        await waitFor(async () => expect(canvas.getByRole('heading', { level: 1 })).toHaveFocus())
    },
}

/** Loading keeps the leading navigation and the (visually hidden) route heading. */
export const AcceptanceLoadingKeepsNavigation: Story = {
    tags: ['!autodocs'],
    render: () => (
        <Frame width={744}>
            <PageHeader title='Documents' loading leading='back' onLeadingClick={noop} actions={[primaryAction]} />
        </Frame>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)

        await expect(await canvas.findByTestId('page-header-back')).toBeVisible()
        const heading = canvas.getByRole('heading', { level: 1 })
        await expect(heading).toHaveTextContent('Documents')
        await expect(canvas.getByTestId('page-header')).toHaveAttribute('aria-busy', 'true')
    },
}
