import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { IconPositionEnum, InputField as InputFieldComponent } from './InputField'

const meta: ComponentMeta<typeof InputFieldComponent> = {
    title: 'InputField',
    parameters: { actions: { argTypesRegex: '^on.*' } },
    argTypes: {
        onClick: { action: 'clicked' },
        onBlur: { action: 'blured' },
        onFocus: { action: 'focused' },
        iconPosition: {
            control: 'select',
            options: ['Prefix', 'Suffix', 'Both'],
            mapping: {
                Prefix: IconPositionEnum.Prefix,
                Suffix: IconPositionEnum.Suffix,
                Both: IconPositionEnum.Both,
            },
        },
    },
}

export default meta

const Template: ComponentStory<typeof InputFieldComponent> = (args) => <InputFieldComponent {...args} />

export const InputField = Template.bind({})

InputField.args = {
    icon_style: '',
    icon: '',
    label: 'Label',
    error: 'Some error',
    value: 'Value',
    is_error: false,
    is_warning: false,
    iconPosition: IconPositionEnum.Prefix,
}
