import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { PrimaryTimeFieldMobile as PrimaryTimeFieldMobileComponent } from './PrimaryTimeFieldMobile'

const meta: ComponentMeta<typeof PrimaryTimeFieldMobileComponent> = {
    title: 'PrimaryTimeFieldMobile',
    argTypes: {
        onChange: { action: 'changed' },
    },
}

export default meta

const Template: ComponentStory<typeof PrimaryTimeFieldMobileComponent> = (args) => (
    <PrimaryTimeFieldMobileComponent {...args} />
)

export const PrimaryTimeFieldMobile = Template.bind({})

PrimaryTimeFieldMobile.args = {
    label: 'Label',
    // value: new Date(),s
    error: 'Error',
    is_error: false,
    is_warning: false,
}
