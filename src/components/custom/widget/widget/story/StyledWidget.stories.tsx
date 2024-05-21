import type { Meta } from '@storybook/react'
import { StyledWidget } from '../StyledWidget'
import { InboxOutboxOutlineIcon } from 'asma-core-ui'
import styles from './StyledWidgetStories.module.scss'

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
        <div className={styles['page-wrapper']}>
            <div className={styles['column-wrapper']} style={{ width: '736px' }} >
                <StyledWidget
                    title='Widget name'
                    icon={<InboxOutboxOutlineIcon width={24} height={24} />}
                    viewMore={{ hide: false, onClick: () => console.log('Click on viewMore button') }}
                    link={{ hide: false, content: 'Go to Somewhere', onClick: () => console.log('Click on link') }}
                >
                    <div style={{ height: '100%', borderRadius: '8px', backgroundColor: '#F0F2F4' }}></div>
                </StyledWidget>

                <StyledWidget
                    title='Widget name'
                    icon={<InboxOutboxOutlineIcon width={24} height={24} />}
                    viewMore={{ hide: false, onClick: () => console.log('Click on viewMore button') }}
                    link={{ hide: false, content: 'Go to Somewhere', onClick: () => console.log('Click on link') }}
                >
                    <div style={{ height: '100%', borderRadius: '8px', backgroundColor: '#F0F2F4' }}></div>
                </StyledWidget>
            </div>

            <div className={styles['column-wrapper']} style={{ width: '400px' }}>
                <StyledWidget
                    title='Widget name'
                    icon={<InboxOutboxOutlineIcon width={24} height={24} />}
                    viewMore={{ hide: false, onClick: () => console.log('Click on viewMore button') }}
                    link={{ hide: false, content: 'Go to Somewhere', onClick: () => console.log('Click on link') }}
                >
                    <div style={{ height: '100%', borderRadius: '8px', backgroundColor: '#F0F2F4' }}></div>
                </StyledWidget>

                <StyledWidget
                    title='Widget name'
                    icon={<InboxOutboxOutlineIcon width={24} height={24} />}
                    viewMore={{ hide: false, onClick: () => console.log('Click on viewMore button') }}
                    link={{ hide: false, content: 'Go to Somewhere', onClick: () => console.log('Click on link') }}
                >
                    <div style={{ height: '100%', borderRadius: '8px', backgroundColor: '#F0F2F4' }}></div>
                </StyledWidget>
            </div>
        </div>
    )
}
