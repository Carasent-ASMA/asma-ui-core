import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { Button as ButtonComponent } from './Button'

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
        <ButtonComponent {...args} data-test='example-btn'>
            <span>Primary</span>
        </ButtonComponent>
    )
}

export const Default = Template.bind({})

Default.args = {
    className: '',
    disabled: false,
    size: 'large',
}
