import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
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
                    'Accessibility: the title renders as the route h1 (`focusTitleOnMount` moves focus to it ' +
                    'on route change), wraps to a 2-line max then truncates while the full string stays the ' +
                    'accessible name, icon-only controls carry aria-labels, targets are ≥40×40px, and the ' +
                    'badge conveys a number — never colour alone. With `sticky`, give the scroll container ' +
                    '`scroll-padding-top` equal to the header height so pinned headers never cover focused content.',
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

/** Scrolled / sticky — the header pins to the top of the scroll container on the page background. */
export const StickyOnScroll: Story = {
    render: () => (
        <Frame width={744}>
            <div className='h-64 overflow-y-auto [scroll-padding-top:72px]'>
                <PageHeader title='Scrolled page' sticky actions={[notificationsAction, primaryAction]} />
                <div className='flex flex-col gap-3 p-4'>
                    {Array.from({ length: 20 }, (_, index) => (
                        <div key={index} className='rounded bg-delta-50 p-3 text-sm text-delta-700'>
                            Content row {index + 1}
                        </div>
                    ))}
                </div>
            </div>
        </Frame>
    ),
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

/** Search mode (mobile) — the row is replaced by the search slot + Close. */
export const SearchMode: Story = {
    render: function SearchModeStory() {
        const [open, setOpen] = useState(true)
        const [value, setValue] = useState('query')

        return (
            <Frame width={360}>
                <PageHeader
                    title='Home'
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
