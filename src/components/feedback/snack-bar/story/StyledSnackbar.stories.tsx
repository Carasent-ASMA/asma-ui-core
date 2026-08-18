import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, waitFor, within } from 'storybook/test'
import { ChevronRightIcon } from '../../../icons'
import { StyledDialog } from '../../dialog/StyledDialog'
import { StyledButton } from '../../../inputs/button/StyledButton'
import type { AlertColor } from '../StyledAlert'
import { SnackbarProvider } from '../SnackbarProvider'
import { processDefaultSnackbar } from '../processDefaultSnackbar'
import {
    StyledDefaultSnackbar,
    type StyledDefaultSnackbarProps,
} from '../components/StyledDefaultSnackbar'

const SEVERITIES: AlertColor[] = ['success', 'info', 'warning', 'error']

const MESSAGE: Record<AlertColor, string> = {
    success: 'Your changes have been saved successfully.',
    info: 'A new version is available. Refresh to update.',
    warning: 'Your session will expire in 5 minutes.',
    error: 'Something went wrong while saving. Please try again.',
}

const TITLE: Record<AlertColor, string> = {
    success: 'Success',
    info: 'Info',
    warning: 'Warning',
    error: 'Error',
}

const snackbarAction = (
    <StyledButton
        dataTest='snackbar-action'
        variant='text'
        size='small'
        endIcon={<ChevronRightIcon width={20} height={20} />}
    >
        Action
    </StyledButton>
)

// ponytail: StyledDefaultSnackbar consumes notistack's `CustomContentProps` (delivered at runtime by
// the provider). For a static gallery we only need the presentational fields, so the notistack-internal
// props are cast in — the SnackbarProvider wrapper keeps `useSnackbar()` (close button) working.
const toast = (severity: AlertColor, over: Partial<StyledDefaultSnackbarProps> = {}): StyledDefaultSnackbarProps =>
    ({
        id: `snackbar-${severity}`,
        variant: 'default',
        message: MESSAGE[severity],
        severity,
        title: TITLE[severity],
        action: snackbarAction,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        iconVariant: {},
        hideIconVariant: false,
        style: {},
        persist: true,
        autoHideDuration: null,
        ...over,
    }) as unknown as StyledDefaultSnackbarProps

/**
 * Assert the browser really would deliver a click to `element` — the check that separates a fixed
 * snackbar from a broken one.
 *
 * A modal `<dialog>` lives in the browser top layer and marks everything outside its subtree `inert`.
 * `elementFromPoint` skips inert nodes, so it resolves to `element` only when it is BOTH painted above
 * the dialog AND hit-testable; a body-portalled toast resolves to the dialog's backdrop instead, no
 * matter how high its z-index. Retried because notistack slides the toast in over ~300ms.
 */
const expectHitTestable = async (element: HTMLElement): Promise<void> => {
    await waitFor(() => {
        const { left, top, width, height } = element.getBoundingClientRect()
        const topmost = document.elementFromPoint(left + width / 2, top + height / 2)
        expect(element.contains(topmost)).toBe(true)
    })
}

const Section = ({ heading, children }: { heading: string; children: React.ReactNode }): JSX.Element => (
    <div className='flex flex-col gap-3'>
        <h4 className='m-0 text-sm font-semibold text-delta-600'>{heading}</h4>
        <div className='flex flex-wrap gap-4'>{children}</div>
    </div>
)

const meta: Meta<typeof StyledDefaultSnackbar> = {
    title: 'Feedback/Snackbar',
    component: StyledDefaultSnackbar,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'Figma: [System notification-toast](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=22249-56927) — 400px card, radius 4px, `alerts/{severity}` token set (fill -50, border -300, warning border -500). Rendered via `SnackbarProvider` + `enqueueSnackbar` / `processDefaultSnackbar` (variant `default`).',
            },
        },
    },
    decorators: [
        (Story) => (
            <SnackbarProvider>
                <Story />
            </SnackbarProvider>
        ),
    ],
}

export default meta
type Story = StoryObj<typeof StyledDefaultSnackbar>

/** Canonical Figma default: severity title + body, trailing action, close button. */
export const Default: Story = {
    render: () => <StyledDefaultSnackbar {...toast('success')} />,
}

/** All four severities with the full layout (title + message + action + close). */
export const AllVariants: Story = {
    render: () => (
        <div className='flex flex-col gap-8'>
            <Section heading='Severities (title + message + action)'>
                {SEVERITIES.map((severity) => (
                    <StyledDefaultSnackbar key={severity} {...toast(severity)} />
                ))}
            </Section>

            <Section heading='Without action (Action = off)'>
                {SEVERITIES.map((severity) => (
                    <StyledDefaultSnackbar key={severity} {...toast(severity, { action: undefined })} />
                ))}
            </Section>

            <Section heading='Without title (Show Label = off)'>
                {SEVERITIES.map((severity) => (
                    <StyledDefaultSnackbar
                        key={severity}
                        {...toast(severity, { title: undefined, action: undefined })}
                    />
                ))}
            </Section>
        </div>
    ),
    play: async ({ canvas }) => {
        const toasts = canvas.getAllByRole('alert')
        // 4 severities × 3 sections = 12 rendered toasts.
        await expect(toasts.length).toBe(12)
        await expect(canvas.getAllByText('Success').length).toBeGreaterThan(0)
        await expect(canvas.getAllByText('Error').length).toBeGreaterThan(0)
    },
}

/**
 * Layering regression guard: a toast raised from inside an open `StyledDialog` — the Inbox "Send SMS"
 * flow. The dialog is a native `<dialog>` in the browser **top layer**, which outranks every z-index
 * in the page, so the toast has to render inside the dialog's own subtree to be seen at all. See
 * `useTopLayer.hook` / `SnackbarProvider`.
 */
export const InsideDialog: Story = {
    render: () => (
        <StyledDialog open onClose={() => undefined} dataTest='snackbar-dialog' dialogTitle='Send SMS'>
            <div className='p-6'>
                <StyledButton
                    dataTest='enqueue-in-dialog'
                    variant='outlined'
                    onClick={() =>
                        processDefaultSnackbar(MESSAGE.success, {
                            severity: 'success',
                            title: TITLE.success,
                            persist: true,
                        })
                    }
                >
                    Send SMS
                </StyledButton>
            </div>
        </StyledDialog>
    ),
    play: async ({ canvasElement, userEvent }) => {
        // The dialog portals out of the canvas root, so query the whole document.
        const canvas = within(canvasElement.ownerDocument.body)
        await userEvent.click(canvas.getByRole('button', { name: 'Send SMS' }))

        const toast = await waitFor(() => canvas.getByRole('alert'))
        // The mechanism: the stack is re-parented into the open modal rather than left in <body>.
        await expect(canvas.getByTestId('snackbar-dialog').contains(toast)).toBe(true)
        await expectHitTestable(within(toast).getByRole('button', { name: 'close' }))
    },
}

// Nested dialogs must open SEQUENTIALLY to model reality: top-layer order is `showModal()` call
// order, and mounting both in one commit inverts it (React runs the child's layout effect first, so
// the inner dialog would open — and therefore stack — below the outer one).
const NestedDialogsHarness = (): JSX.Element => {
    const [nestedOpen, setNestedOpen] = useState(false)
    const [outerOpen, setOuterOpen] = useState(true)

    return (
        <StyledDialog
            open={outerOpen}
            onClose={() => undefined}
            dataTest='outer-dialog'
            dialogTitle='Outer dialog'
            showCloseIcon={false}
        >
            <div className='flex gap-3 p-6'>
                <StyledButton dataTest='open-nested' variant='outlined' onClick={() => setNestedOpen(true)}>
                    Open nested
                </StyledButton>
                <StyledButton dataTest='close-outer' variant='outlined' onClick={() => setOuterOpen(false)}>
                    Close outer
                </StyledButton>
            </div>

            <StyledDialog
                open={nestedOpen}
                onClose={() => undefined}
                dataTest='nested-dialog'
                dialogTitle='Nested dialog'
                showCloseIcon={false}
            >
                <div className='flex gap-3 p-6'>
                    <StyledButton
                        dataTest='enqueue-nested'
                        variant='outlined'
                        onClick={() =>
                            processDefaultSnackbar(MESSAGE.success, {
                                severity: 'success',
                                title: TITLE.success,
                                persist: true,
                            })
                        }
                    >
                        Send SMS
                    </StyledButton>
                    <StyledButton dataTest='close-nested' variant='outlined' onClick={() => setNestedOpen(false)}>
                        Close nested
                    </StyledButton>
                </div>
            </StyledDialog>
        </StyledDialog>
    )
}

/**
 * Layering regression guard: the stack must follow the **topmost** modal as dialogs unwind, and a toast
 * must OUTLIVE the dialog it was raised from — the "SMS sent, dialog closes" flow. Only the topmost
 * modal's subtree is non-inert, so hosting the stack in any other open dialog occludes it again.
 */
export const NestedDialogs: Story = {
    render: () => <NestedDialogsHarness />,
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement.ownerDocument.body)
        await userEvent.click(canvas.getByRole('button', { name: 'Open nested' }))
        await waitFor(() => expect(canvas.getByTestId('nested-dialog')).toBeInTheDocument())
        await userEvent.click(canvas.getByRole('button', { name: 'Send SMS' }))

        const toast = await waitFor(() => canvas.getByRole('alert'))
        const closeButton = within(toast).getByRole('button', { name: 'close' })

        // Raised from the nested dialog → hosted by the nested dialog, not the outer one.
        await expect(canvas.getByTestId('nested-dialog').contains(toast)).toBe(true)
        await expectHitTestable(closeButton)

        // Nested dialog closes: the same toast node survives and follows the new topmost modal.
        await userEvent.click(canvas.getByRole('button', { name: 'Close nested' }))
        await waitFor(() => expect(canvas.getByTestId('outer-dialog').contains(toast)).toBe(true))
        await expectHitTestable(closeButton)

        // Last dialog closes: the toast is still the same live node, now back in <body>.
        await userEvent.click(canvas.getByRole('button', { name: 'Close outer' }))
        await waitFor(() => expect(canvas.queryByTestId('outer-dialog')).toBeNull())
        await expect(canvas.getByRole('alert')).toBe(toast)
        await expectHitTestable(closeButton)
    },
}

/** Real usage: trigger positioned, auto-stacking toasts through `processDefaultSnackbar`. */
export const Interactive: Story = {
    render: () => (
        <div className='flex flex-wrap gap-3'>
            {SEVERITIES.map((severity) => (
                <StyledButton
                    key={severity}
                    dataTest={`enqueue-${severity}`}
                    variant='outlined'
                    onClick={() =>
                        processDefaultSnackbar(MESSAGE[severity], {
                            severity,
                            title: TITLE[severity],
                        })
                    }
                >
                    Show {severity}
                </StyledButton>
            ))}
        </div>
    ),
}
