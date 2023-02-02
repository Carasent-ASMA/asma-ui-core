import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { PrimaryInputField as PrimaryInputFieldComponent } from './PrimaryInputField'

const meta: ComponentMeta<typeof PrimaryInputFieldComponent> = {
    title: 'PrimaryInputField',
    parameters: { actions: { argTypesRegex: '^on.*' } },
    argTypes: {
        onClick: { action: 'clicked' },
        onBlur: { action: 'blured' },
        onFocus: { action: 'focused' },
    },
}

export default meta

const Template: ComponentStory<typeof PrimaryInputFieldComponent> = (args) => <PrimaryInputFieldComponent {...args} />

export const PrimaryInputField = Template.bind({})

PrimaryInputField.args = {
    label: 'Label',
    error: 'Some error',
    value: 'Value',
    placeholder: 'Placeholder',
}
