import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'
import { StyledButton } from '../../../inputs/button/StyledButton'
import { SnackbarProvider } from '../SnackbarProvider'
import { message } from '../message'
import { StyledInfoSnackbar } from '../components/StyledInfoSnackbar'

type PillProps = ComponentProps<typeof StyledInfoSnackbar>

/**
 * The exact pill surface `message.info` / `message.loading` enqueue in production
 * (see `processMessageInfo`) — the Figma "Snackbar": brand `gama-700` fill, white text,
 * max text line 400px.
 */
const PILL_CLASS = 'flex h-10 items-center gap-1 rounded-lg bg-gama-700 pl-2 pr-1 text-sm text-white !min-w-[100px] w-fit !max-w-[400px]'

// ponytail: StyledInfoSnackbar consumes notistack's `CustomContentProps` (delivered at runtime by
// the provider). For a static gallery we only need the presentational fields, so the notistack-internal
// props are cast in — the SnackbarProvider wrapper keeps `useSnackbar()` (close button) working.
const pill = (id: string, over: Partial<PillProps> = {}): PillProps =>
    ({
        id,
        variant: 'info',
        message: 'Your changes have been saved.',
        className: PILL_CLASS,
        anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
        iconVariant: {},
        hideIconVariant: false,
        style: {},
        persist: true,
        autoHideDuration: null,
        ...over,
    }) as unknown as PillProps

const undoAction = (
    <StyledButton dataTest='snackbar-undo' variant='textWhite' size='small'>
        Undo
    </StyledButton>
)

const meta: Meta<typeof StyledInfoSnackbar> = {
    title: 'Feedback/Snackbar',
    component: StyledInfoSnackbar,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: [
                    'The **Snackbar** (Figma "Snackbar", brand pill) — trigger via `message.info` / `message.error` / `message.loading` from `asma-ui-core`.',
                    '',
                    'Usage rules:',
                    '',
                    '- Triggered by **user actions**; gives brief confirmation or feedback, with an optional undo/retry action.',
                    '- Max text line length: **400px** (`!max-w-[400px]` on the pill).',
                    '- Placed at the **bottom of the UI, centered**, in front of content (`anchorOrigin: bottom/center`).',
                    '- **Auto-dismisses after 6 seconds** when no warning or required action; can be closed manually via `closeButton` or the disposer returned by `message.*`.',
                    '- Color follows the brand theme token `gama-700`: **Blue** (default), **Green** (greenish), **Fretex** — see the Color themes story.',
                    '',
                    'For standalone severity toasts (success/info/warning/error cards, top-right) see **Feedback/Toast Notification**; for notifications embedded in page content see **Feedback/Inline Notification**.',
                ].join('\n'),
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
type Story = StoryObj<typeof StyledInfoSnackbar>

/** Plain confirmation pill — in production it auto-dismisses after 6 seconds. */
export const Default: Story = {
    render: () => <StyledInfoSnackbar {...pill('snackbar-default')} />,
}

/** With an action button (undo/retry) embedded in the message node, plus manual close. */
export const WithAction: Story = {
    render: () => (
        <StyledInfoSnackbar
            {...pill('snackbar-action', {
                message: (
                    <span className='flex items-center gap-1'>
                        <span className='pl-1 pr-2'>Message archived</span>
                        {undoAction}
                    </span>
                ),
                closeButton: true,
            })}
        />
    ),
}

/** Hover state: the close affordance highlights with `gama-500` and shows a pointer cursor. */
export const Hover: Story = {
    parameters: { pseudo: { hover: true } },
    render: () => <StyledInfoSnackbar {...pill('snackbar-hover', { closeButton: true })} />,
}

/** Loading state with spinner — `message.loading('Importing chat…')`; dismissed via the returned disposer. */
export const Loading: Story = {
    render: () => <StyledInfoSnackbar {...pill('snackbar-loading', { message: 'Importing chat…', type: 'loading' })} />,
}

const THEME_BY_NAME: Record<string, 'greenish' | 'default' | 'fretex'> = {
    Green: 'greenish',
    Blue: 'default',
    Fretex: 'fretex',
}

/** The pill under each brand theme — `gama-700` resolves per `data-theme`: Green / Blue / Fretex. */
export const ColorThemes: Story = {
    render: () => (
        <div className='flex flex-col gap-4'>
            {Object.entries(THEME_BY_NAME).map(([name, theme]) => (
                <div key={name} className='flex items-center gap-4' data-theme={theme}>
                    <span className='w-16 text-sm font-semibold text-delta-600'>{name}</span>
                    <StyledInfoSnackbar {...pill(`snackbar-${theme}`, { closeButton: true })} />
                </div>
            ))}
        </div>
    ),
}

/** Real usage: bottom-centered pills via the `message` helpers (6s auto-dismiss, stacking). */
export const Interactive: Story = {
    render: () => (
        <div className='flex flex-wrap gap-3'>
            <StyledButton
                dataTest='show-info'
                variant='outlined'
                onClick={() => message.info('Your changes have been saved.', { closeButton: true })}
            >
                message.info
            </StyledButton>
            <StyledButton
                dataTest='show-action'
                variant='outlined'
                onClick={() =>
                    message.info(
                        <span className='flex items-center gap-1'>
                            <span className='pl-1 pr-2'>Message archived</span>
                            {undoAction}
                        </span>,
                        { closeButton: true },
                    )
                }
            >
                With action
            </StyledButton>
            <StyledButton
                dataTest='show-loading'
                variant='outlined'
                onClick={() => {
                    const dispose = message.loading('Importing chat…', { persist: true })
                    setTimeout(dispose, 4000)
                }}
            >
                message.loading
            </StyledButton>
            <StyledButton
                dataTest='show-error'
                variant='outlined'
                onClick={() => message.error('Something went wrong. Please try again.')}
            >
                message.error
            </StyledButton>
        </div>
    ),
}
