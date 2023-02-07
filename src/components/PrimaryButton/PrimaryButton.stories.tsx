import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { PrimaryButton as PrimaryButtonComponent } from './PrimaryButton'

const meta: ComponentMeta<typeof PrimaryButtonComponent> = {
    title: 'PrimaryButton',
    parameters: {
        actions: { argTypesRegex: '^on.*' },
    },
    argTypes: {
        onClick: { action: 'clicked' },
    },
}

export default meta

const Template: ComponentStory<typeof PrimaryButtonComponent> = (args) => <PrimaryButtonComponent {...args} />

export const PrimaryButton = Template.bind({})

PrimaryButton.args = {
    icon: undefined,
    text: 'Title',
    className: '',
    textClassName: '',
    disabled: false,
}
