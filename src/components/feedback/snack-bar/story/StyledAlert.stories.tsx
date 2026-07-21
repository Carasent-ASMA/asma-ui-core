import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { StyledButton } from '../../../inputs/button/StyledButton'
import { ChevronRightIcon } from '../../../icons'
import { StyledAlert, type AlertColor } from '../StyledAlert'

/**
 * Figma: [Inline notification](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=22249-56917)
 * — `standard` variant = `alerts/{sev}-50` fill + `-300` border, neutral delta-800 body, severity-700
 * icon accent. Gallery reference node 33305-233709. `filled`/`outlined` have no DS node (MUI-compat).
 */
const meta = {
    title: 'Feedback/Alert',
    component: StyledAlert,
    tags: [],
    parameters: {
        docs: {
            description: {
                component:
                    'Inline notification banner. `standard` is the DS variant (soft-tint + border + severity-700 icon); `filled`/`outlined` are MUI-compat only.',
            },
        },
    },
    args: {
        severity: 'info',
        variant: 'standard',
        children: 'A new version is available. Refresh to update.',
    },
} satisfies Meta<typeof StyledAlert>

export default meta
type Story = StoryObj<typeof StyledAlert>

const SEVERITIES: AlertColor[] = ['info', 'success', 'warning', 'error']

const LABEL: Record<AlertColor, string> = {
    info: 'Info',
    success: 'Success',
    warning: 'Warning',
    error: 'Error',
}

const MESSAGE: Record<AlertColor, string> = {
    info: 'A new version is available. Refresh to update.',
    success: 'Your changes have been saved successfully.',
    warning: 'Your session will expire in 5 minutes.',
    error: 'The database connection failed.',
}

export const Default: Story = {}

/**
 * Gallery — replicates the Figma "Inline notifications" set: one `standard` banner per severity
 * (info/success/warning/error) with the severity icon + bold label + message, plus the action and
 * close slots. This is the golden VRT reference for the Alert.
 */
export const Gallery: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
            {SEVERITIES.map((severity) => (
                <StyledAlert key={severity} severity={severity} variant='standard'>
                    <span className='font-semibold'>{LABEL[severity]}.</span> {MESSAGE[severity]}
                </StyledAlert>
            ))}

            <StyledAlert severity='info' variant='standard' onClose={fn()}>
                <span className='font-semibold'>Dismissible.</span> This notification has a close button.
            </StyledAlert>

            <StyledAlert
                severity='success'
                variant='standard'
                action={
                    <StyledButton
                        dataTest='alert-action'
                        variant='text'
                        size='small'
                        endIcon={<ChevronRightIcon width={20} height={20} />}
                    >
                        Action
                    </StyledButton>
                }
            >
                <span className='font-semibold'>With action.</span> This notification has a trailing action.
            </StyledAlert>
        </div>
    ),
}
