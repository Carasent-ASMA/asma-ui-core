import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { ContentCopyIcon, DeleteOutlineIcon, SaveIcon } from 'src/components/icons'
import { StyledCheckbox } from 'src/components/inputs/checkbox'
import { StyledFormControlLabel } from 'src/components/miscellaneous/StyledFormControlLabel'
import type { DynamicToolbarAction } from '../../../../custom/module/header-layout/planToolbarActions'
import { StyledDialogFooter } from '../StyledDialogFooter'

const noop = () => undefined

const deleteAction: DynamicToolbarAction = {
    id: 'delete',
    label: 'Delete',
    icon: <DeleteOutlineIcon width={24} height={24} />,
    onClick: noop,
    tone: 'danger',
    priority: 100,
}

const extraActions: DynamicToolbarAction[] = [
    { id: 'copy', label: 'Make copy', icon: <ContentCopyIcon width={20} height={20} />, onClick: noop, priority: 80 },
    { id: 'standard', label: 'Use as standard', onClick: noop, priority: 70 },
    deleteAction,
]

const longExtraActions: DynamicToolbarAction[] = [
    {
        id: 'copy',
        label: 'Make a copy of this event',
        icon: <ContentCopyIcon width={20} height={20} />,
        onClick: noop,
        priority: 80,
    },
    { id: 'standard', label: 'Use as standard template', onClick: noop, priority: 70 },
    { ...deleteAction, label: 'Delete this event series' },
]

/** Figma frames the footer inside a dialog paper, so the stories do too. */
const Paper = ({ width, children }: { width: number; children: React.ReactNode }) => (
    <div className='overflow-hidden rounded-lg border border-solid border-delta-200 bg-white' style={{ width }}>
        <div className='px-4 py-6 text-delta-700'>Dialogue body</div>
        {children}
    </div>
)

const meta = {
    title: 'Feedback/DialogFooter',
    component: StyledDialogFooter,
    parameters: { layout: 'padded' },
} satisfies Meta<typeof StyledDialogFooter>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The four approved action counts at the 600px desktop width, then the same
 * footer at the 360px mobile width — one static frame per Figma cell.
 */
export const Gallery: Story = {
    render: () => (
        <div className='flex flex-col gap-4'>
            {[
                {
                    caption: '1 action — primary only',
                    width: 600,
                    props: { primaryAction: { label: 'Stay logged in', onClick: noop } },
                },
                {
                    caption: '2 actions — Cancel + primary (Create)',
                    width: 600,
                    props: {
                        secondaryAction: { label: 'Cancel', onClick: noop },
                        primaryAction: { label: 'Add new time', onClick: noop },
                    },
                },
                {
                    caption: '3 actions — destructive left + Cancel + primary (Edit)',
                    width: 600,
                    props: {
                        leftActions: [deleteAction],
                        secondaryAction: { label: 'Cancel', onClick: noop },
                        primaryAction: { label: 'Save changes', onClick: noop },
                    },
                },
                {
                    /* Labels collapse before anything overflows, so at 600px three actions still
                     * fit — the icon-less one keeps its label. The More state is the 360px cell
                     * below and the Reflow story. */
                    caption: '3+ actions — labels collapse to icons before anything overflows',
                    width: 600,
                    props: {
                        leftActions: longExtraActions,
                        secondaryAction: { label: 'Cancel', onClick: noop },
                        primaryAction: { label: 'Save changes', onClick: noop },
                    },
                },
                {
                    caption: 'Reset filter — labelled utility left, text-variant reset right',
                    width: 600,
                    props: {
                        leftActions: [
                            {
                                id: 'save-filter',
                                label: 'Save filter',
                                icon: <SaveIcon width={24} height={24} />,
                                onClick: noop,
                            },
                        ],
                        primaryAction: { label: 'Reset filter', onClick: noop, variant: 'text' as const },
                    },
                },
                {
                    caption: 'Mobile 360 — destructive collapses to icon-only',
                    width: 360,
                    props: {
                        leftActions: [deleteAction],
                        secondaryAction: { label: 'Cancel', onClick: noop },
                        primaryAction: { label: 'Save changes', onClick: noop },
                    },
                },
                {
                    caption: 'Mobile 360 — three left actions collapse into More',
                    width: 360,
                    props: {
                        leftActions: extraActions,
                        secondaryAction: { label: 'Avbryt', onClick: noop },
                        primaryAction: { label: 'Legg til ny', onClick: noop },
                    },
                },
                {
                    caption: 'Checkbox+Label left variant via leadingSlot',
                    width: 600,
                    props: {
                        leadingSlot: (
                            <StyledFormControlLabel
                                label='Notify participants'
                                /* StyledFormControlLabel does not yet associate its text with the
                                 * input (pre-existing ui-core defect — see docs/a11y-allowlist.md),
                                 * so the accessible name is set explicitly rather than adding this
                                 * new story to that allowlist. */
                                control={<StyledCheckbox dataTest='notify' aria-label='Notify participants' />}
                            />
                        ),
                        secondaryAction: { label: 'Cancel', onClick: noop },
                        primaryAction: { label: 'Save changes', onClick: noop },
                    },
                },
            ].map(({ caption, width, props }) => (
                <div key={caption} className='flex flex-col gap-1'>
                    <span className='text-sm text-delta-700'>{caption}</span>
                    <div className='w-fit border border-dashed border-delta-300'>
                        <div style={{ width }}>
                            <StyledDialogFooter {...props} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    ),
}

/** Live: the footer plans against its container, so shrinking the container reflows it. */
export const Reflow: Story = {
    render: () => (
        <div className='flex flex-col gap-6'>
            {[600, 470, 420, 360, 320].map((width) => (
                <div key={width} className='flex flex-col gap-1'>
                    <span className='text-sm text-delta-700'>{width}px container</span>
                    <Paper width={width}>
                        <StyledDialogFooter
                            leftActions={extraActions}
                            secondaryAction={{ label: 'Cancel', onClick: noop }}
                            primaryAction={{ label: 'Save changes', onClick: noop }}
                        />
                    </Paper>
                </div>
            ))}
        </div>
    ),
}

export const Fixed: Story = {
    render: () => (
        <div
            className='flex flex-col overflow-y-auto rounded-lg border border-solid border-delta-200'
            style={{ width: 600, height: 260 }}
        >
            <div className='shrink-0 px-4 py-6 text-delta-700' style={{ height: 600 }}>
                Scroll — the footer stays pinned with the DS “Fixed bottom” shadow.
            </div>
            <StyledDialogFooter
                fixed
                rounded={false}
                leftActions={[deleteAction]}
                secondaryAction={{ label: 'Cancel', onClick: noop }}
                primaryAction={{ label: 'Save changes', onClick: noop }}
            />
        </div>
    ),
}

/** Behaviour: overflow actions stay reachable, and the menu opens above the footer. */
export const OverflowMenuOpensUpward: Story = {
    render: () => (
        <div style={{ marginTop: 240 }}>
            <Paper width={360}>
                <StyledDialogFooter
                    leftActions={extraActions}
                    secondaryAction={{ label: 'Cancel', onClick: noop }}
                    primaryAction={{ label: 'Save changes', onClick: noop }}
                />
            </Paper>
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)

        /* At 360px the three left actions cannot fit, so they live behind More. */
        const more = await waitFor(() => canvas.getByRole('button', { name: 'More' }))
        await expect(canvas.queryByRole('button', { name: 'Make copy' })).not.toBeInTheDocument()
        /* The right cluster is never overflowed. */
        await expect(canvas.getByRole('button', { name: 'Save changes' })).toBeVisible()
        await expect(canvas.getByRole('button', { name: 'Cancel' })).toBeVisible()

        await userEvent.click(more)

        const item = await waitFor(() => within(document.body).getByText('Make copy'))
        await expect(item).toBeVisible()
        await expect(within(document.body).getByText('Use as standard')).toBeVisible()
        await expect(within(document.body).getByText('Delete')).toBeVisible()

        /* Opens upward: the menu sits above the trigger, not below it. */
        const menuRect = item.getBoundingClientRect()
        const moreRect = more.getBoundingClientRect()
        expect(menuRect.top).toBeLessThan(moreRect.top)
    },
}

/** A single left action keeps its label while it fits, rather than hiding behind More. */
export const SingleLeftActionStaysInline: Story = {
    render: () => (
        <Paper width={600}>
            <StyledDialogFooter
                leftActions={[deleteAction]}
                secondaryAction={{ label: 'Cancel', onClick: noop }}
                primaryAction={{ label: 'Save changes', onClick: noop }}
            />
        </Paper>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement)

        await waitFor(async () => expect(canvas.getByRole('button', { name: 'Delete' })).toBeVisible())
        await expect(canvas.queryByRole('button', { name: 'More' })).not.toBeInTheDocument()
    },
}
