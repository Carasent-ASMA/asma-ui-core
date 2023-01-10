import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { TextAreaField as TextAreaFieldComponent } from './TextAreaField'

const meta: ComponentMeta<typeof TextAreaFieldComponent> = {
    title: 'TextAreaField',
    argTypes: {
        onChange: { action: 'changed' },
    },
}

export default meta

const Template: ComponentStory<typeof TextAreaFieldComponent> = (args) => <TextAreaFieldComponent {...args} />

export const TextAreaField = Template.bind({})

TextAreaField.args = {
    value: 'Value',
    label: 'Label',
    error: 'Error',
    is_error: false,
    is_warning: false,
}
