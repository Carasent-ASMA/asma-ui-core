import { useState } from 'react'
import { StyledButton } from 'src/components/inputs/button'
import { StyledSelectExample } from 'src/components/inputs/select/story/components/StyledSelectExample'
import { MinimizableDialogV2 } from '../MinimizableDialogV2'

const meta = {
    title: 'Feedback/Dialog Minimizable V2',
}

export default meta

export const DialogMinimizableV2 = () => {
    const [open, setOpen] = useState(false)

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <div>
            <StyledButton dataTest='open-minimize-dialog-button' onClick={() => setOpen(true)}>
                Open minimizable dialog v2
            </StyledButton>
            <MinimizableDialogV2
                dataTest='test'
                title='Ny stilling og utplassering Ny stilling og utplassering Ny stilling og utplassering'
                open={open}
                onClose={handleClose}
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
                    <div className='flex-grow flex flex-col gap-y-3 overflow-auto px-4'>
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
                    <div className='flex-none flex items-center justify-between gap-4 p-4 flex-wrap'>
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
                        <div className='flex items-center gap-x-2'>
                            <StyledButton dataTest='cancel-btn' variant='outlined' onClick={handleClose}>
                                Cancel
                            </StyledButton>
                            <StyledButton dataTest='save-btn' onClick={handleClose}>
                                Save
                            </StyledButton>
                        </div>
                    </div>
                </>
            </MinimizableDialogV2>
        </div>
    )
}
