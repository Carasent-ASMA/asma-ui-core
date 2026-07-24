import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { ChevronRightIcon } from '../../../icons'
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
