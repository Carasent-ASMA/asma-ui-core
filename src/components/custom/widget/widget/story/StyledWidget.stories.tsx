import type { Meta } from '@storybook/react-vite'
import { StyledWidget } from '../StyledWidget'
import { InboxOutboxOutlineIcon } from 'src/components/icons'
import { useState } from 'react'

const meta: Meta = {
    title: 'Widgets/Widget',
    component: StyledWidget,
    tags: [],
    argTypes: {},
    args: {},
} satisfies Meta<typeof StyledWidget>

export default meta

export const Widget = (): JSX.Element => {
    const [viewMore, setViewMore] = useState(false)

    return (
        <div className='flex flex-row gap-4 p-4'>
            <div className='flex flex-1 flex-col gap-4'>
                <StyledWidget
                    title='Widget without footer'
                    icon={<InboxOutboxOutlineIcon width={24} height={24} />}
                    persistKey='widget-1'
                    isEmpty={true}
                    isLoading={false}
                    emptyText='No data'
                    headerRight={<div>{'something here'}</div>}
                >
                    <div className='h-full rounded-lg bg-gray-200'></div>
                </StyledWidget>
                <StyledWidget
                    title='Widget name'
                    icon={<InboxOutboxOutlineIcon width={24} height={24} />}
                    viewMore={{
                        viewLessText: 'View less',
                        viewMoreText: 'View more',
                        disabled: true,
                        hide: false,
                        onClick: () => console.log('Click on viewMore button'),
                    }}
                    link={{ hide: false, content: 'Go to Somewhere', onClick: () => console.log('Click on link') }}
                    persistKey='widget-1'
                    isEmpty={true}
                    isLoading={false}
                    emptyText='No data'
                    headerRight={<div>{'something here'}</div>}
                >
                    <div className='h-full rounded-lg bg-gray-200'></div>
                </StyledWidget>
                <StyledWidget
                    title='Widget name'
                    icon={<InboxOutboxOutlineIcon width={24} height={24} />}
                    viewMore={{
                        viewLessText: 'View less',
                        viewMoreText: 'View more',
                        disabled: true,
                        hide: false,
                        onClick: () => console.log('Click on viewMore button'),
                    }}
                    link={{ hide: false, content: 'Go to Somewhere', onClick: () => console.log('Click on link') }}
                    persistKey='widget-1'
                    isEmpty={true}
                    isLoading={false}
                    emptyText='No data'
                    headerRight={<div>{'something here'}</div>}
                >
                    <div className='h-full rounded-lg bg-gray-200'></div>
                </StyledWidget>

                <StyledWidget
                    title='Widget name'
                    persistKey='test'
                    icon={<InboxOutboxOutlineIcon width={24} height={24} />}
                    viewMore={{
                        viewLessText: 'View less',
                        viewMoreText: 'View more',
                        hide: false,
                        onClick: () => {
                            localStorage.setItem('test', localStorage.getItem('test') !== 'true' ? 'false' : 'true')
                            setViewMore((prev) => !prev)
                        },
                    }}
                    link={{ hide: false, content: 'Go to Somewhere', onClick: () => console.log('Click on link') }}
                    isEmpty={false}
                    isLoading={false}
                    emptyText='No data'
                >
                    <div className='flex h-full flex-col gap-2 rounded-lg'>
                        {[...Array(20).keys()].slice(0, viewMore ? 20 : 5).map((k) => (
                            <span key={k}>test</span>
                        ))}
                    </div>
                </StyledWidget>
            </div>

            <div className='flex w-[400px] flex-col gap-4'>
                <StyledWidget
                    title='Widget name'
                    icon={<InboxOutboxOutlineIcon width={24} height={24} />}
                    viewMore={{
                        viewLessText: 'View less',
                        viewMoreText: 'View more',
                        hide: false,
                        onClick: () => console.log('Click on viewMore button'),
                    }}
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
                    viewMore={{
                        viewLessText: 'View less',
                        viewMoreText: 'View more',
                        hide: false,
                        onClick: () => console.log('Click on viewMore button'),
                    }}
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
