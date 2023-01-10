import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { SelectField as SelectFieldComponent } from './SelectField'

const meta: ComponentMeta<typeof SelectFieldComponent> = {
    title: 'SelectField',
    argTypes: {
        onChange: { action: 'changed' },
    },
}

export default meta

const Template: ComponentStory<typeof SelectFieldComponent> = (args) => <SelectFieldComponent {...args} />

export const SelectField = Template.bind({})

SelectField.args = {
    lists: ['first', 'second'],
    translate: false,
    label: 'Label',
    error: 'Error',
    is_error: false,
    is_warning: false,
    background: '',
}
