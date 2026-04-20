import type { Meta, StoryObj } from '@storybook/react-vite'
import { closeSnackbar, enqueueSnackbar, SnackbarProvider } from 'notistack'
import type { ReactNode } from 'react'
import { CopyButton } from './CopyButton'
import { CopyWrapper, type MessageProps } from './CopyWrapper'

const meta: Meta<typeof CopyWrapper> = {
    title: 'Utils/Copy Wrapper',
    component: CopyWrapper,
    tags: ['autodocs'],
    args: {},
}

export default meta

type Story = StoryObj<typeof CopyWrapper>

function processMessageInfo(messageInfo: string | ReactNode, options?: MessageProps): () => void {
    enqueueSnackbar({
        variant: 'info',
        message: messageInfo,
        autoHideDuration: 6000,
        className: 'bg-gama-700 text-white !min-w-[100px] !max-w-[400px] rounded-md p-4 flex items-center',
        anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'center',
        },
        ...options,
    })

    return () => {
        return closeSnackbar(options?.id)
    }
}

export const CopyWrapperStory: Story = {
    args: { ...meta.args },
    render: () => <CopyWrapperExample />,
}

const CopyWrapperExample = () => {
    return (
        <SnackbarProvider>
            <div className='flex w-full flex-col items-center gap-8'>
                <CopyWrapper locale='en' contentToCopy='something' messageInfo={processMessageInfo}>
                    something
                </CopyWrapper>

                <CopyButton locale='no' contentToCopy='test' messageInfo={processMessageInfo} />
            </div>
        </SnackbarProvider>
    )
}
