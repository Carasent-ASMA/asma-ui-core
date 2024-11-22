import { useState } from 'react'
import { MinimizableDialog } from '../MinimizableDialog'
import { StyledButton } from 'src/components/inputs/button'
import { StyledSelectExample } from 'src/components/inputs/select/story/components/StyledSelectExample'
import { cn } from 'src/helpers/cn'

const meta = {
    title: 'Feedback/Dialog Minimizable',
}

export default meta

export const DialogMinimizable = () => {
    const [open, setOpen] = useState(false)

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <div>
            <StyledButton dataTest='open-minimize-dialog-button' onClick={() => setOpen(true)}>
                Open minimizable dialog
            </StyledButton>
            <MinimizableDialog
                dataTest='test'
                // onCloseText='Close'
                // onMinimizeText='Minimize'
                // onExpandText='Expand'
                // onFullScreenText='Full screen'
                title='Ny stilling og utplassering'
                open={open}
                onClose={handleClose}
                label='Adevinta ASA'
                // className='w-[600px] max-h-[800px]'
                className={cn('max-h-[calc(100vh-100px)] w-fit', 'min-w-[850px] max-w-[850px]')}
                primaryButtonText='Save'
                onPrimaryButtonClick={handleClose}
                secondaryButtonText='Cancel'
                onSecondaryButtonClick={handleClose}
                actionNode={
                    <StyledButton dataTest='edit-button' variant='text'>
                        Edit
                    </StyledButton>
                }
                // extraActionsText='More Actions'
                // extraActions={[
                //     { label: 'Duplicate', onClick: () => console.log('duplicate') },
                //     { label: 'Delete', className: 'text-red-500', onClick: () => console.log('delete') },
                // ]}
                btnContainerClassName='w-full'
                footerClassName='gap-2 pl-8'
                footerInfo={
                    <div className='flex items-center justify-between gap-4 w-full'>
                        <div className='flex flex-col gap-0.5'>
                            <span className='text-delta-800 text-sm font-semibold'>Sist optdatert</span>
                            <span className='text-sm'>03.04.2024 kl. 14.13</span>
                            <span className='text-sm'>av KristianAO</span>
                        </div>

                        <div className='flex flex-col gap-1'>
                            <span className='text-delta-800 text-sm font-semibold'>Lagt til i registeret</span>
                            <span className='text-sm'>05.04.2024 kl. 14.13</span>
                            <span className='text-sm'>av Kristian Thyholdt</span>
                        </div>
                    </div>
                }
            >
                {(props) => (
                    <>
                        <div className='text-delta-800 px-4'>{JSON.stringify(props)}</div>
                        <div className='flex flex-col gap-y-3 max-h-[400px] p-4 overflow-y-scroll'>
                            <div>
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
                                has been the industry's standard dummy text ever since the 1500s, when an unknown
                                printer took a galley of type and scrambled it to make a type specimen book. It has
                                survived not only five centuries, but also the leap into electronic typesetting,
                                remaining essentially unchanged. It was popularised in the 1960s with the release of
                                Letraset sheets containing Lorem Ipsum passages, and more recently with desktop
                                publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                            </div>
                            <StyledSelectExample />
                            <div>
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
                                has been the industry's standard dummy text ever since the 1500s, when an unknown
                                printer took a galley of type and scrambled it to make a type specimen book. It has
                                survived not only five centuries, but also the leap into electronic typesetting,
                                remaining essentially unchanged. It was popularised in the 1960s with the release of
                                Letraset sheets containing Lorem Ipsum passages, and more recently with desktop
                                publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                            </div>
                            <div>
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
                                has been the industry's standard dummy text ever since the 1500s, when an unknown
                                printer took a galley of type and scrambled it to make a type specimen book. It has
                                survived not only five centuries, but also the leap into electronic typesetting,
                                remaining essentially unchanged. It was popularised in the 1960s with the release of
                                Letraset sheets containing Lorem Ipsum passages, and more recently with desktop
                                publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                            </div>
                            <StyledSelectExample />
                            <div>
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
                                has been the industry's standard dummy text ever since the 1500s, when an unknown
                                printer took a galley of type and scrambled it to make a type specimen book. It has
                                survived not only five centuries, but also the leap into electronic typesetting,
                                remaining essentially unchanged. It was popularised in the 1960s with the release of
                                Letraset sheets containing Lorem Ipsum passages, and more recently with desktop
                                publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                            </div>
                            <div>
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
                                has been the industry's standard dummy text ever since the 1500s, when an unknown
                                printer took a galley of type and scrambled it to make a type specimen book. It has
                                survived not only five centuries, but also the leap into electronic typesetting,
                                remaining essentially unchanged. It was popularised in the 1960s with the release of
                                Letraset sheets containing Lorem Ipsum passages, and more recently with desktop
                                publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                            </div>
                        </div>
                    </>
                )}
            </MinimizableDialog>
        </div>
    )
}
