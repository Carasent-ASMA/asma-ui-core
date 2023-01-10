import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { CheckBox as CheckBoxComponent } from './CheckBox'

const meta: ComponentMeta<typeof CheckBoxComponent> = {
    title: 'CheckBox',
    parameters: { actions: { argTypesRegex: '^on.*' } },
    argTypes: { onClick: { action: 'clicked' } },
}

export default meta

const Template: ComponentStory<typeof CheckBoxComponent> = (args) => <CheckBoxComponent {...args} />

export const CheckBox = Template.bind({})

CheckBox.args = {
    checked: true,
    title: 'Title',
}
