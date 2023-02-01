import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { PrimaryTextAreaField as PrimaryTextAreaFieldComponent } from './PrimaryTextAreaField'

const meta: ComponentMeta<typeof PrimaryTextAreaFieldComponent> = {
    title: 'PrimaryTextAreaField',
    argTypes: {
        onChange: { action: 'changed' },
    },
}

export default meta

const Template: ComponentStory<typeof PrimaryTextAreaFieldComponent> = (args) => (
    <PrimaryTextAreaFieldComponent {...args} />
)

export const PrimaryTextAreaField = Template.bind({})

PrimaryTextAreaField.args = {
    value: 'Value',
    label: 'Label',
    error: 'Error',
}
