import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { PrimaryDateField as PrimaryDateFieldComponent, dateField_DefaultFormat } from './PrimaryDateField'

const meta: ComponentMeta<typeof PrimaryDateFieldComponent> = {
    title: 'PrimaryDateField',
    parameters: { actions: { argTypesRegex: '^on.*' } },
    argTypes: {
        onClick: { action: 'clicked' },
        onChange: { action: 'changed' },
        onBlur: { action: 'blured' },
        onFocus: { action: 'focused' },
        // locale: {
        //     control: 'select',
        //     options: ['English', 'Norsk'],
        //     mapping: {
        //         English: en_GB,
        //         Norsk: nb_NO,
        //     },
        // },
    },
}

export default meta

const Template: ComponentStory<typeof PrimaryDateFieldComponent> = (args) => <PrimaryDateFieldComponent {...args} />

export const PrimaryDateField = Template.bind({})

PrimaryDateField.args = {
    format: dateField_DefaultFormat,
    label: 'Label',
    error: 'Some error',
    placeholder: 'Placeholder',
}
