import { StyledButton } from 'src/components/inputs/button'
import { StyledSelectExample } from 'src/components/inputs/select/story/components/StyledSelectExample'
import { MinimizableDialogV2 } from '../v2/MinimizableDialogV2'
import { StyledInputField, createDialogStack } from 'src'

const meta = {
    title: 'Feedback/Dialog Minimizable Stack',
}

export default meta

export const DialogMinimizableStack = () => {
    return (
        <DialogStackProvider>
            <Buttons />
            <Content />
        </DialogStackProvider>
    )
}

const Buttons = () => {
    const { openDialog } = useDialogStack()

    return (
        <div className='flex items-center gap-x-2'>
            <StyledButton dataTest='open-dialog-1' variant='outlined' onClick={() => openDialog('dialog1')}>
                Open dialog 1
            </StyledButton>
            <StyledButton dataTest='open-dialog-2' variant='outlined' onClick={() => openDialog('dialog2')}>
                Open dialog 2
            </StyledButton>
        </div>
    )
}

const Content = () => {
    const { closeDialog, getDialogState } = useDialogStack()

    const dialog1 = getDialogState('dialog1')

    const styleDialog1: React.CSSProperties | undefined = {
        '--dialog-right': `${dialog1?.position.right}px`,
        width: `${dialog1?.width}px`,
    } as React.CSSProperties

    const dialog2 = getDialogState('dialog2')

    const styleDialog2: React.CSSProperties | undefined = {
        '--dialog-right': `${dialog2?.position.right}px`,
        width: `${dialog2?.width}px`,
    } as React.CSSProperties

    return (
        <>
            <MinimizableDialogV2
                dataTest='test'
                title='Dialog 1'
                open={!!dialog1?.open}
                onClose={() => closeDialog('dialog1')}
                label='Adevinta ASA'
                actionNode={
                    <StyledButton dataTest='edit-button' variant='text'>
                        Edit
                    </StyledButton>
                }
                style={styleDialog1}
                classNameOverrides={{
                    maximized: 'max-w-[600px]',
                    fullscreen: 'max-w-[1000px]',
                }}
            >
                <>
                    <div className='flex flex-grow flex-col gap-y-3 overflow-auto px-4'>
                        <div>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
                            been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
                            galley of type and scrambled it to make a type specimen book. It has survived not only five
                            centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum
                            passages, and more recently with desktop publishing software like Aldus PageMaker including
                            versions of Lorem Ipsum.
                        </div>
                        <StyledSelectExample />
                        <StyledInputField dataTest='input' />
                        <div>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
                            been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
                            galley of type and scrambled it to make a type specimen book. It has survived not only five
                            centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum
                            passages, and more recently with desktop publishing software like Aldus PageMaker including
                            versions of Lorem Ipsum.
                        </div>
                        <div>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
                            been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
                            galley of type and scrambled it to make a type specimen book. It has survived not only five
                            centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum
                            passages, and more recently with desktop publishing software like Aldus PageMaker including
                            versions of Lorem Ipsum.
                        </div>
                        <StyledSelectExample />
                        <div>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
                            been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
                            galley of type and scrambled it to make a type specimen book. It has survived not only five
                            centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum
                            passages, and more recently with desktop publishing software like Aldus PageMaker including
                            versions of Lorem Ipsum.
                        </div>
                        <div>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
                            been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
                            galley of type and scrambled it to make a type specimen book. It has survived not only five
                            centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum
                            passages, and more recently with desktop publishing software like Aldus PageMaker including
                            versions of Lorem Ipsum.
                        </div>
                    </div>
                    {/* Footer */}
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
                            <StyledButton
                                dataTest='cancel-btn'
                                variant='outlined'
                                onClick={() => closeDialog('dialog1')}
                            >
                                Cancel
                            </StyledButton>
                            <StyledButton dataTest='save-btn' onClick={() => closeDialog('dialog1')}>
                                Save
                            </StyledButton>
                        </div>
                    </div>
                </>
            </MinimizableDialogV2>
            <MinimizableDialogV2
                dataTest='test'
                title='Dialog 2'
                open={!!dialog2?.open}
                onClose={() => closeDialog('dialog2')}
                style={styleDialog2}
                label='Adevinta ASA'
                actionNode={
                    <StyledButton dataTest='edit-button' variant='text'>
                        Edit
                    </StyledButton>
                }
                classNameOverrides={{
                    maximized: 'max-w-[600px]',
                    fullscreen: 'max-w-[1000px]',
                }}
            >
                <>
                    <div className='flex flex-grow flex-col gap-y-3 overflow-auto px-4'>
                        <div>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
                            been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
                            galley of type and scrambled it to make a type specimen book. It has survived not only five
                            centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum
                            passages, and more recently with desktop publishing software like Aldus PageMaker including
                            versions of Lorem Ipsum.
                        </div>
                        <StyledSelectExample />
                        <StyledInputField dataTest='input' />
                        <div>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
                            been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
                            galley of type and scrambled it to make a type specimen book. It has survived not only five
                            centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum
                            passages, and more recently with desktop publishing software like Aldus PageMaker including
                            versions of Lorem Ipsum.
                        </div>
                        <div>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
                            been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
                            galley of type and scrambled it to make a type specimen book. It has survived not only five
                            centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum
                            passages, and more recently with desktop publishing software like Aldus PageMaker including
                            versions of Lorem Ipsum.
                        </div>
                        <StyledSelectExample />
                        <div>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
                            been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
                            galley of type and scrambled it to make a type specimen book. It has survived not only five
                            centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum
                            passages, and more recently with desktop publishing software like Aldus PageMaker including
                            versions of Lorem Ipsum.
                        </div>
                        <div>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
                            been the industry's standard dummy text ever since the 1500s, when an unknown printer took a
                            galley of type and scrambled it to make a type specimen book. It has survived not only five
                            centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                            It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum
                            passages, and more recently with desktop publishing software like Aldus PageMaker including
                            versions of Lorem Ipsum.
                        </div>
                    </div>
                    {/* Footer */}
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
                            <StyledButton
                                dataTest='cancel-btn'
                                variant='outlined'
                                onClick={() => closeDialog('dialog2')}
                            >
                                Cancel
                            </StyledButton>
                            <StyledButton dataTest='save-btn' onClick={() => closeDialog('dialog2')}>
                                Save
                            </StyledButton>
                        </div>
                    </div>
                </>
            </MinimizableDialogV2>
        </>
    )
}

const config = {
    dialog1: { order: 1 },
    dialog2: { order: 2 },
} as const

export type DialogConfig = typeof config

const { DialogStackProvider, useDialogStack } = createDialogStack<DialogConfig>({
    config,
})
