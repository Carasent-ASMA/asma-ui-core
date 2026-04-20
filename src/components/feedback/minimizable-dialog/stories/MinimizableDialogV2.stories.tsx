import React, { useMemo, useState, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent } from 'storybook/test'
import { EditSquareIcon } from 'asma-ui-icons'
import { StyledButton } from 'src/components/inputs/button/StyledButton'
import { MinimizableDialogV2 } from '../v2'
import { StyledDialogActions, StyledDialogContent } from '../../dialog'

type StoryArgs = {
    open?: boolean
    title?: ReactNode
    label?: ReactNode
    showCloseIcon?: boolean
    showMinimizeIcon?: boolean
    showExpandIcon?: boolean
    enableFullscreen?: boolean
    locale?: 'en' | 'no'
    actionNode?: ReactNode
    children?: ReactNode
}

const meta = {
    title: 'Feedback/Minimizable Dialog V2',
    component: MinimizableDialogV2,
    parameters: {
        layout: 'fullscreen',
    },
    argTypes: {
        open: { control: 'boolean' },
        title: { control: 'text' },
        label: { control: 'text' },
        showCloseIcon: { control: 'boolean' },
        showMinimizeIcon: { control: 'boolean' },
        showExpandIcon: { control: 'boolean' },
        enableFullscreen: { control: 'boolean' },
        locale: { control: 'radio', options: ['en', 'no'] },
    },
    args: {
        open: true,
        title: 'Liro and the hidden garden',
        label: 'Story about Liro',
        showCloseIcon: true,
        showMinimizeIcon: true,
        showExpandIcon: true,
        enableFullscreen: true,
        locale: 'en',
    },
} satisfies Meta<typeof MinimizableDialogV2>

export default meta

type Story = StoryObj<StoryArgs>

const storyBody = (
    <div
        tabIndex={0}
        data-testid='minimizable-dialog-content'
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

function getVisibleByTestId(canvas: { getAllByTestId: (testId: string) => HTMLElement[] }, testId: string) {
    const matches = canvas.getAllByTestId(testId)
    const visible = matches.find((element) => (element as HTMLElement).offsetParent !== null)

    if (!visible) {
        throw new Error(`No visible element found for data-testid="${testId}"`)
    }

    return visible
}

function MinimizableDialogStoryFrame(props: StoryArgs) {
    const {
        open: initialOpen = true,
        title = 'Liro and the hidden garden',
        label = 'Story about Liro',
        showCloseIcon = true,
        showMinimizeIcon = true,
        showExpandIcon = true,
        enableFullscreen = true,
        locale = 'en',
        actionNode,
        children,
    } = props

    const [open, setOpen] = useState(initialOpen)

    const dialogActionNode = useMemo(
        () =>
            actionNode ?? (
                <StyledButton
                    dataTest='dialog-edit-button'
                    size='small'
                    variant='text'
                    startIcon={<EditSquareIcon height={20} width={20} />}
                >
                    Edit
                </StyledButton>
            ),
        [actionNode],
    )

    return (
        <div className='min-h-screen p-6'>
            <div className='flex items-center gap-4'>
                <StyledButton dataTest='dialog-open-button' variant='contained' onClick={() => setOpen(true)}>
                    Open dialog
                </StyledButton>

                <StyledButton
                    dataTest='dialog-close-external-button'
                    variant='outlined'
                    className='ml-3'
                    onClick={() => setOpen(false)}
                >
                    Close dialog
                </StyledButton>
            </div>

            <MinimizableDialogV2
                dataTest='minimizable-dialog'
                open={open}
                onClose={() => setOpen(false)}
                title={title}
                label={label}
                locale={locale}
                showCloseIcon={showCloseIcon}
                showMinimizeIcon={showMinimizeIcon}
                showExpandIcon={showExpandIcon}
                enableFullscreen={enableFullscreen}
                actionNode={dialogActionNode}
                children={children ?? storyBody}
            />
        </div>
    )
}

export const Default: Story = {
    render: (args) => <MinimizableDialogStoryFrame {...args} />,
    play: async ({ canvas }) => {
        const closeButton = canvas.getByRole('button', { name: 'Close dialog' })

        await userEvent.click(closeButton)
        await expect(canvas.queryByTestId('minimizable-dialog-content')).not.toBeInTheDocument()

        await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }))
        await expect(canvas.getByTestId('minimizable-dialog-content')).toBeVisible()
    },
}

export const ClosedByDefault: Story = {
    args: {
        open: false,
    },
    render: (args) => <MinimizableDialogStoryFrame {...args} />,
    play: async ({ canvas }) => {
        await expect(canvas.queryByTestId('minimizable-dialog-content')).not.toBeInTheDocument()

        await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }))
        await expect(canvas.getByTestId('minimizable-dialog-content')).toBeVisible()
    },
}

export const MinimizeAndRestore: Story = {
    render: (args) => <MinimizableDialogStoryFrame {...args} />,
    play: async ({ canvas }) => {
        const body = canvas.getByTestId('minimizable-dialog-content')
        const minimizeButton = getVisibleByTestId(canvas, 'toggle-minimize-btn')

        await userEvent.click(minimizeButton)
        await expect(body.parentElement?.parentElement).toHaveClass(/hidden/i)

        const expandButton = getVisibleByTestId(canvas, 'toggle-minimize-btn')
        await userEvent.click(expandButton)
        await expect(body).toBeVisible()
    },
}

export const FullscreenToggle: Story = {
    render: (args) => <MinimizableDialogStoryFrame {...args} />,
    play: async ({ canvas }) => {
        const fullscreenButton = canvas.getByTestId('fullscreen-button')
        const overlaySelector = '[class*="bg-opacity-70"]'

        await userEvent.click(fullscreenButton)
        await expect(document.querySelector(overlaySelector)).toBeTruthy()

        await userEvent.click(fullscreenButton)
        await expect(document.querySelector(overlaySelector)).toBeNull()
    },
}

export const HeaderlessCompact: Story = {
    args: {
        label: undefined,
        showCloseIcon: false,
        showMinimizeIcon: false,
        showExpandIcon: false,
        enableFullscreen: false,
        title: 'Compact view',
    },
    render: (args) => <MinimizableDialogStoryFrame {...args} />,
}

export const CustomActionNode: Story = {
    args: {
        actionNode: (
            <StyledButton dataTest='dialog-custom-action-button' size='small' variant='text'>
                Custom action
            </StyledButton>
        ),
    },
    render: (args) => <MinimizableDialogStoryFrame {...args} />,
}

export const LabelLessVariant: Story = {
    args: {
        label: undefined,
        title: 'Title only dialog',
    },
    render: (args) => <MinimizableDialogStoryFrame {...args} />,
}

export const NorwegianLocale: Story = {
    args: {
        locale: 'no',
    },
    render: (args) => <MinimizableDialogStoryFrame {...args} />,
}

export const WithScrollableContent: Story = {
    args: {
        children: (
            <>
                <StyledDialogContent>
                    <div data-testid='minimizable-dialog-content'>
                        {Array.from({ length: 18 }, (_, index) => (
                            <p key={index} style={{ marginTop: index === 0 ? 0 : 16 }}>
                                {index + 1}. Liro kept wandering through the garden, and every new morning made the
                                colors a little brighter.
                            </p>
                        ))}
                    </div>
                </StyledDialogContent>
                <StyledDialogActions>
                    <StyledButton dataTest='dialog-secondary-action' variant='outlined' onClick={() => undefined}>
                        Cancel
                    </StyledButton>
                    <StyledButton dataTest='dialog-primary-action' variant='contained' onClick={() => undefined}>
                        Save
                    </StyledButton>
                </StyledDialogActions>
            </>
        ),
    },
    render: (args) => <MinimizableDialogStoryFrame {...args} />,
}
