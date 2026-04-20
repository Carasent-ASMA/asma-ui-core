import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import { StyledInputField, createDialogStack } from 'src'
import { StyledButton } from 'src/components/inputs/button'
import { StyledSelectExample } from 'src/components/inputs/select/story/components/StyledSelectExample'
import { expect, userEvent } from 'storybook/test'
import { MinimizableDialogV2 } from '../v2/MinimizableDialogV2'

type DialogId = 'dialog1' | 'dialog2'

type StackConfig = {
    dialog1: { order: 1 }
    dialog2: { order: 2; dependencies: readonly ['dialog1'] }
}

const config = {
    dialog1: { order: 1 },
    dialog2: { order: 2, dependencies: ['dialog1'] as const },
} satisfies StackConfig

const { DialogStackProvider, useDialogStack } = createDialogStack({
    config,
})

const meta = {
    title: 'Feedback/Dialog Minimizable Stack',
    parameters: {
        layout: 'fullscreen',
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

function isVisible(element: HTMLElement) {
    const style = window.getComputedStyle(element)
    return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        element.getClientRects().length > 0
    )
}

function getVisibleByTestId(
    canvas: {
        getAllByTestId: (id: string) => HTMLElement[]
    },
    testId: string,
    index = 0,
) {
    const matches = canvas.getAllByTestId(testId).filter(isVisible)
    const match = matches[index]

    if (!match) {
        throw new Error(`No visible element found for data-testid="${testId}" at index ${index}`)
    }

    return match
}

function dialogStyle(width: number | undefined, right: number | undefined): React.CSSProperties {
    return {
        '--dialog-right': `${right ?? 0}px`,
        width: `${width ?? 0}px`,
    } as React.CSSProperties
}

function LongBody({ testId }: { testId: string }) {
    return (
        <div className='flex flex-grow flex-col gap-y-3 overflow-auto px-4' data-testid={testId}>
            <div>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s.
            </div>
            <StyledSelectExample />
            <StyledInputField dataTest={`${testId}-input`} />
            <div>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s.
            </div>
            <div>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s.
            </div>
            <StyledSelectExample />
            <div>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
                industry's standard dummy text ever since the 1500s.
            </div>
        </div>
    )
}

function DialogShell({
    id,
    title,
    label,
    contentTestId,
}: {
    id: DialogId
    title: string
    label?: string
    contentTestId: string
}) {
    const { closeDialog, getDialogState } = useDialogStack()
    const dialog = getDialogState(id)

    const style = dialogStyle(dialog?.width, dialog?.position.right)

    return (
        <MinimizableDialogV2
            dataTest={`${id}-stack`}
            title={title}
            open={!!dialog?.open}
            onClose={() => closeDialog(id)}
            label={label}
            actionNode={
                <StyledButton dataTest={`${id}-edit-button`} variant='text'>
                    Edit
                </StyledButton>
            }
            style={style}
            classNameOverrides={{
                maximized: 'max-w-[600px]',
                fullscreen: 'max-w-[1000px]',
            }}
        >
            <LongBody testId={contentTestId} />

            <div className='flex flex-none flex-wrap items-center justify-between gap-4 p-4'>
                <div className='flex flex-col gap-0.5'>
                    <span className='text-sm font-semibold text-delta-800'>Sist optdatert</span>
                    <span className='text-sm'>03.04.2024 kl. 14.13</span>
                    <span className='text-sm'>av KristianAO</span>
                </div>

                <div className='flex flex-col gap-1'>
                    <span className='text-sm font-semibold text-delta-800'>Lagt til i registeret</span>
                    <span className='text-sm'>05.04.2024 kl. 14.13</span>
                    <span className='text-sm'>av Kristian Thyholdt</span>
                </div>

                <div className='flex items-center gap-x-2'>
                    <StyledButton dataTest={`${id}-cancel-btn`} variant='outlined' onClick={() => closeDialog(id)}>
                        Cancel
                    </StyledButton>
                    <StyledButton dataTest={`${id}-save-btn`} onClick={() => closeDialog(id)}>
                        Save
                    </StyledButton>
                </div>
            </div>
        </MinimizableDialogV2>
    )
}

function StackStoryFrame() {
    const { openDialog, closeDialog, getDialogState } = useDialogStack()

    const dialog1 = getDialogState('dialog1')
    const dialog2 = getDialogState('dialog2')

    return (
        <div className='min-h-screen p-6'>
            <div className='flex flex-wrap items-center gap-2'>
                <StyledButton dataTest='open-dialog-1' variant='outlined' onClick={() => openDialog('dialog1')}>
                    Open dialog 1
                </StyledButton>
                <StyledButton dataTest='open-dialog-2' variant='outlined' onClick={() => openDialog('dialog2')}>
                    Open dialog 2
                </StyledButton>
                <StyledButton dataTest='close-dialog-1' variant='outlined' onClick={() => closeDialog('dialog1')}>
                    Close dialog 1
                </StyledButton>
                <StyledButton dataTest='close-dialog-2' variant='outlined' onClick={() => closeDialog('dialog2')}>
                    Close dialog 2
                </StyledButton>
            </div>

            <div className='mt-4 grid gap-6'>
                <div className='text-sm text-delta-600'>
                    Dialog widths are calculated from the stack provider and update with the window width.
                </div>
                <div className='text-xs text-delta-500'>
                    dialog1: {dialog1?.width ?? 0}px · dialog2: {dialog2?.width ?? 0}px
                </div>

                <DialogShell id='dialog1' title='Dialog 1' label='Adevinta ASA' contentTestId='dialog1-content' />
                <DialogShell id='dialog2' title='Dialog 2' label='Adevinta ASA' contentTestId='dialog2-content' />
            </div>
        </div>
    )
}

export const Default: Story = {
    render: () => (
        <DialogStackProvider>
            <StackStoryFrame />
        </DialogStackProvider>
    ),
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole('button', { name: 'Open dialog 1' }))
        await userEvent.click(canvas.getByRole('button', { name: 'Open dialog 2' }))

        await expect(canvas.getByTestId('dialog1-content')).toBeVisible()
        await expect(canvas.getByTestId('dialog2-content')).toBeVisible()

        const dialog2Minimize = getVisibleByTestId(canvas, 'toggle-minimize-btn', 1)
        await userEvent.click(dialog2Minimize)

        await expect(canvas.getByTestId('dialog2-stack')).toBeVisible()
        await expect(canvas.getByTestId('dialog2-content').parentElement?.parentElement).toHaveClass(/hidden/i)

        const dialog2Expand = getVisibleByTestId(canvas, 'toggle-minimize-btn', 1)
        await userEvent.click(dialog2Expand)

        await expect(canvas.getByTestId('dialog2-content').parentElement?.parentElement).not.toHaveClass(/hidden/i)
        await expect(canvas.getByTestId('dialog2-content')).toBeVisible()
    },
}

export const ClosingParentClosesDependentDialog: Story = {
    render: () => (
        <DialogStackProvider>
            <StackStoryFrame />
        </DialogStackProvider>
    ),
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole('button', { name: 'Open dialog 1' }))
        await userEvent.click(canvas.getByRole('button', { name: 'Open dialog 2' }))

        await expect(canvas.getByTestId('dialog1-content')).toBeVisible()
        await expect(canvas.getByTestId('dialog2-content')).toBeVisible()

        await userEvent.click(canvas.getByTestId('close-dialog-1'))

        await expect(canvas.queryByTestId('dialog1-content')).not.toBeInTheDocument()
        await expect(canvas.queryByTestId('dialog2-content')).not.toBeInTheDocument()
    },
}

export const OpenCloseIndividually: Story = {
    render: () => (
        <DialogStackProvider>
            <StackStoryFrame />
        </DialogStackProvider>
    ),
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole('button', { name: 'Open dialog 1' }))
        await expect(canvas.getByTestId('dialog1-content')).toBeVisible()

        await userEvent.click(canvas.getByTestId('close-dialog-1'))
        await userEvent.click(canvas.getByRole('button', { name: 'Close dialog 1' }))
        await expect(canvas.queryByTestId('dialog1-content')).not.toBeInTheDocument()

        await userEvent.click(canvas.getByRole('button', { name: 'Open dialog 2' }))
        await expect(canvas.getByTestId('dialog2-content')).toBeVisible()

        await userEvent.click(canvas.getByRole('button', { name: 'Close dialog 2' }))
        await expect(canvas.queryByTestId('dialog2-content')).not.toBeInTheDocument()
    },
}
