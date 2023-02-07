import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { BasicButton as BasicButtonComponent } from './BasicButton'

const meta: ComponentMeta<typeof BasicButtonComponent> = {
    title: 'BasicButton',
    parameters: {
        actions: { argTypesRegex: '^on.*' },
    },
    argTypes: {
        onClick: { action: 'clicked' },
    },
}

export default meta

const Template: ComponentStory<typeof BasicButtonComponent> = (args) => <BasicButtonComponent {...args} />

export const BasicButton = Template.bind({})

BasicButton.args = {
    icon: undefined,
    text: 'Title',
    className: '',
    textClassName: '',
    disabled: false,
}
