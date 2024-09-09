import type { Meta } from '@storybook/react'
import { StyledWidget } from '../StyledWidget'
import { InboxOutboxOutlineIcon } from 'src/components/icons'

const meta: Meta = {
    title: 'Widgets/Widget',
    component: StyledWidget,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledWidget>

export default meta

export const Widget = () => {
    return (
        <div className='flex flex-row gap-4 p-4 '>
            <div className='flex flex-col gap-4 flex-1 '>
                <StyledWidget
                    title='Widget name'
                    icon={<InboxOutboxOutlineIcon width={24} height={24} />}
                    viewMore={{ disabled: true, hide: false, onClick: () => console.log('Click on viewMore button') }}
                    link={{ hide: false, content: 'Go to Somewhere', onClick: () => console.log('Click on link') }}
                    persistKey='widget-1'
                    isEmpty={true}
                    isLoading={false}
                    emptyText='No data'
                >
                    <div className='h-full rounded-lg bg-gray-200'></div>
                </StyledWidget>

                <StyledWidget
                    title='Widget name'
                    icon={<InboxOutboxOutlineIcon width={24} height={24} />}
                    viewMore={{ hide: false, onClick: () => console.log('Click on viewMore button') }}
                    link={{ hide: false, content: 'Go to Somewhere', onClick: () => console.log('Click on link') }}
                    isEmpty={false}
                    isLoading={true}
                    emptyText='No data'
                >
                    <div className='h-full rounded-lg bg-gray-200'></div>
                </StyledWidget>
            </div>

            <div className='flex flex-col gap-4 w-[400px] '>
                <StyledWidget
                    title='Widget name'
                    icon={<InboxOutboxOutlineIcon width={24} height={24} />}
                    viewMore={{ hide: false, onClick: () => console.log('Click on viewMore button') }}
                    link={{ hide: false, content: 'Go to Somewhere', onClick: () => console.log('Click on link') }}
                    isEmpty={false}
                    isLoading={true}
                    emptyText='No data'
                >
                    <div className='h-full rounded-lg bg-gray-200'></div>
                </StyledWidget>

                <StyledWidget
                    title='Widget name'
                    icon={<InboxOutboxOutlineIcon width={24} height={24} />}
                    viewMore={{ hide: false, onClick: () => console.log('Click on viewMore button') }}
                    link={{ hide: false, content: 'Go to Somewhere', onClick: () => console.log('Click on link') }}
                    isEmpty={false}
                    isLoading={false}
                    emptyText='No data'
                >
                    <div className='h-full rounded-lg bg-gray-200'>Content</div>
                </StyledWidget>
            </div>
        </div>
    )
}
