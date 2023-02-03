import type { ComponentMeta, ComponentStory } from '@storybook/react'
import { Button } from '../Button'
import { Badge } from './Badge'
import { Badge as AntdBadge } from 'antd'
import styles from './Badge.stories.module.scss'

export default {
    title: 'Badge',
    component: Badge,
} as ComponentMeta<typeof Badge>

const Template: ComponentStory<typeof Badge> = (args) => (
    <div className={styles['module']}>
        <div className={styles['container']}>
            <Badge {...args}>
                <Button title='dynamic example' />
            </Badge>
            <Badge {...args} count={5}>
                <Button title='example' />
            </Badge>
            <Badge {...args} count={12}>
                <Button title='example' />
            </Badge>
            <Badge {...args} count={98}>
                <Button title='example' />
            </Badge>
            <Badge {...args} count={999} dot={false}>
                <Button title='example' />
            </Badge>
            <AntdBadge {...args}>
                <Button title='antd default' />
            </AntdBadge>
        </div>
        <div className={styles['description']}>size: small | default</div>
    </div>
)

export const Default = Template.bind({})
Default.args = {
    size: 'default',
    count: '13',
    showZero: false,
    dot: false,
    offset: [0, 0],
    overflowCount: 999,
    title: '',
}
