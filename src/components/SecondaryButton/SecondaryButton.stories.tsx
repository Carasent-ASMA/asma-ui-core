import 'antd/dist/antd.css'

import type { ComponentMeta, ComponentStory } from '@storybook/react'

import { SecondaryButton as SecondaryButtonComponent } from './SecondaryButton'

const meta: ComponentMeta<typeof SecondaryButtonComponent> = {
    title: 'SecondaryButton',
    parameters: {
        actions: { argTypesRegex: '^on.*' },
    },
    argTypes: {
        onClick: { action: 'clicked' },
    },
}

export default meta

const Template: ComponentStory<typeof SecondaryButtonComponent> = (args) => <SecondaryButtonComponent {...args} />

export const SecondaryButton = Template.bind({})

SecondaryButton.args = {
    icon: undefined,
    text: 'Title',
    className: '',
    textClassName: '',
    disabled: false,
}
