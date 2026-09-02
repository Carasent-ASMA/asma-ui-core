import React, { useMemo, useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, userEvent, waitForElementToBeRemoved } from 'storybook/test'
import { EditSquareIcon } from 'src/components/icons'
import { StyledButton } from '../../../inputs/button/StyledButton'
import { StyledDialog } from '../StyledDialog'
import { StyledDialogActions } from '../StyledDialogActions'
import { StyledDialogContent } from '../StyledDialogContent'

type StoryArgs = {
    open?: boolean
    fullScreen?: boolean
    showCloseIcon?: boolean
    onCloseText?: ReactNode
    dialogLabel?: ReactNode
    dialogTitle?: ReactNode
    dialogHeaderNode?: ReactNode
    children?: ReactNode
}

const meta = {
    title: 'Feedback/Dialog',
    component: StyledDialog,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Figma: [Dialog](https://www.figma.com/design/wXrXt5uKNNzV2DnQCgyYZH/Design-System?node-id=15820-18954) — modal radius 8px, typical width 400px.',
            },
        },
    },
    argTypes: {
        open: { control: 'boolean' },
        fullScreen: { control: 'boolean' },
        showCloseIcon: { control: 'boolean' },
        onCloseText: { control: 'text' },
    },
    args: {
        open: true,
        fullScreen: false,
        showCloseIcon: true,
        onCloseText: 'Close',
        dialogLabel: 'Story about Liro (label)',
        dialogTitle: 'Story about Liro (title)',
    },
} satisfies Meta<typeof StyledDialog>

export default meta

type Story = StoryObj<StoryArgs>

const dialogBody = (
    <div
        tabIndex={0}
        style={{
            padding: 16,
            fontSize: 18,
            maxHeight: '100%',
            overflow: 'auto',
            outline: 'none',
            scrollbarWidth: 'thin',
        }}
    >
        Once in a bustling city park, where the noise seldom dwindled, there lived a small, yet incredibly vibrant bird
        named Liro.
        <br />
        <br />
        As days passed, Liro became the self-appointed guardian of a hidden garden. He would perform acrobatic flights
        to entertain the flowers, imagining them applauding in the gentle sway of their stems.
        <br />
        <br />
        One day, an artist discovered the garden and captured the moment on canvas. The story spread through the city,
        inspiring people to look closer at the world around them.
    </div>
)

function DialogStoryFrame(props: StoryArgs) {
    const {
        open: initialOpen = true,
        fullScreen = false,
        showCloseIcon = true,
        onCloseText = 'Close',
        dialogLabel = 'Story about Liro (label)',
        dialogTitle = 'Story about Liro (title)',
        dialogHeaderNode,
        children,
    } = props

    const [open, setOpen] = useState(initialOpen)
    const [backdropDisabled, setBackdropDisabled] = useState(false)

    const closeDialog = () => setOpen(false)
    const openDialog = () => setOpen(true)

    const headerNode = useMemo(
        () =>
            dialogHeaderNode ?? (
                <StyledButton
                    dataTest='dialog-edit-button'
                    size='small'
                    variant='text'
                    startIcon={<EditSquareIcon height={20} width={20} />}
                >
                    Edit
                </StyledButton>
            ),
        [dialogHeaderNode],
    )

    const content = children ?? dialogBody

    return (
        <div className='min-h-screen p-6'>
            <StyledButton dataTest='dialog-open-button' variant='contained' onClick={openDialog}>
                Open dialog
            </StyledButton>

            <div className='mt-4 flex items-center gap-3'>
                <StyledButton dataTest='dialog-reset-button' variant='outlined' onClick={() => setOpen(initialOpen)}>
                    Reset
                </StyledButton>
                <StyledButton
                    dataTest='dialog-toggle-backdrop-button'
                    variant='outlined'
                    onClick={() => setBackdropDisabled((value) => !value)}
                >
                    Toggle backdrop click blocking
                </StyledButton>
            </div>

            <StyledDialog
                dataTest='styled-dialog'
                open={open}
                fullScreen={fullScreen}
                onClose={(_, reason) => {
                    if (backdropDisabled && reason === 'backdropClick') return
                    closeDialog()
                }}
                onCloseText={onCloseText}
                showCloseIcon={showCloseIcon}
                dialogLabel={dialogLabel}
                dialogTitle={dialogTitle}
                dialogHeaderNode={headerNode}
                slotProps={{
                    paper: {
                        sx: {
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            minHeight: '360px',
                            maxWidth: '680px',
                            width: '100%',
                            maxHeight: '100%',
                            height: '100%',
                        },
                    },
                    backdrop: { 'data-testid': 'dialog-backdrop' } as Record<string, unknown>,
                }}
            >
                {content}
                <StyledDialogActions>
                    <StyledButton dataTest='dialog-cancel-button' variant='outlined' onClick={closeDialog}>
                        Cancel
                    </StyledButton>
                    <StyledButton dataTest='dialog-save-button' variant='contained' onClick={closeDialog}>
                        Save
                    </StyledButton>
                </StyledDialogActions>
            </StyledDialog>
        </div>
    )
}

export const Default: Story = {
    render: (args) => <DialogStoryFrame {...args} />,
    play: async ({ canvas }) => {
        const dialogRemoved = waitForElementToBeRemoved(() => screen.queryByRole('dialog'))
        await userEvent.click(screen.getByTestId('dialog-save-button'))

        await dialogRemoved

        // keep the open button available for reruns / visual inspection
        await expect(canvas.getByTestId('dialog-open-button')).toBeInTheDocument()
    },
}

export const ClosedByDefault: Story = {
    args: {
        open: false,
    },
    render: (args) => <DialogStoryFrame {...args} />,
    play: async ({ canvas }) => {
        await expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

        await userEvent.click(canvas.getByTestId('dialog-open-button'))
        await expect(await screen.findByRole('dialog')).toBeInTheDocument()
    },
}

export const EscapeCloses: Story = {
    render: (args) => <DialogStoryFrame {...args} />,
    play: async () => {
        const dialogRemoved = waitForElementToBeRemoved(() => screen.queryByRole('dialog'))
        await userEvent.keyboard('{Escape}')
        await dialogRemoved
    },
}

export const BackdropClickCloses: Story = {
    render: (args) => <DialogStoryFrame {...args} />,
    play: async ({}) => {
        const dialogRemoved = waitForElementToBeRemoved(() => screen.queryByRole('dialog'))
        const backdrop = await screen.findByTestId('dialog-backdrop')

        await userEvent.click(backdrop)
        await dialogRemoved
    },
}

export const Headerless: Story = {
    args: {
        showCloseIcon: false,
        dialogLabel: undefined,
        dialogTitle: undefined,
        onCloseText: undefined,
    },
    render: (args) => <DialogStoryFrame {...args} />,
}

export const CustomHeaderNode: Story = {
    args: {
        dialogHeaderNode: (
            <StyledButton dataTest='dialog-custom-header-button' size='small' variant='text'>
                Custom header action
            </StyledButton>
        ),
    },
    render: (args) => <DialogStoryFrame {...args} />,
}

export const FullScreen: Story = {
    args: {
        fullScreen: true,
    },
    render: (args) => <DialogStoryFrame {...args} />,
}

export const LongContentScrollable: Story = {
    render: (args) => {
        const longText = Array.from({ length: 16 }, (_, index) => (
            <p key={index} style={{ marginTop: index === 0 ? 0 : 16 }}>
                {index + 1}. Liro watched the flowers sway in the breeze, and the city slowly softened around the secret
                garden.
            </p>
        ))

        return (
            <DialogStoryFrame
                {...args}
                dialogTitle='Scrollable content'
                dialogLabel='Long content'
                dialogHeaderNode={undefined}
            >
                <StyledDialogContent>{longText}</StyledDialogContent>
            </DialogStoryFrame>
        )
    },
}

/**
 * `scroll='body'` + `fullScreen` — the shape the storage document dialogs use. The paper must stack
 * the header above the content across the full width; while `flex-col` was gated on
 * `scroll === 'paper'` the paper stayed a flex ROW and the two sat side by side at ~half width each,
 * squeezing an embedded document editor into the right half (ASMA-8069).
 *
 * Deliberately does NOT go through `DialogStoryFrame`, whose paper `sx` forces `flexDirection:
 * 'column'` and would mask the regression.
 */
export const BodyScrollFullScreen: Story = {
    render: () => (
        <StyledDialog
            dataTest='styled-dialog-body-scroll'
            open
            fullScreen
            scroll='body'
            onCloseText='Close'
            dialogTitle='Body scroll, full screen'
        >
            <div data-testid='body-scroll-content' className='h-40 bg-delta-100 p-4'>
                This content must span the full paper width, below the header — not beside it.
            </div>
        </StyledDialog>
    ),
    play: async () => {
        const paper = (await screen.findByTestId('body-scroll-content')).parentElement
        await expect(paper).not.toBeNull()
        await expect(getComputedStyle(paper as HTMLElement).flexDirection).toBe('column')
    },
}

/** Wide, non-wrapping content must show a horizontal scrollbar (not clip or hide it). */
export const HorizontalScroll: Story = {
    render: (args) => (
        <DialogStoryFrame
            {...args}
            dialogTitle='Wide content'
            dialogLabel='Horizontal scroll'
            dialogHeaderNode={undefined}
        >
            <StyledDialogContent>
                <div style={{ width: 1200, whiteSpace: 'nowrap' }}>
                    This single row is 1200px wide — wider than the dialog — so the content area must scroll
                    horizontally and keep the scrollbar visible: {Array.from({ length: 24 }, (_, i) => `col-${i + 1}`).join(' · ')}
                </div>
            </StyledDialogContent>
        </DialogStoryFrame>
    ),
}
