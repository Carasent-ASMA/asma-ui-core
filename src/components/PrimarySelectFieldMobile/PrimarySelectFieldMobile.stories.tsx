import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { PrimarySelectFieldMobile as PrimarySelectFieldMobileComponent } from './PrimarySelectFieldMobile'

const meta: ComponentMeta<typeof PrimarySelectFieldMobileComponent> = {
    title: 'PrimarySelectFieldMobile',
    argTypes: {
        onChange: { action: 'changed' },
    },
}

export default meta

const Template: ComponentStory<typeof PrimarySelectFieldMobileComponent> = (args) => (
    <PrimarySelectFieldMobileComponent {...args} />
)

export const PrimarySelectFieldMobile = Template.bind({})

PrimarySelectFieldMobile.args = {
    lists: ['first', 'second'],
    translate: false,
    label: 'Label',
    error: 'Error',
    is_error: false,
    is_warning: false,
    background: '',
}
