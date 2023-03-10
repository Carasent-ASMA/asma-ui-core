import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { Button as ButtonComponent } from './Button'
import styles from './Button.stories.module.scss'

export default {
    title: 'Button',
    component: ButtonComponent,
    argTypes: {
        innerRef: {
            control: false,
        },
    },
} as ComponentMeta<typeof ButtonComponent>

const Template: ComponentStory<typeof ButtonComponent> = (args) => {
    return (
        <div className={styles['buttons-container']}>
            <ButtonComponent {...args} data-test='example-btn'>
                <span>Primary</span>
            </ButtonComponent>
            <ButtonComponent {...args} size='small' data-test='example-btn'>
                <span>Primary</span>
            </ButtonComponent>
        </div>
    )
}

export const Default = Template.bind({})

Default.args = {
    className: '',
    disabled: false,
    size: 'large',
}
