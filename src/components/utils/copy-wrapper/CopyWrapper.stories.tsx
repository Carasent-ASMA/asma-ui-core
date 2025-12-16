import type { Meta, StoryObj } from '@storybook/react-vite'
import { CopyWrapper } from './CopyWrapper'
import { CopyButton } from './CopyButton'
import { SnackbarProvider, message } from 'src/components/feedback/snack-bar'

const meta: Meta<typeof CopyWrapper> = {
    title: 'Utils/Copy Wrapper',
    component: CopyWrapper,
    tags: ['autodocs'],
    args: {},
}

export default meta

type Story = StoryObj<typeof CopyWrapper>

export const CopyWrapperStory: Story = {
    args: { ...meta.args },
    render: () => <CopyWrapperExample />,
}

const CopyWrapperExample = () => {
    return (
        <SnackbarProvider>
            <div className='flex w-full flex-col items-center gap-8'>
                <CopyWrapper locale='en' contentToCopy='something' messageInfo={message.info}>
                    something
                </CopyWrapper>

                <CopyButton locale='no' contentToCopy='test' messageInfo={message.info} />
            </div>
        </SnackbarProvider>
    )
}
