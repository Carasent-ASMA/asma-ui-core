import React, { useMemo, useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, userEvent, waitForElementToBeRemoved } from 'storybook/test'
import { EditSquareIcon } from 'asma-ui-icons'
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
                PaperProps={{
                    sx: {
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'auto',
                        minHeight: '360px',
                        maxWidth: '680px',
                        width: '100%',
                        maxHeight: '100%',
                        height: '100%',
                    },
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
        const dialog = screen.getByRole('dialog')
        await userEvent.click(screen.getByTestId('dialog-save-button'))

        await waitForElementToBeRemoved(dialog)

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
        const dialog = screen.getByRole('dialog')
        await userEvent.keyboard('{Escape}')
        await waitForElementToBeRemoved(dialog)
    },
}

export const BackdropClickCloses: Story = {
    render: (args) => <DialogStoryFrame {...args} />,
    play: async ({}) => {
        const dialog = await screen.findByRole('dialog')

        //NOTE:  hacky relying on mui class name
        const backdrop = document.querySelector('.MuiBackdrop-root')
        await expect(backdrop).toBeTruthy()

        await userEvent.click(backdrop as Element)
        await waitForElementToBeRemoved(dialog)
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
