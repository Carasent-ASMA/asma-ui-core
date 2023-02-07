import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { FlatButton as FlatButtonComponent } from './FlatButton'

const meta: ComponentMeta<typeof FlatButtonComponent> = {
    title: 'FlatButton',
    parameters: {
        actions: { argTypesRegex: '^on.*' },
    },
    argTypes: {
        onClick: { action: 'clicked' },
    },
}

export default meta

const Template: ComponentStory<typeof FlatButtonComponent> = (args) => <FlatButtonComponent {...args} />

export const FlatButton = Template.bind({})

FlatButton.args = {
    icon: undefined,
    text: 'Title',
    className: '',
    textClassName: '',
    disabled: false,
}
